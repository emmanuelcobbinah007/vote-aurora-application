import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import * as Yup from "yup";
import {
  validateSuperAdmin,
  createAuthErrorResponse,
} from "../../../../../libs/auth-utils";
import { emailService } from "@/libs/email";

const updateSchema = Yup.object({
  title: Yup.string().trim().optional(),
  description: Yup.string().nullable().optional(),
  start_time: Yup.string().optional(),
  end_time: Yup.string().optional(),
  is_general: Yup.boolean().optional(),
  department: Yup.string().nullable().optional(),
  status: Yup.string()
    .oneOf([
      "DRAFT",
      "PENDING_APPROVAL",
      "APPROVED",
      "LIVE",
      "CLOSED",
      "ARCHIVED",
    ])
    .optional(),
});

function formatValidationError(err: any) {
  const details: Record<string, string> = {};
  if (err.inner && Array.isArray(err.inner)) {
    err.inner.forEach((e: any) => {
      if (e.path && e.message) details[e.path] = e.message;
    });
  }
  return details;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { electionId: string } }
) {
  const auth = await validateSuperAdmin(req);
  if (!auth.success) return createAuthErrorResponse(auth);

  const electionId = params.electionId;
  try {
    const e = await prisma.elections.findUnique({
      where: { id: electionId },
      include: {
        portfolios: { include: { candidates: true } },
        candidates: true,
        creator: { select: { id: true, full_name: true, email: true } },
        approver: { select: { id: true, full_name: true, email: true } },
      },
    });

    if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const resp = {
      id: e.id,
      title: e.title,
      description: e.description,
      status: e.status,
      is_general: e.is_general,
      department: e.department,
      start_time: e.start_time?.toISOString(),
      end_time: e.end_time?.toISOString(),
      created_at: e.created_at.toISOString(),
      updated_at: e.updated_at.toISOString(),
      created_by: e.created_by,
      approved_by: e.approved_by,
      portfolios: e.portfolios.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        election_id: p.election_id,
        created_at: p.created_at?.toISOString(),
      })),
      candidates: e.candidates.map((c) => ({
        id: c.id,
        election_id: c.election_id,
        portfolio_id: c.portfolio_id,
        full_name: c.full_name,
        photo_url: c.photo_url || undefined,
        manifesto: c.manifesto || undefined,
        created_at: c.created_at?.toISOString(),
      })),
    };

    return NextResponse.json(resp, { status: 200 });
  } catch (err) {
    console.error("GET /api/superadmin/elections/[electionId] error", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Election update service to handle complex validation and business logic
class ElectionUpdateService {
  static async validateRequestBody(body: any) {
    try {
      await updateSchema.validate(body, { abortEarly: false });
    } catch (err: any) {
      const details = formatValidationError(err);
      throw {
        type: "VALIDATION_ERROR",
        message: "Validation failed",
        details,
        statusCode: 400,
      };
    }
  }

  static validateDepartmentRequirement(body: any) {
    if (this.isDepartmentRequiredButMissing(body)) {
      throw {
        type: "BUSINESS_RULE_ERROR",
        message: "Validation failed",
        details: {
          department:
            "Department is required for department-specific elections",
        },
        statusCode: 400,
      };
    }
  }

  private static isDepartmentRequiredButMissing(body: any): boolean {
    return (
      body.is_general === false &&
      (!body.department || body.department.trim() === "")
    );
  }

  static validateDates(body: any) {
    if (!body.start_time && !body.end_time) return;

    const { start, end } = this.parseDates(body);

    if (this.hasInvalidDates(start, end)) {
      throw {
        type: "DATE_VALIDATION_ERROR",
        message: "Validation failed",
        details: { start_time: "Invalid date", end_time: "Invalid date" },
        statusCode: 400,
      };
    }

    if (this.hasInvalidDateRange(start, end)) {
      throw {
        type: "DATE_RANGE_ERROR",
        message: "Validation failed",
        details: { end_time: "End time must be after start time" },
        statusCode: 400,
      };
    }
  }

  private static parseDates(body: any) {
    const start = body.start_time ? new Date(body.start_time) : null;
    const end = body.end_time ? new Date(body.end_time) : null;
    return { start, end };
  }

  private static hasInvalidDates(
    start: Date | null,
    end: Date | null
  ): boolean {
    return Boolean(
      (start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))
    );
  }

  private static hasInvalidDateRange(
    start: Date | null,
    end: Date | null
  ): boolean {
    return Boolean(start && end && end <= start);
  }

  static buildUpdateData(body: any) {
    const data: any = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined)
      data.description = body.description ? body.description.trim() : null;
    if (body.status !== undefined) data.status = body.status;
    if (body.is_general !== undefined)
      data.is_general = Boolean(body.is_general);
    if (body.department !== undefined)
      data.department = body.is_general ? null : body.department;
    if (body.start_time !== undefined)
      data.start_time = new Date(body.start_time);
    if (body.end_time !== undefined) data.end_time = new Date(body.end_time);

    return data;
  }

  static async getCurrentElection(electionId: string) {
    const currentElection = await prisma.elections.findUnique({
      where: { id: electionId },
      include: {
        creator: {
          select: { full_name: true, email: true },
        },
      },
    });

    if (!currentElection) {
      throw {
        type: "NOT_FOUND_ERROR",
        message: "Election not found",
        statusCode: 404,
      };
    }

    return currentElection;
  }

  static async updateElection(electionId: string, data: any) {
    return await prisma.elections.update({
      where: { id: electionId },
      data,
    });
  }

  static shouldSendApprovalNotification(
    newStatus: string,
    currentStatus: string
  ): boolean {
    return (
      newStatus === "PENDING_APPROVAL" && currentStatus !== "PENDING_APPROVAL"
    );
  }

  static async sendApprovalNotification(election: any, currentElection: any) {
    try {
      const approvers = await this.getActiveApprovers();
      const emailPromises = this.createEmailPromises(
        approvers,
        election,
        currentElection
      );

      // Send emails in background
      Promise.all(emailPromises).catch((error) => {
        console.error("Failed to send approval notification emails:", error);
      });
    } catch (emailError) {
      console.error("Error sending approval notification emails:", emailError);
      // Don't fail the request if email sending fails
    }
  }

  private static async getActiveApprovers() {
    return await prisma.users.findMany({
      where: {
        role: "APPROVER",
        status: "ACTIVE",
      },
      select: {
        email: true,
        full_name: true,
      },
    });
  }

  private static createEmailPromises(
    approvers: any[],
    election: any,
    currentElection: any
  ) {
    return approvers.map((approver) =>
      emailService.sendElectionSubmissionNotification(
        approver.email,
        approver.full_name,
        {
          title: election.title,
          department: election.department || "General",
          createdBy: currentElection.creator?.full_name || "Unknown",
          submittedAt: election.updated_at.toISOString(),
        },
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/approver/pending`
      )
    );
  }

  static formatResponse(election: any) {
    return {
      id: election.id,
      title: election.title,
      description: election.description,
      status: election.status,
      is_general: election.is_general,
      department: election.department,
      start_time: election.start_time?.toISOString(),
      end_time: election.end_time?.toISOString(),
      created_at: election.created_at.toISOString(),
      updated_at: election.updated_at.toISOString(),
      created_by: election.created_by,
      approved_by: election.approved_by,
    };
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { electionId: string } }
) {
  const auth = await validateSuperAdmin(req);
  if (!auth.success) return createAuthErrorResponse(auth);

  const electionId = params.electionId;

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    // Validate request body
    await ElectionUpdateService.validateRequestBody(body);

    // Validate business rules
    ElectionUpdateService.validateDepartmentRequirement(body);
    ElectionUpdateService.validateDates(body);

    // Get current election state
    const currentElection = await ElectionUpdateService.getCurrentElection(
      electionId
    );

    // Build update data
    const updateData = ElectionUpdateService.buildUpdateData(body);

    // Perform update
    const updated = await ElectionUpdateService.updateElection(
      electionId,
      updateData
    );

    // Handle email notifications
    if (
      ElectionUpdateService.shouldSendApprovalNotification(
        body.status,
        currentElection.status
      )
    ) {
      await ElectionUpdateService.sendApprovalNotification(
        updated,
        currentElection
      );
    }

    // Return formatted response
    const response = ElectionUpdateService.formatResponse(updated);
    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/superadmin/elections/[electionId] error", error);

    // Handle custom validation errors
    if (error.type && error.statusCode) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.statusCode }
      );
    }

    // Handle Prisma errors
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { electionId: string } }
) {
  const auth = await validateSuperAdmin(req);
  if (!auth.success) return createAuthErrorResponse(auth);

  const electionId = params.electionId;

  try {
    // First, check if the election exists and get its status
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: {
            votes: true,
            candidates: true,
            portfolios: true,
          },
        },
      },
    });

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of DRAFT or PENDING_APPROVAL elections
    if (!["DRAFT", "PENDING_APPROVAL"].includes(election.status)) {
      return NextResponse.json(
        {
          error: "Cannot delete election",
          message: `Election with status "${election.status}" cannot be deleted. Only DRAFT and PENDING_APPROVAL elections can be deleted.`,
        },
        { status: 400 }
      );
    }

    // Check if election has any votes (additional safety check)
    if (election._count.votes > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete election with votes",
          message:
            "This election has votes and cannot be deleted for audit purposes.",
        },
        { status: 400 }
      );
    }

    // Start a transaction to delete all related data
    await prisma.$transaction(async (tx) => {
      // Delete audit trail entries
      await tx.auditTrail.deleteMany({
        where: { election_id: electionId },
      });

      // Delete invitation tokens
      await tx.invitationTokens.deleteMany({
        where: { election_id: electionId },
      });

      // Delete admin assignments
      await tx.adminAssignments.deleteMany({
        where: { election_id: electionId },
      });

      // Delete student sessions
      await tx.studentSessions.deleteMany({
        where: { election_id: electionId },
      });

      // Delete voter tokens
      await tx.voterTokens.deleteMany({
        where: { election_id: electionId },
      });

      // Delete votes
      await tx.votes.deleteMany({
        where: { election_id: electionId },
      });

      // Delete analytics
      await tx.analytics.deleteMany({
        where: { election_id: electionId },
      });

      // Delete ballots (this will cascade to ballot positions)
      await tx.ballots.deleteMany({
        where: { election_id: electionId },
      });

      // Delete candidates
      await tx.candidates.deleteMany({
        where: { election_id: electionId },
      });

      // Delete portfolios
      await tx.portfolios.deleteMany({
        where: { election_id: electionId },
      });

      // Finally, delete the election itself
      await tx.elections.delete({
        where: { id: electionId },
      });
    });

    // Log the deletion in audit trail (we need to do this after the transaction since the election is gone)
    await prisma.auditTrail.create({
      data: {
        action: "ELECTION_DELETED",
        user_id: auth.user!.id,
        metadata: {
          election_id: electionId,
          election_title: election.title,
          deleted_by: auth.user!.fullName,
          deleted_by_email: auth.user!.email,
          election_status: election.status,
          candidates_count: election._count.candidates,
          portfolios_count: election._count.portfolios,
          votes_count: election._count.votes,
        },
      },
    });

    return NextResponse.json({
      message: "Election deleted successfully",
      election: {
        id: electionId,
        title: election.title,
      },
    });
  } catch (error) {
    console.error("DELETE /api/superadmin/elections/[electionId] error", error);

    // Handle Prisma errors
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
