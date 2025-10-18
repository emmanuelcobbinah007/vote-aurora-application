import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";
import crypto from "crypto";
import EmailService from "@/libs/email";

// GET: List all admin assignments
export async function GET(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const adminAssignments = await prisma.adminAssignments.findMany({
      include: {
        admin: {
          select: {
            id: true,
            full_name: true,
            email: true,
            status: true,
            created_at: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            start_time: true,
            end_time: true,
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

    return NextResponse.json({
      success: true,
      data: adminAssignments,
    });
  } catch (error) {
    console.error("Error fetching admin assignments:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch admin assignments",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Create a new admin assignment
export async function POST(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const body = await request.json();
    const { admin_id, election_id } = body;

    // Validate required fields
    if (!admin_id || !election_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: admin_id and election_id",
        },
        { status: 400 }
      );
    }

    // Check if admin exists and has ADMIN role
    const admin = await prisma.users.findUnique({
      where: { id: admin_id },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: "Admin not found or invalid role",
        },
        { status: 404 }
      );
    }

    // Check if election exists
    const election = await prisma.elections.findUnique({
      where: { id: election_id },
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

    // Check if assignment already exists
    const existingAssignment = await prisma.adminAssignments.findFirst({
      where: {
        admin_id,
        election_id,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin is already assigned to this election",
        },
        { status: 409 }
      );
    }

    // Create the assignment
    const assignment = await prisma.adminAssignments.create({
      data: {
        admin_id,
        election_id,
        assigned_by: authResult.user!.id,
      },
      include: {
        admin: {
          select: {
            id: true,
            full_name: true,
            email: true,
            status: true,
            created_at: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            start_time: true,
            end_time: true,
          },
        },
        assigner: {
          select: {
            full_name: true,
            email: true,
          },
        },
      },
    });

    // Send email notification to the admin
    try {
      const emailService = new EmailService();
      const dashboardLink = `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/admin/elections/${election.id}`;

      await emailService.sendAdminAssignmentNotification(
        assignment.admin.email,
        assignment.admin.full_name,
        {
          title: election.title,
          department: election.description || "General",
          start_time: election.start_time.toISOString(),
          end_time: election.end_time.toISOString(),
        },
        assignment.assigner.full_name,
        dashboardLink
      );
    } catch (emailError) {
      console.error("Failed to send admin assignment email:", emailError);
      // Don't fail the assignment if email fails
    }

    return NextResponse.json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("Error creating admin assignment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin assignment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
