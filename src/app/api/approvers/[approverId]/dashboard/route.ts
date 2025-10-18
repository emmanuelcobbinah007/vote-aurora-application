import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

interface DashboardStats {
  pendingApprovals: number;
  approvedElections: number;
  liveElections: number;
  completedElections: number;
  totalVotesOverseen: number;
  averageApprovalTime: string;
}

interface RecentActivity {
  id: string;
  type: "approval" | "rejection" | "review_request";
  electionTitle: string;
  timestamp: string;
  status: string;
}

// GET /api/approvers/[approverId]/dashboard
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ approverId: string }> }
) {
  try {
    const { approverId } = await params;

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

    // Get dashboard statistics
    const [
      pendingApprovals,
      approvedElections,
      liveElections,
      completedElections,
      totalVotes,
      recentApprovals,
    ] = await Promise.all([
      // Count pending approvals
      prisma.elections.count({
        where: { status: "PENDING_APPROVAL" },
      }),

      // Count elections approved by this approver
      prisma.elections.count({
        where: {
          approved_by: approverId,
          status: { in: ["APPROVED", "LIVE", "CLOSED", "ARCHIVED"] },
        },
      }),

      // Count currently live elections
      prisma.elections.count({
        where: { status: "LIVE" },
      }),

      // Count completed elections (closed/archived)
      prisma.elections.count({
        where: { status: { in: ["CLOSED", "ARCHIVED"] } },
      }),

      // Get total votes from elections overseen by this approver
      prisma.votes.count({
        where: {
          election: {
            approved_by: approverId,
          },
        },
      }),

      // Get recent approval activities for this approver
      prisma.elections.findMany({
        where: {
          approved_by: approverId,
          status: { not: "PENDING_APPROVAL" },
        },
        orderBy: { updated_at: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          status: true,
          updated_at: true,
        },
      }),
    ]);

    // Calculate average approval time (simplified - you might want to track this more precisely)
    const averageApprovalTime = "2.3 days"; // TODO: This would need actual tracking

    const stats: DashboardStats = {
      pendingApprovals,
      approvedElections,
      liveElections,
      completedElections,
      totalVotesOverseen: totalVotes,
      averageApprovalTime,
    };

    // Format recent activity
    const recentActivity: RecentActivity[] = recentApprovals.map(
      (election) => ({
        id: election.id,
        type: "approval" as const,
        electionTitle: election.title,
        timestamp: election.updated_at.toISOString(),
        status: election.status,
      })
    );

    // Add recent review requests (elections that are currently pending)
    const pendingElections = await prisma.elections.findMany({
      where: { status: "PENDING_APPROVAL" },
      orderBy: { created_at: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        created_at: true,
      },
    });

    const pendingActivity: RecentActivity[] = pendingElections.map(
      (election) => ({
        id: `pending-${election.id}`,
        type: "review_request" as const,
        electionTitle: election.title,
        timestamp: election.created_at.toISOString(),
        status: "REVIEW_REQUESTED",
      })
    );

    // Combine and sort activities
    const allActivity = [...recentActivity, ...pendingActivity]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentActivity: allActivity,
      },
    });
  } catch (error) {
    console.error("Error fetching approver dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
