import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";

// GET: Get admin management dashboard data
export async function GET(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    // Get admin statistics
    const [
      totalAdmins,
      activeAdmins,
      totalAssignments,
      pendingInvitations,
    ] = await Promise.all([
      prisma.users.count({
        where: { role: "ADMIN" },
      }),
      prisma.users.count({
        where: { 
          role: "ADMIN",
          status: "ACTIVE",
        },
      }),
      prisma.adminAssignments.count(),
      prisma.invitationTokens.count({
        where: {
          role: "ADMIN",
          used: false,
          expires_at: {
            gte: new Date(),
          },
        },
      }),
    ]);

    // Get recent admin assignments
    const recentAssignments = await prisma.adminAssignments.findMany({
      take: 5,
      orderBy: {
        created_at: "desc",
      },
      include: {
        admin: {
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
        assigner: {
          select: {
            full_name: true,
          },
        },
      },
    });

    // Get recent invitations
    const recentInvitations = await prisma.invitationTokens.findMany({
      where: {
        role: "ADMIN",
      },
      take: 5,
      orderBy: {
        created_at: "desc",
      },
      include: {
        creator: {
          select: {
            full_name: true,
          },
        },
      },
    });

    const dashboardData = {
      statistics: {
        totalAdmins,
        activeAdmins,
        totalAssignments,
        pendingInvitations,
      },
      recentAssignments: recentAssignments.map(assignment => ({
        id: assignment.id,
        admin_name: assignment.admin.full_name,
        admin_email: assignment.admin.email,
        election_title: assignment.election.title,
        assigned_by: assignment.assigner.full_name,
        assigned_at: assignment.created_at.toISOString(),
      })),
      recentInvitations: recentInvitations.map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        used: invitation.used,
        expires_at: invitation.expires_at.toISOString(),
        created_at: invitation.created_at.toISOString(),
        invited_by: invitation.creator?.full_name || "System",
      })),
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin dashboard data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}