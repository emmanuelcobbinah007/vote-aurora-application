import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";
import { emailService } from "@/libs/email";
import crypto from "crypto";

// POST: Handle bulk admin operations
export async function POST(request: NextRequest) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const body = await request.json();
    const { operation, adminIds, emails, full_names } = body;

    switch (operation) {
      case "bulk_invite":
        return await handleBulkInvite(emails, full_names, authResult.user!.id);
      
      case "bulk_suspend":
        return await handleBulkSuspend(adminIds);
      
      case "bulk_activate":
        return await handleBulkActivate(adminIds);
      
      case "bulk_delete":
        return await handleBulkDelete(adminIds);
      
      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid operation",
            message: "Supported operations: bulk_invite, bulk_suspend, bulk_activate, bulk_delete",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in bulk admin operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform bulk operation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleBulkInvite(emails: string[], full_names: string[], createdBy: string) {
  if (!Array.isArray(emails) || !Array.isArray(full_names) || emails.length !== full_names.length) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid data",
        message: "emails and full_names must be arrays of the same length",
      },
      { status: 400 }
    );
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const full_name = full_names[i];

    try {
      // Check if user already exists
      const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (existingUser) {
        errors.push({ email, error: "User already exists" });
        continue;
      }

      // Check if invitation already exists
      const existingInvitation = await prisma.invitationTokens.findFirst({
        where: {
          email,
          used: false,
          expires_at: {
            gte: new Date(),
          },
        },
      });

      if (existingInvitation) {
        errors.push({ email, error: "Active invitation already exists" });
        continue;
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString("hex");
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 7); // 7 days expiry

      // Create invitation token
      const invitation = await prisma.invitationTokens.create({
        data: {
          token,
          email,
          role: "ADMIN",
          expires_at,
          created_by: createdBy,
        },
      });

      // Send invitation email
      const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/accept?token=${token}`;
      
      await emailService.sendInvitationEmail(email, inviteUrl, "Admin", "Super Admin");

      results.push({
        email,
        full_name,
        invitation_id: invitation.id,
        token,
        expires_at: expires_at.toISOString(),
      });
    } catch (error) {
      errors.push({
        email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      successful_invitations: results,
      failed_invitations: errors,
      summary: {
        total: emails.length,
        successful: results.length,
        failed: errors.length,
      },
    },
  });
}

async function handleBulkSuspend(adminIds: string[]) {
  if (!Array.isArray(adminIds) || adminIds.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid data",
        message: "adminIds must be a non-empty array",
      },
      { status: 400 }
    );
  }

  const updated = await prisma.users.updateMany({
    where: {
      id: { in: adminIds },
      role: "ADMIN",
    },
    data: {
      status: "SUSPENDED",
      updated_at: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      updated_count: updated.count,
      message: `Successfully suspended ${updated.count} admin(s)`,
    },
  });
}

async function handleBulkActivate(adminIds: string[]) {
  if (!Array.isArray(adminIds) || adminIds.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid data",
        message: "adminIds must be a non-empty array",
      },
      { status: 400 }
    );
  }

  const updated = await prisma.users.updateMany({
    where: {
      id: { in: adminIds },
      role: "ADMIN",
    },
    data: {
      status: "ACTIVE",
      updated_at: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      updated_count: updated.count,
      message: `Successfully activated ${updated.count} admin(s)`,
    },
  });
}

async function handleBulkDelete(adminIds: string[]) {
  if (!Array.isArray(adminIds) || adminIds.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid data",
        message: "adminIds must be a non-empty array",
      },
      { status: 400 }
    );
  }

  // Use transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // First, delete all admin assignments
    const deletedAssignments = await tx.adminAssignments.deleteMany({
      where: {
        admin_id: { in: adminIds },
      },
    });

    // Then delete the admin users
    const deletedUsers = await tx.users.deleteMany({
      where: {
        id: { in: adminIds },
        role: "ADMIN",
      },
    });

    return {
      deletedAssignments: deletedAssignments.count,
      deletedUsers: deletedUsers.count,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      deleted_assignments: result.deletedAssignments,
      deleted_users: result.deletedUsers,
      message: `Successfully deleted ${result.deletedUsers} admin(s) and ${result.deletedAssignments} assignment(s)`,
    },
  });
}