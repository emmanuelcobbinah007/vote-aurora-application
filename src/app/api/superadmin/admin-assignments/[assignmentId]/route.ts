import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";
import EmailService from "@/libs/email";

interface RouteParams {
  params: {
    assignmentId: string;
  };
}

// DELETE: Remove an admin assignment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const { assignmentId } = params;

    // Check if assignment exists
    const assignment = await prisma.adminAssignments.findUnique({
      where: { id: assignmentId },
      include: {
        admin: { select: { full_name: true, email: true } },
        election: { select: { title: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          success: false,
          error: "Assignment not found",
        },
        { status: 404 }
      );
    }

    // Delete the assignment
    await prisma.adminAssignments.delete({
      where: { id: assignmentId },
    });

    // Send email notification to the admin
    try {
      const emailService = new EmailService();
      await emailService.sendAdminUnassignmentNotification(
        assignment.admin.email,
        assignment.admin.full_name,
        assignment.election.title,
        authResult.user!.fullName
      );
    } catch (emailError) {
      console.error("Failed to send admin unassignment email:", emailError);
      // Don't fail the unassignment if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Admin ${assignment.admin.full_name} has been unassigned from ${assignment.election.title}`,
    });
  } catch (error) {
    console.error("Error deleting admin assignment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete admin assignment",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
