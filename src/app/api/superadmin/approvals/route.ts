import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(request: NextRequest) {
  try {
    // Extract pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    // Get total count for pagination metadata
    const totalCount = await prisma.elections.count();

    // Get elections with pagination and creator information and approval status
    const elections = await prisma.elections.findMany({
      skip,
      take: validLimit,
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            candidates: true,
            // Note: We don't have a direct voters count, so we'll use a placeholder
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Get all election IDs to fetch audit trail comments
    const electionIds = elections.map((e) => e.id);

    // Fetch audit trail entries with comments for these elections
    const auditEntries = await prisma.auditTrail.findMany({
      where: {
        election_id: {
          in: electionIds,
        },
        action: {
          in: [
            "ELECTION_APPROVE",
            "ELECTION_REJECT",
            "ELECTION_REQUEST_REVIEW",
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    // Transform elections to match ElectionApproval interface
    const approvals = elections.map((election) => {
      // Get audit entries for this election
      const electionAuditEntries = auditEntries.filter(
        (entry) => entry.election_id === election.id
      );

      // Transform audit entries to notes
      const notes = electionAuditEntries
        .filter((entry) => {
          const metadata = entry.metadata as any;
          return metadata?.comments && metadata.comments.trim() !== "";
        })
        .map((entry) => {
          const metadata = entry.metadata as any;
          let noteType: "approval" | "rejection" | "review_request";

          switch (entry.action) {
            case "ELECTION_APPROVE":
              noteType = "approval";
              break;
            case "ELECTION_REJECT":
              noteType = "rejection";
              break;
            case "ELECTION_REQUEST_REVIEW":
              noteType = "review_request";
              break;
            default:
              noteType = "approval";
          }

          return {
            id: entry.id,
            message: metadata.comments,
            createdAt: entry.timestamp.toISOString(),
            createdBy: entry.user_id,
            createdByName: entry.user.full_name,
            type: noteType,
          };
        });

      // Get the latest note (most recent comment)
      const lastNote = notes.length > 0 ? notes[0] : undefined;
      // Determine approval status based on election status and audit trail
      let approvalStatus:
        | "pending"
        | "approved"
        | "rejected"
        | "review_requested";
      let reviewedAt = null;
      let reviewedBy = null;
      let reviewedByName = null;

      // Check if election has been rejected by looking at audit trail
      const hasRejection = electionAuditEntries.some(
        (entry) => entry.action === "ELECTION_REJECT"
      );

      // Check if election has been approved
      const hasApproval = electionAuditEntries.some(
        (entry) => entry.action === "ELECTION_APPROVE"
      );

      // Check if review has been requested
      const hasReviewRequest = electionAuditEntries.some(
        (entry) => entry.action === "ELECTION_REQUEST_REVIEW"
      );

      if (hasRejection) {
        // Election has been rejected
        approvalStatus = "rejected";
        const rejectionEntry = electionAuditEntries.find(
          (entry) => entry.action === "ELECTION_REJECT"
        );
        if (rejectionEntry) {
          reviewedAt = rejectionEntry.timestamp.toISOString();
          reviewedBy = rejectionEntry.user_id;
          reviewedByName = rejectionEntry.user.full_name;
        }
      } else if (
        election.status === "APPROVED" ||
        election.status === "LIVE" ||
        election.status === "CLOSED"
      ) {
        // Election has been approved and is in approved/live/closed state
        approvalStatus = "approved";
        reviewedAt = election.updated_at.toISOString();
        reviewedBy = election.approved_by;
        reviewedByName = election.approver?.full_name || null;
      } else if (hasReviewRequest) {
        // Review has been requested
        approvalStatus = "review_requested";
      } else if (
        election.status === "PENDING_APPROVAL" ||
        election.status === "DRAFT"
      ) {
        // Still pending
        approvalStatus = "pending";
      } else {
        // Default to pending for any other status
        approvalStatus = "pending";
      }

      // Determine priority based on election timing
      const now = new Date();
      const startDate = new Date(election.start_time);
      const daysUntilStart = Math.ceil(
        (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority: "low" | "medium" | "high";
      if (daysUntilStart <= 7) {
        priority = "high";
      } else if (daysUntilStart <= 14) {
        priority = "medium";
      } else {
        priority = "low";
      }

      return {
        id: `approval-${election.id}`,
        election: {
          id: election.id,
          title: election.title,
          description: election.description || "",
          createdBy: election.created_by,
          createdByName: election.creator.full_name,
          createdByEmail: election.creator.email,
          department: election.department || "General",
          startDate: election.start_time.toISOString(),
          endDate: election.end_time.toISOString(),
          candidatesCount: election._count.candidates,
          votersCount: 0, // Placeholder - we'd need to implement voter registration
          createdAt: election.created_at.toISOString(),
        },
        status: approvalStatus,
        submittedAt: election.created_at.toISOString(),
        reviewedAt,
        reviewedBy,
        reviewedByName,
        priority,
        notes,
        lastNote,
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / validLimit);
    const hasNextPage = validPage < totalPages;
    const hasPrevPage = validPage > 1;

    // Return approvals with pagination metadata
    const response = {
      approvals,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage,
        hasPrevPage,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return NextResponse.json(
      { error: "Failed to fetch approvals" },
      { status: 500 }
    );
  }
}
