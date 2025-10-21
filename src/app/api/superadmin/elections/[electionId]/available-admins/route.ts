import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";

interface RouteParams {
  params: Promise<{
    electionId: string;
  }>;
}

// GET: Get available admins for assignment to an election (not already assigned)
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const { electionId } = await params;

    // Verify election exists
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      select: { id: true, title: true },
    });

    if (!election) {
      return NextResponse.json(
        {
          success: false,
          error: "Election not found",
        },
        { status: 404 }
      );
    }

    // Get all admins
    const allAdmins = await prisma.users.findMany({
      where: {
        role: "ADMIN",
        status: "ACTIVE",
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        status: true,
        last_login: true,
      },
    });

    // Get already assigned admin IDs for this election
    const assignedAdminIds = await prisma.adminAssignments.findMany({
      where: {
        election_id: electionId,
      },
      select: {
        admin_id: true,
      },
    });

    const assignedIds = new Set(assignedAdminIds.map((a) => a.admin_id));

    // Filter out already assigned admins
    const availableAdmins = allAdmins.filter(
      (admin) => !assignedIds.has(admin.id)
    );

    const formattedAdmins = availableAdmins.map((admin) => ({
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      status: admin.status,
      last_login: admin.last_login?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        election: {
          id: election.id,
          title: election.title,
        },
        available_admins: formattedAdmins,
        count: formattedAdmins.length,
      },
    });
  } catch (error) {
    console.error("Error fetching available admins:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available admins",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
