import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin } from "@/libs/auth-utils";
import { createAuditLog, AUDIT_ACTIONS } from "@/libs/audit-utils";
import EmailService from "@/libs/email";

interface ReassignRequest {
  adminEmail: string;
  newElectionId: string;
}

export async function POST(request: NextRequest) {
  // Validate authentication - only SUPERADMIN can reassign admins
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    const body: ReassignRequest = await request.json();
    const { adminEmail, newElectionId } = body;

    // Validate required fields
    if (!adminEmail || !newElectionId) {
      return NextResponse.json(
        { error: "Admin email and new election ID are required" },
        { status: 400 }
      );
    }

    // Find the admin user
    const adminUser = await prisma.users.findUnique({
      where: { email: adminEmail },
      include: {
        adminAssignments: {
          include: {
            election: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    if (adminUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 400 }
      );
    }

    // Check current assignment
    const currentAssignment = adminUser.adminAssignments[0];

    if (!currentAssignment) {
      return NextResponse.json(
        { error: "Admin has no current assignment" },
        { status: 400 }
      );
    }

    if (currentAssignment.election_id === newElectionId) {
      return NextResponse.json(
        { error: "Admin is already assigned to this election" },
        { status: 409 }
      );
    }

    // Verify the new election exists
    const newElection = await prisma.elections.findUnique({
      where: { id: newElectionId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        start_time: true,
        end_time: true,
      },
    });

    if (!newElection) {
      return NextResponse.json(
        { error: "New election not found" },
        { status: 404 }
      );
    }

    // Update the admin assignment
    await prisma.adminAssignments.update({
      where: { id: currentAssignment.id },
      data: {
        election_id: newElectionId,
        assigned_by: authResult.user!.id,
      },
    });

    // Send email notifications
    try {
      const emailService = new EmailService();
      const dashboardLink = `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/admin/elections/${newElectionId}`;

      // Send unassignment notification for the old election
      await emailService.sendAdminUnassignmentNotification(
        adminUser.email,
        adminUser.full_name,
        currentAssignment.election.title,
        authResult.user!.fullName
      );

      // Send assignment notification for the new election
      await emailService.sendAdminAssignmentNotification(
        adminUser.email,
        adminUser.full_name,
        {
          title: newElection.title,
          department: newElection.description || "General",
          start_time: newElection.start_time.toISOString(),
          end_time: newElection.end_time.toISOString(),
        },
        authResult.user!.fullName,
        dashboardLink
      );
    } catch (emailError) {
      console.error("Failed to send admin reassignment emails:", emailError);
      // Don't fail the reassignment if email fails
    }

    // Log audit trail for admin reassignment
    await createAuditLog({
      userId: authResult.user!.id,
      action: AUDIT_ACTIONS.ADMIN_REASSIGNED,
      metadata: {
        adminId: adminUser.id,
        adminEmail: adminUser.email,
        adminName: adminUser.full_name,
        previousElectionId: currentAssignment.election_id,
        previousElectionTitle: currentAssignment.election.title,
        newElectionId: newElectionId,
        newElectionTitle: newElection.title,
        reassignedBy: authResult.user!.fullName,
        reassignedByEmail: authResult.user!.email,
      },
    });

    return NextResponse.json({
      message: "Admin reassigned successfully",
      data: {
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.full_name,
        },
        previousElection: {
          id: currentAssignment.election_id,
          title: currentAssignment.election.title,
        },
        newElection: {
          id: newElectionId,
          title: newElection.title,
        },
      },
    });
  } catch (error) {
    console.error("Error reassigning admin:", error);
    return NextResponse.json(
      { error: "Failed to reassign admin" },
      { status: 500 }
    );
  }
}
