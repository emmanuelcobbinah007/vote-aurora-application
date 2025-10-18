import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "../../../../libs/audit-utils";
import bcrypt from "bcryptjs";

interface AcceptInviteRequest {
  token: string;
  fullName: string;
  password: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AcceptInviteRequest = await request.json();
    const { token, fullName, password, role } = body;

    // Validate required fields
    if (!token || !fullName || !password || !role) {
      return NextResponse.json(
        { error: "Token, full name, and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find the invitation token
    const invitation = await prisma.invitationTokens.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    // Check if token is expired
    if (invitation.expires_at < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      );
    }

    // Check if token has already been used
    if (invitation.used) {
      return NextResponse.json(
        { error: "Invitation has already been used" },
        { status: 410 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: invitation.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Grab election_id safely (Prisma client types might not reflect new field until generated)
    const electionId = (invitation as any).election_id as string | undefined;

    // Create the user and mark invitation as used in a transaction
    let assignmentCreated = false;
    const result = await prisma.$transaction(async (tx) => {
      // Checking if the account being created is a SuperAdmin or Approver.
      // If yes, delete any existing user(s) with that role so there is at most one active account for each of these special roles.
      // Note: use strict role comparison rather than a faulty `||` boolean expression.
      if (invitation.role === "SUPERADMIN" || invitation.role === "APPROVER") {
        // Find any existing users with the same role and delete them (or mark them inactive depending on policy).
        // We'll delete here to follow the comment's instruction; adapt to soft-delete if needed.
        await tx.users.deleteMany({
          where: { role: invitation.role },
        });
      }

      // Create the user
      const newUser = await tx.users.create({
        data: {
          full_name: fullName.trim(),
          email: invitation.email,
          password_hash: passwordHash,
          role: invitation.role,
          status: "ACTIVE",
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          status: true,
          created_at: true,
        },
      });

      // If this is an ADMIN invite and it's scoped to an election, create an AdminAssignments row
      if (invitation.role === "ADMIN" && electionId) {
        // Ensure we don't duplicate assignments
        const existingAssignment = await tx.adminAssignments.findFirst({
          where: { admin_id: newUser.id, election_id: electionId },
        });

        if (!existingAssignment) {
          await tx.adminAssignments.create({
            data: {
              admin_id: newUser.id,
              election_id: electionId,
              assigned_by: invitation.created_by || newUser.id,
            },
          });
          assignmentCreated = true;
        }
      }

      // Mark invitation as used
      await tx.invitationTokens.update({
        where: { token },
        data: { used: true },
      });

      return newUser;
    });

    // Log audit trail for account creation (outside transaction)
    const accountCreatedAction =
      result.role === "SUPERADMIN"
        ? AUDIT_ACTIONS.SUPERADMIN_ACCOUNT_CREATED
        : result.role === "APPROVER"
        ? AUDIT_ACTIONS.APPROVER_ACCOUNT_cREATED
        : result.role === "ADMIN"
        ? AUDIT_ACTIONS.ADMIN_ACCOUNT_CREATED
        : AUDIT_ACTIONS.ORCHESTRATOR_ACCOUNT_CREATED;

    await createAuditLog({
      userId: result.id,
      action: accountCreatedAction,
      metadata: {
        email: result.email,
        full_name: result.full_name,
        role: result.role,
        invitation_token: token,
        created_at: result.created_at.toISOString(),
      },
    });

    // Also log the invitation acceptance event
    await createAuditLog({
      userId: result.id,
      action: AUDIT_ACTIONS.INVITATION_ACCEPTED,
      metadata: {
        email: result.email,
        full_name: result.full_name,
        role: result.role,
        invitation_token: token,
        accepted_at: new Date().toISOString(),
      },
    });

    // If an admin was assigned to an election during the accept transaction, log it
    if (
      (assignmentCreated as boolean) &&
      invitation &&
      (invitation as any).election_id
    ) {
      await createAuditLog({
        userId: result.id,
        action: AUDIT_ACTIONS.ADMIN_ASSIGNED,
        electionId: (invitation as any).election_id,
        metadata: {
          admin_email: result.email,
          admin_id: result.id,
          assigned_by: invitation.created_by || null,
          assigned_at: new Date().toISOString(),
        },
      });
    }

    console.log("User created successfully:", result.email);

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: result.id,
        fullName: result.full_name,
        email: result.email,
        role: result.role,
        status: result.status,
      },
    });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
