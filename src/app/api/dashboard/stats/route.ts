import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateOrchestratorOrAdmin } from "../../../../libs/auth-utils";

export async function GET(request: NextRequest) {
  // Validate authentication and authorization
  const authResult = await validateOrchestratorOrAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const orchestratorId = searchParams.get("orchestratorId");

    // If not a SUPERADMIN, ensure user can only access their own data
    if (
      authResult.user!.role !== "SUPERADMIN" &&
      authResult.user!.id !== orchestratorId
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get dashboard statistics
    const stats = await getDashboardStats(orchestratorId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function getDashboardStats(orchestratorId: string | null) {
  // For now, return mock data with some basic counts
  // In a real implementation, these would be actual database queries

  const [totalOrchestrators, totalElections, totalVoters, totalCandidates] =
    await Promise.all([
      // Count total orchestrators
      prisma.users.count({
        where: { role: "ORCHESTRATOR", status: "ACTIVE" },
      }),

      // Count total elections
      prisma.elections.count({}),

      // Count total voters
      prisma.users.count({
        where: { role: "VOTER", status: "ACTIVE" },
      }),

      // Count total candidates (placeholder)
      Promise.resolve(0),
    ]);

  // Get recent activity count (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentActivityCount = await prisma.auditTrail.count({
    where: {
      timestamp: {
        gte: thirtyDaysAgo,
      },
      ...(orchestratorId && { user_id: orchestratorId }),
    },
  });

  // Get pending invitations count
  const pendingInvitations = await prisma.invitationTokens.count({
    where: {
      used: false,
      expires_at: {
        gt: new Date(),
      },
    },
  });

  return {
    totalOrchestrators,
    totalElections,
    totalVoters,
    totalCandidates,
    recentActivity: recentActivityCount,
    pendingInvitations,
    activeElections: 0, // Placeholder
    completedElections: 0, // Placeholder
  };
}
