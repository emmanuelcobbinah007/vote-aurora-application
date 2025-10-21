import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { emailService } from "@/libs/email";
import { electionActivationService } from "@/libs/electionActivation";

interface ActionRequest {
  electionId: string;
  action: "approve" | "reject";
  comments?: string;
  requestReview?: boolean; // Flag to indicate if review is requested with rejection
}

// POST /api/approvers/[approverId]/actions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ approverId: string }> }
) {
  try {
    const { approverId } = await params;
    const body: ActionRequest = await request.json();
    const { electionId, action, comments, requestReview } = body;

    // Validate request
    if (!electionId || !action) {
      return NextResponse.json(
        { error: "Election ID and action are required" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        {
          error: "Invalid action. Must be 'approve' or 'reject'",
        },
        { status: 400 }
      );
    }

    // Validate that the approver exists and is active
    const approver = await prisma.users.findUnique({
      where: {
        id: approverId,
        role: "APPROVER",
        status: "ACTIVE",
      },
    });

    if (!approver) {
      return NextResponse.json(
        { error: "Approver not found or inactive" },
        { status: 404 }
      );
    }

    // Get the election and validate it's pending approval
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      include: {
        creator: {
          select: { full_name: true, email: true },
        },
      },
    });

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    if (election.status !== "PENDING_APPROVAL") {
      return NextResponse.json(
        { error: "Election is not pending approval" },
        { status: 400 }
      );
    }

    let newStatus: string;
    const updateData: any = {
      updated_at: new Date(),
    };

    switch (action) {
      case "approve":
        newStatus = "APPROVED";
        updateData.status = newStatus;
        updateData.approved_by = approverId;
        break;

      case "reject":
        if (requestReview) {
          // If review is requested, keep status as PENDING_APPROVAL
          newStatus = "PENDING_APPROVAL";
          // Don't update the status, just add the comment/note
        } else {
          // Regular rejection - move back to draft
          newStatus = "DRAFT";
          updateData.status = newStatus;
          updateData.approved_by = null;
        }
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update the election
    const updatedElection = await prisma.elections.update({
      where: { id: electionId },
      data: updateData,
      include: {
        creator: {
          select: { full_name: true, email: true },
        },
        approver: {
          select: { full_name: true, email: true },
        },
      },
    });

    if (action === "approve" && updatedElection.status === "APPROVED") {
      try {
        console.log(
          `Election approved: ${updatedElection.title}, checking for activation...`
        );

        const now = new Date();
        const startTime = new Date(updatedElection.start_time);
        const endTime = new Date(updatedElection.end_time);
        if (startTime <= now && endTime > now) {
          console.log(
            `Election start time has passed, activating immediately...`
          );
          const activationResult =
            await electionActivationService.checkForElectionsToActivate();
          console.log(
            `Activation completed: ${activationResult.processed} elections processed`
          );
        } else if (startTime > now) {
          console.log(
            `Election scheduled for future activation at ${startTime.toISOString()}`
          );
        } else {
          console.log(
            `Election scheduled for future activation at ${updatedElection.start_time}`
          );
        }
      } catch (activationError: any) {
        console.log(`Election activation failed for ${updatedElection.title}`);
        // Don't fail the approval process if activation fails
        // Log to audit trail for debugging
        await prisma.auditTrail.create({
          data: {
            action: "ELECTION_ACTIVATION_FAILED",
            user_id: approverId,
            election_id: electionId,
            metadata: {
              error: activationError.message,
              election_title: updatedElection.title,
              activation_attempt_time: new Date().toISOString(),
            },
          },
        });
      }
    }

    // Create audit trail entry
    const auditAction =
      action === "reject" && requestReview
        ? "ELECTION_REQUEST_REVIEW"
        : `ELECTION_${action.toUpperCase()}`;

    await prisma.auditTrail.create({
      data: {
        action: auditAction,
        user_id: approverId,
        election_id: electionId,
        metadata: {
          action,
          requestReview: requestReview || false,
          comments: comments || null,
          previous_status: election.status,
          new_status: newStatus,
          election_title: election.title,
        },
      },
    });

    // Send email notifications
    try {
      const actionType =
        action === "reject" && requestReview ? "request_review" : action;

      // Notify election creator
      if (election.creator) {
        await emailService.sendApprovalActionNotification(
          election.creator.email,
          election.creator.full_name,
          {
            action: actionType as "approve" | "reject" | "request_review",
            electionTitle: election.title,
            department: election.department || "General",
            approverName: approver.full_name,
            actionDate: new Date().toISOString(),
            comments: comments || undefined,
          },
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/admin/dashboard`
        );
      }

      // Notify superadmin for all actions
      const superadmins = await prisma.users.findMany({
        where: {
          role: "SUPERADMIN",
          status: "ACTIVE",
        },
        select: {
          email: true,
          full_name: true,
        },
      });

      const superadminEmailPromises = superadmins.map((superadmin) =>
        emailService.sendApprovalActionNotification(
          superadmin.email,
          superadmin.full_name,
          {
            action: actionType as "approve" | "reject" | "request_review",
            electionTitle: election.title,
            department: election.department || "General",
            approverName: approver.full_name,
            actionDate: new Date().toISOString(),
            comments: comments || undefined,
          },
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/superadmin/approvals`
        )
      );

      // Send emails in background (don't wait for completion)
      Promise.all(superadminEmailPromises).catch((error) => {
        console.error("Failed to send superadmin notification emails:", error);
      });
    } catch (emailError) {
      console.error(
        "Error sending approval action notification emails:",
        emailError
      );
      // Don't fail the request if email sending fails
    }

    return NextResponse.json({
      success: true,
      data: {
        election: {
          id: updatedElection.id,
          title: updatedElection.title,
          status: updatedElection.status,
          approvedBy: updatedElection.approver?.full_name,
          updatedAt: updatedElection.updated_at.toISOString(),
        },
        action,
        requestReview: requestReview || false,
        comments,
      },
      message: `Election ${
        action === "approve"
          ? "approved"
          : requestReview
          ? "review requested"
          : "rejected"
      } successfully`,
    });
  } catch (error) {
    console.error("Error processing approval action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/approvers/[approverId]/actions - Get action history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ approverId: string }> }
) {
  try {
    const { approverId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Validate that the approver exists
    const approver = await prisma.users.findUnique({
      where: {
        id: approverId,
        role: "APPROVER",
        status: "ACTIVE",
      },
    });

    if (!approver) {
      return NextResponse.json(
        { error: "Approver not found or inactive" },
        { status: 404 }
      );
    }

    // Get action history from audit trail
    const [actions, totalCount] = await Promise.all([
      prisma.auditTrail.findMany({
        where: {
          user_id: approverId,
          action: {
            in: [
              "ELECTION_APPROVE",
              "ELECTION_REJECT",
              "ELECTION_REQUEST_REVIEW",
            ],
          },
        },
        include: {
          election: {
            select: { title: true, status: true },
          },
        },
        orderBy: { timestamp: "desc" },
        skip: offset,
        take: limit,
      }),

      prisma.auditTrail.count({
        where: {
          user_id: approverId,
          action: {
            in: [
              "ELECTION_APPROVE",
              "ELECTION_REJECT",
              "ELECTION_REQUEST_REVIEW",
            ],
          },
        },
      }),
    ]);

    const formattedActions = actions.map((action) => ({
      id: action.id,
      action: action.action,
      electionId: action.election_id,
      electionTitle: action.election?.title || "Unknown Election",
      timestamp: action.timestamp.toISOString(),
      details: action.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: {
        actions: formattedActions,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching action history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
