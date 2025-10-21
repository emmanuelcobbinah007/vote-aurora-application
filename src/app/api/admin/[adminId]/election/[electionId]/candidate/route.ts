import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { isAdminAuthorized } from "@/libs/auth-utils";

// Domain types for candidate creation
interface CandidateCreationData {
  portfolio_id: string;
  full_name: string;
  photo_url?: string | null;
  manifesto?: string | null;
}

interface CandidateCreationContext {
  adminId: string;
  electionId: string;
  candidateData: CandidateCreationData;
}

// Strategy Pattern: Creation validation strategies
interface CreationValidationStrategy {
  validate(context: CandidateCreationContext): Promise<void>;
}

class AdminCreationAccessValidationStrategy
  implements CreationValidationStrategy
{
  async validate(context: CandidateCreationContext): Promise<void> {
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

class RequiredFieldsValidationStrategy implements CreationValidationStrategy {
  async validate(context: CandidateCreationContext): Promise<void> {
    const { portfolio_id, full_name } = context.candidateData;
    if (!portfolio_id || !full_name) {
      throw new Error("Portfolio ID and full name are required");
    }
  }
}

class PortfolioExistenceValidationStrategy
  implements CreationValidationStrategy
{
  async validate(context: CandidateCreationContext): Promise<void> {
    const portfolio = await prisma.portfolios.findFirst({
      where: {
        id: context.candidateData.portfolio_id,
        election_id: context.electionId,
      },
    });

    if (!portfolio) {
      throw new Error(
        "Portfolio not found or does not belong to this election"
      );
    }
  }
}

class DuplicateNameValidationStrategy implements CreationValidationStrategy {
  async validate(context: CandidateCreationContext): Promise<void> {
    const { portfolio_id, full_name } = context.candidateData;

    const existingCandidate = await prisma.candidates.findFirst({
      where: {
        portfolio_id,
        full_name,
      },
    });

    if (existingCandidate) {
      throw new Error(
        `A candidate with the name "${full_name}" already exists for this portfolio`
      );
    }
  }
}

// Repository for candidate creation operations
class CandidateCreationRepository {
  static async createCandidate(context: CandidateCreationContext) {
    const { portfolio_id, full_name, photo_url, manifesto } =
      context.candidateData;

    return await prisma.candidates.create({
      data: {
        portfolio_id,
        election_id: context.electionId,
        full_name,
        photo_url: photo_url || null,
        manifesto: manifesto || null,
      },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });
  }

  static async getPortfolioForAudit(portfolioId: string, electionId: string) {
    return await prisma.portfolios.findFirst({
      where: {
        id: portfolioId,
        election_id: electionId,
      },
      select: {
        title: true,
      },
    });
  }
}

// Audit trail service for creation
class CandidateCreationAuditService {
  static async createCreationAuditTrail(
    context: CandidateCreationContext,
    newCandidate: any
  ): Promise<void> {
    const { full_name, portfolio_id, photo_url, manifesto } =
      context.candidateData;

    const portfolio = await CandidateCreationRepository.getPortfolioForAudit(
      portfolio_id,
      context.electionId
    );

    await prisma.auditTrail.create({
      data: {
        action: "CREATE_CANDIDATE",
        user_id: context.adminId,
        election_id: context.electionId,
        metadata: {
          candidate_id: newCandidate.id,
          candidate_name: full_name,
          portfolio_id,
          portfolio_title: portfolio?.title || "Unknown",
          photo_url: photo_url ? "Yes" : "No",
          manifesto: manifesto ? "Yes" : "No",
        },
      },
    });
  }
}

// Validation factory for creation operations
class CreationValidationFactory {
  static createCandidateCreationValidationStrategies(): CreationValidationStrategy[] {
    return [
      new AdminCreationAccessValidationStrategy(),
      new RequiredFieldsValidationStrategy(),
      new PortfolioExistenceValidationStrategy(),
      new DuplicateNameValidationStrategy(),
    ];
  }
}

// Creation validator using Strategy pattern
class CandidateCreationValidator {
  constructor(private strategies: CreationValidationStrategy[]) {}

  async validateAll(context: CandidateCreationContext): Promise<void> {
    for (const strategy of this.strategies) {
      await strategy.validate(context);
    }
  }
}

// Command Pattern: Create candidate command
interface CandidateCreationCommand {
  execute(): Promise<any>;
}

class CreateCandidateCommand implements CandidateCreationCommand {
  constructor(private context: CandidateCreationContext) {}

  async execute(): Promise<any> {
    await this.validateCreation();
    const newCandidate = await this.performCreation();
    await this.createAuditTrail(newCandidate);
    return newCandidate;
  }

  private async validateCreation(): Promise<void> {
    const validator = new CandidateCreationValidator(
      CreationValidationFactory.createCandidateCreationValidationStrategies()
    );
    await validator.validateAll(this.context);
  }

  private async performCreation(): Promise<any> {
    return await CandidateCreationRepository.createCandidate(this.context);
  }

  private async createAuditTrail(newCandidate: any): Promise<void> {
    await CandidateCreationAuditService.createCreationAuditTrail(
      this.context,
      newCandidate
    );
  }
}

// Creation context factory
class CandidateCreationContextFactory {
  static createContext(
    params: { adminId: string; electionId: string },
    candidateData: CandidateCreationData
  ): CandidateCreationContext {
    const { adminId, electionId } = params;
    return { adminId, electionId, candidateData };
  }
}

// Creation controller
class CandidateCreationController {
  async executeCommand(command: CandidateCreationCommand): Promise<any> {
    return await command.execute();
  }
}

// Error handler for creation operations
function createCreationErrorResponse(error: any): NextResponse {
  console.error("Candidate creation error:", error);

  if (error.message.includes("Unauthorized")) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }

  if (error.message.includes("required")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (error.message.includes("not found")) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error.message.includes("already exists")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    { error: "Failed to create candidate" },
    { status: 500 }
  );
}

// Repository for candidate listing operations
class CandidateListingRepository {
  static async findCandidatesByElection(electionId: string) {
    return await prisma.candidates.findMany({
      where: { election_id: electionId },
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
      orderBy: { created_at: "desc" },
    });
  }
}

// Command for listing candidates
class ListCandidatesCommand {
  constructor(private context: { adminId: string; electionId: string }) {}

  async execute(): Promise<any> {
    await this.validateAccess();
    return await this.fetchCandidates();
  }

  private async validateAccess(): Promise<void> {
    const isAuthorized = await isAdminAuthorized(
      this.context.adminId,
      this.context.electionId
    );
    if (!isAuthorized) {
      throw new Error(
        "Unauthorized. Admin does not have access to this election."
      );
    }
  }

  private async fetchCandidates(): Promise<any[]> {
    return await CandidateListingRepository.findCandidatesByElection(
      this.context.electionId
    );
  }
}

// Get all candidates for a specific election that the admin manages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ adminId: string; electionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const command = new ListCandidatesCommand(resolvedParams);
    const candidates = await command.execute();

    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error("Error fetching candidates:", error);

    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch candidates" },
      { status: 500 }
    );
  }
}

// Create a new candidate
export async function POST(
  request: Request,
  { params }: { params: Promise<{ adminId: string; electionId: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { portfolio_id, full_name, photo_url, manifesto } = body;

    const candidateData: CandidateCreationData = {
      portfolio_id,
      full_name,
      photo_url,
      manifesto,
    };

    const context = CandidateCreationContextFactory.createContext(
      resolvedParams,
      candidateData
    );
    const controller = new CandidateCreationController();
    const command = new CreateCandidateCommand(context);

    const newCandidate = await controller.executeCommand(command);

    return NextResponse.json({
      message: "Candidate created successfully",
      candidate: newCandidate,
    });
  } catch (error: any) {
    return createCreationErrorResponse(error);
  }
}
