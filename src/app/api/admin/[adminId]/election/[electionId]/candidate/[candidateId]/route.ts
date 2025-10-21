import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { isAdminAuthorized } from "@/libs/auth-utils";

class CandidateRepository {
  private static createBaseQuery(candidateId: string, electionId: string) {
    return {
      where: {
        id: candidateId,
        election_id: electionId,
      },
    };
  }

  private static getPortfolioInclude(includeId: boolean = true) {
    return {
      portfolio: {
        select: {
          ...(includeId && { id: true }),
          title: true,
        },
      },
    };
  }

  static async findCandidateWithDetails(
    candidateId: string,
    electionId: string
  ) {
    return await prisma.candidates.findUnique({
      ...this.createBaseQuery(candidateId, electionId),
      include: {
        ...this.getPortfolioInclude(true),
        _count: {
          select: { votes: true },
        },
      },
    });
  }

  static async findCandidateForDeletion(
    candidateId: string,
    electionId: string
  ) {
    return await prisma.candidates.findUnique({
      ...this.createBaseQuery(candidateId, electionId),
      include: this.getPortfolioInclude(false),
    });
  }

  static async findBasicCandidate(candidateId: string) {
    return await prisma.candidates.findUnique({
      where: { id: candidateId },
      select: { full_name: true, portfolio_id: true },
    });
  }
}

// Shared context factory to eliminate duplication
class CandidateContextFactory {
  static createReadContext(params: {
    adminId: string;
    electionId: string;
    candidateId: string;
  }): CandidateContext {
    const { adminId, electionId, candidateId } = params;
    return { adminId, electionId, candidateId };
  }

  static createUpdateContext(
    params: { adminId: string; electionId: string; candidateId: string },
    updateData: CandidateUpdateData
  ): CandidateContext {
    const { adminId, electionId, candidateId } = params;
    return { adminId, electionId, candidateId, updateData };
  }
}

// Shared validation factory to eliminate strategy duplication
class ValidationStrategyFactory {
  static createReadValidationStrategies(): ValidationStrategy[] {
    return [
      new AdminAccessValidationStrategy(),
      new CandidateExistenceValidationStrategy(),
    ];
  }

  static createUpdateValidationStrategies(): ValidationStrategy[] {
    return [
      new AdminAccessValidationStrategy(),
      new CandidateExistenceValidationStrategy(),
      new PortfolioValidationStrategy(),
    ];
  }

  static createDeleteValidationStrategies(): ValidationStrategy[] {
    return [
      new AdminAccessValidationStrategy(),
      new CandidateExistenceValidationStrategy(),
    ];
  }
}

// Domain types to avoid primitive obsession
interface CandidateUpdateData {
  full_name?: string;
  photo_url?: string | null;
  manifesto?: string | null;
  portfolio_id?: string;
}

interface CandidateContext {
  adminId: string;
  electionId: string;
  candidateId: string;
  updateData?: CandidateUpdateData;
}

// Strategy Pattern: Validation strategies
interface ValidationStrategy {
  validate(context: CandidateContext): Promise<void>;
}

class AdminAccessValidationStrategy implements ValidationStrategy {
  async validate(context: CandidateContext): Promise<void> {
    const isAuthorized = await isAdminAuthorized(
      context.adminId,
      context.electionId
    );
    if (!isAuthorized) {
      throw new Error(
        "Unauthorized. Admin does not have access to this election."
      );
    }
  }
}

class CandidateExistenceValidationStrategy implements ValidationStrategy {
  async validate(context: CandidateContext): Promise<void> {
    const candidate = await CandidateRepository.findCandidateWithDetails(
      context.candidateId,
      context.electionId
    );

    if (!candidate) {
      throw new Error(
        "Candidate not found or does not belong to this election"
      );
    }
  }
}

class PortfolioValidationStrategy implements ValidationStrategy {
  async validate(context: CandidateContext): Promise<void> {
    if (!context.updateData?.portfolio_id) {
      return; // No portfolio validation needed
    }

    await this.validatePortfolioExists(context);
    await this.validateNoDuplicateName(context);
  }

  private async validatePortfolioExists(
    context: CandidateContext
  ): Promise<void> {
    const portfolio = await prisma.portfolios.findFirst({
      where: {
        id: context.updateData!.portfolio_id,
        election_id: context.electionId,
      },
    });

    if (!portfolio) {
      throw new Error(
        "Portfolio not found or does not belong to this election"
      );
    }
  }

  private async validateNoDuplicateName(
    context: CandidateContext
  ): Promise<void> {
    const existingCandidate = await this.getExistingCandidate(
      context.candidateId
    );

    if (!this.isPortfolioChanging(context, existingCandidate)) {
      return; // No portfolio change, no validation needed
    }

    const candidateName = this.getCandidateName(context, existingCandidate);
    await this.checkForDuplicateName(context, candidateName);
  }

  private async getExistingCandidate(candidateId: string) {
    return await CandidateRepository.findBasicCandidate(candidateId);
  }

  private isPortfolioChanging(
    context: CandidateContext,
    existingCandidate: any
  ): boolean {
    return (
      existingCandidate &&
      context.updateData!.portfolio_id !== existingCandidate.portfolio_id
    );
  }

  private getCandidateName(
    context: CandidateContext,
    existingCandidate: any
  ): string {
    return context.updateData!.full_name || existingCandidate.full_name;
  }

  private async checkForDuplicateName(
    context: CandidateContext,
    candidateName: string
  ): Promise<void> {
    const duplicateNameCheck = await prisma.candidates.findFirst({
      where: {
        portfolio_id: context.updateData!.portfolio_id,
        full_name: candidateName,
        id: { not: context.candidateId },
      },
    });

    if (duplicateNameCheck) {
      throw new Error(
        "A candidate with this name already exists in the selected portfolio"
      );
    }
  }
}

// Shared audit trail service to eliminate code duplication
class AuditTrailService {
  static async createCandidateAuditTrail(
    action: "UPDATE" | "DELETE",
    context: CandidateContext,
    candidate: any,
    additionalDetails?: string
  ): Promise<void> {
    const description =
      action === "UPDATE"
        ? `Admin ${context.adminId} updated candidate "${candidate.full_name}"`
        : `Admin ${context.adminId} deleted candidate "${candidate.full_name}" from portfolio "${candidate.portfolio.title}"`;

    const metadata: any = {
      entity_type: "CANDIDATE",
      entity_id: context.candidateId,
      description,
      portfolio_id: candidate.portfolio_id,
    };

    if (action === "UPDATE" && context.updateData) {
      metadata.updated_fields = JSON.stringify({
        full_name: context.updateData.full_name ? "Updated" : "Unchanged",
        photo_url:
          context.updateData.photo_url !== undefined ? "Updated" : "Unchanged",
        manifesto:
          context.updateData.manifesto !== undefined ? "Updated" : "Unchanged",
        portfolio_id: context.updateData.portfolio_id ? "Updated" : "Unchanged",
      });
    }

    await prisma.auditTrail.create({
      data: {
        action,
        user_id: context.adminId,
        election_id: context.electionId,
        metadata,
      },
    });
  }
}

// Command Pattern: Encapsulate operations
interface CandidateCommand {
  execute(): Promise<any>;
}

class GetCandidateCommand implements CandidateCommand {
  constructor(private context: CandidateContext) {}

  async execute(): Promise<any> {
    const validator = new CandidateValidator(
      ValidationStrategyFactory.createReadValidationStrategies()
    );

    await validator.validateAll(this.context);

    return await CandidateRepository.findCandidateWithDetails(
      this.context.candidateId,
      this.context.electionId
    );
  }
}

class UpdateCandidateCommand implements CandidateCommand {
  constructor(private context: CandidateContext) {}

  async execute(): Promise<any> {
    await this.validateUpdate();
    const updatedCandidate = await this.performUpdate();
    await this.createAuditTrail(updatedCandidate);
    return updatedCandidate;
  }

  private async validateUpdate(): Promise<void> {
    const validator = new CandidateValidator(
      ValidationStrategyFactory.createUpdateValidationStrategies()
    );

    await validator.validateAll(this.context);
  }

  private async performUpdate(): Promise<any> {
    return await prisma.candidates.update({
      where: {
        id: this.context.candidateId,
      },
      data: this.buildUpdateData(),
      include: {
        portfolio: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
    });
  }

  private buildUpdateData() {
    const { full_name, photo_url, manifesto, portfolio_id } =
      this.context.updateData!;

    const data: any = {};
    if (full_name) data.full_name = full_name;
    if (photo_url !== undefined) data.photo_url = photo_url;
    if (manifesto !== undefined) data.manifesto = manifesto;
    if (portfolio_id) data.portfolio_id = portfolio_id;

    return data;
  }

  private async createAuditTrail(updatedCandidate: any): Promise<void> {
    await AuditTrailService.createCandidateAuditTrail(
      "UPDATE",
      this.context,
      updatedCandidate
    );
  }
}

class DeleteCandidateCommand implements CandidateCommand {
  constructor(private context: CandidateContext) {}

  async execute(): Promise<any> {
    const validator = new CandidateValidator(
      ValidationStrategyFactory.createDeleteValidationStrategies()
    );

    await validator.validateAll(this.context);

    // Get candidate details before deletion for audit trail
    const existingCandidate =
      await CandidateRepository.findCandidateForDeletion(
        this.context.candidateId,
        this.context.electionId
      );

    await prisma.candidates.delete({
      where: {
        id: this.context.candidateId,
      },
    });

    // Create audit trail
    await this.createAuditTrail(existingCandidate!);
    return { message: "Candidate deleted successfully" };
  }

  private async createAuditTrail(existingCandidate: any): Promise<void> {
    await AuditTrailService.createCandidateAuditTrail(
      "DELETE",
      this.context,
      existingCandidate
    );
  }
}

// Validator that uses Strategy pattern
class CandidateValidator {
  constructor(private strategies: ValidationStrategy[]) {}

  async validateAll(context: CandidateContext): Promise<void> {
    for (const strategy of this.strategies) {
      await strategy.validate(context);
    }
  }
}

// Command Invoker
class CandidateController {
  async executeCommand(command: CandidateCommand): Promise<any> {
    try {
      return await command.execute();
    } catch (error: any) {
      throw error;
    }
  }
}

// Shared HTTP handler factory to eliminate handler duplication
class CandidateHttpHandlerFactory {
  static async handleRequest<T>(
    handler: () => Promise<T>,
    successResponseBuilder?: (result: T) => any
  ): Promise<NextResponse> {
    try {
      const result = await handler();

      if (successResponseBuilder) {
        return NextResponse.json(successResponseBuilder(result));
      }

      return NextResponse.json(result);
    } catch (error: any) {
      return createErrorResponse(error);
    }
  }

  static createController(): CandidateController {
    return new CandidateController();
  }

  // Consolidated command execution for read operations (GET, DELETE)
  static async executeReadCommand<T extends CandidateCommand>(
    params: { adminId: string; electionId: string; candidateId: string },
    commandClass: new (context: CandidateContext) => T
  ): Promise<any> {
    const context = CandidateContextFactory.createReadContext(params);
    const controller = this.createController();
    const command = new commandClass(context);
    return await controller.executeCommand(command);
  }
}

// Error handler utility
function createErrorResponse(error: any): NextResponse {
  console.error("Candidate operation error:", error);

  if (error.message.includes("Unauthorized")) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error.message.includes("not found")) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error.message.includes("already exists")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

// Get a specific candidate
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      adminId: string;
      electionId: string;
      candidateId: string;
    }>;
  }
) {
  return CandidateHttpHandlerFactory.handleRequest(async () => {
    const resolvedParams = await params;
    return CandidateHttpHandlerFactory.executeReadCommand(
      resolvedParams,
      GetCandidateCommand
    );
  });
}

// Update a candidate
export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      adminId: string;
      electionId: string;
      candidateId: string;
    }>;
  }
) {
  return CandidateHttpHandlerFactory.handleRequest(
    async () => {
      const resolvedParams = await params;
      const body = await request.json();
      const { full_name, photo_url, manifesto, portfolio_id } = body;
      const updateData: CandidateUpdateData = {
        full_name,
        photo_url,
        manifesto,
        portfolio_id,
      };

      const context = CandidateContextFactory.createUpdateContext(
        resolvedParams,
        updateData
      );
      const controller = CandidateHttpHandlerFactory.createController();
      const command = new UpdateCandidateCommand(context);
      return await controller.executeCommand(command);
    },
    (updatedCandidate) => ({
      message: "Candidate updated successfully",
      candidate: updatedCandidate,
    })
  );
}

// Delete a candidate
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      adminId: string;
      electionId: string;
      candidateId: string;
    }>;
  }
) {
  return CandidateHttpHandlerFactory.handleRequest(async () => {
    const resolvedParams = await params;
    return CandidateHttpHandlerFactory.executeReadCommand(
      resolvedParams,
      DeleteCandidateCommand
    );
  });
}
