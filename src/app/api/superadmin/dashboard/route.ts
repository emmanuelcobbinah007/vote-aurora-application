import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";

// GET: Fetch dashboard data for superadmin
export async function GET(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    // Get overview statistics
    const [
      totalElections,
      activeElections,
      completedElections,
      pendingElections,
      draftElections,
      totalVotes,
      totalUsers,
      totalAdmins,
      totalPortfolios,
      totalCandidates,
    ] = await Promise.all([
      prisma.elections.count(),
      prisma.elections.count({ where: { status: "LIVE" } }),
      prisma.elections.count({ where: { status: "CLOSED" } }),
      prisma.elections.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.elections.count({ where: { status: "DRAFT" } }),
      prisma.votes.count(),
      prisma.users.count(),
      prisma.users.count({
        where: {
          role: {
            in: ["ADMIN", "SUPERADMIN"],
          },
        },
      }),
      prisma.portfolios.count(),
      prisma.candidates.count(),
    ]);

    // Get recent activity from audit trail
    const recentActivity = await prisma.auditTrail.findMany({
      take: 5,
      orderBy: {
        timestamp: "desc",
      },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
          },
        },
        election: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get upcoming elections
    const upcomingElections = await prisma.elections.findMany({
      where: {
        start_time: {
          gte: new Date(),
        },
        status: {
          in: ["APPROVED", "LIVE"],
        },
      },
      take: 3,
      orderBy: {
        start_time: "asc",
      },
      select: {
        id: true,
        title: true,
        start_time: true,
        status: true,
      },
    });

    // Get system health data
    const [activeUserSessions, pendingInvitations] = await Promise.all([
      // This would require session tracking - for now return a placeholder
      Promise.resolve(0),
      prisma.invitationTokens.count({
        where: {
          used: false,
          expires_at: {
            gte: new Date(),
          },
        },
      }),
    ]);

    const dashboardData = {
      overview: {
        totalElections,
        activeElections,
        completedElections,
        pendingElections,
        draftElections,
        totalVotes,
        totalUsers,
        totalAdmins,
        totalPortfolios,
        totalCandidates,
      },
      recentActivity: recentActivity.map((activity) => ({
        id: activity.id,
        action: activity.action,
        details: activity.election?.title || "System action",
        timestamp: activity.timestamp.toISOString(),
        type: activity.election_id ? "election" : "system",
        user: activity.user.full_name,
      })),
      upcomingElections: upcomingElections.map((election) => ({
        id: election.id,
        title: election.title,
        start_time: election.start_time.toISOString(),
        status: election.status,
      })),
      systemHealth: {
        status: "healthy", // This would be determined by system checks
        uptime: "99.9%", // This would come from monitoring
        activeUsers: activeUserSessions,
        systemLoad: 23, // This would come from system monitoring
        databaseConnections: 12, // This would come from DB monitoring
        pendingInvitations,
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}