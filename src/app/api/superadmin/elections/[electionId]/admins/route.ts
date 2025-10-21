import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";

interface RouteParams {
  params: Promise<{
    electionId: string;
  }>;
}

// GET: Get all admins assigned to a specific election
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

    // Get admin assignments for this election
    const assignments = await prisma.adminAssignments.findMany({
      where: {
        election_id: electionId,
      },
      include: {
        admin: {
          select: {
            id: true,
            full_name: true,
            email: true,
            status: true,
            last_login: true,
          },
        },
        assigner: {
          select: {
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const formattedAssignments = assignments.map((assignment) => ({
      assignment_id: assignment.id,
      assigned_at: assignment.created_at.toISOString(),
      admin: {
        id: assignment.admin.id,
        full_name: assignment.admin.full_name,
        email: assignment.admin.email,
        status: assignment.admin.status,
        last_login: assignment.admin.last_login?.toISOString() || null,
      },
      assigned_by: {
        full_name: assignment.assigner.full_name,
        email: assignment.assigner.email,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        election: {
          id: election.id,
          title: election.title,
        },
        assignments: formattedAssignments,
        count: formattedAssignments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching election admins:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch election admins",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
