import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { createAuditLog, AUDIT_ACTIONS } from "@/libs/audit-utils";
import bcrypt from "bcryptjs";

interface AcceptElectionInviteRequest {
  token: string;
  fullName: string;
  password: string;
  role: string;
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  console.log("🔥 Election-scoped accept endpoint called");
  try {
    const { electionId } = await params;
    console.log("📋 Election ID:", electionId);
    const body: AcceptElectionInviteRequest = await req.json();
    const { token, fullName, password, role } = body;
    console.log("👤 Accept request:", {
      email: "hidden",
      role,
      hasToken: !!token,
    });

    if (!token || !fullName || !password || !role) {
      console.log("❌ Missing required fields");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the invitation token and ensure it's for this election
    const invitations = await prisma.$queryRaw<any[]>`
      SELECT id, email, token, role, expires_at, used, created_at, created_by, election_id
      FROM "InvitationTokens"
      WHERE token = ${token}
      LIMIT 1
    `;

    const invitation = invitations[0];
    console.log("🎫 Invitation found:", !!invitation);
    if (!invitation)
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );

    const tokenElectionId = invitation.election_id;
    console.log(
      "🏛️ Token election ID:",
      tokenElectionId,
      "Expected:",
      electionId
    );
    if (!tokenElectionId || tokenElectionId !== electionId) {
      console.log("❌ Election ID mismatch");
      return NextResponse.json(
        { error: "Invitation not valid for this election" },
        { status: 400 }
      );
    }

    if (invitation.expires_at < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      );
    }

    if (invitation.used) {
      return NextResponse.json(
        { error: "Invitation already used" },
        { status: 410 }
      );
    }

    // Check for existing user
    const existingUser = await prisma.users.findUnique({
      where: { email: invitation.email },
    });
    if (existingUser)
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user and assignment in a transaction
    console.log("🔄 Starting transaction to create user and assignment");
    const result = await prisma.$transaction(async (tx) => {
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
      console.log("✅ User created:", newUser.id);

      // create admin assignment if role is ADMIN
      if (invitation.role === "ADMIN") {
        console.log("👑 Creating AdminAssignment for ADMIN role");
        // avoid duplicates
        const existing = await tx.adminAssignments.findFirst({
          where: { admin_id: newUser.id, election_id: electionId },
        });
        if (!existing) {
          const assignment = await tx.adminAssignments.create({
            data: {
              admin_id: newUser.id,
              election_id: electionId,
              assigned_by: invitation.created_by || newUser.id,
            },
          });
          console.log("✅ AdminAssignment created:", assignment.id);
        } else {
          console.log("  AdminAssignment already exists");
        }
      } else {
        console.log("ℹ️ Not creating AdminAssignment (role is not ADMIN)");
      }

      // mark token used
      await tx.invitationTokens.update({
        where: { token },
        data: { used: true },
      });

      return newUser;
    });
    console.log("✅ Transaction completed successfully");

    // audit logs
    const accountCreatedAction = AUDIT_ACTIONS.ADMIN_ACCOUNT_CREATED;
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

    // admin assigned audit
    await createAuditLog({
      userId: result.id,
      action: AUDIT_ACTIONS.ADMIN_ASSIGNED,
      electionId,
      metadata: {
        admin_email: result.email,
        admin_id: result.id,
        assigned_by: invitation.created_by || null,
        assigned_at: new Date().toISOString(),
      },
    });

    console.log("📊 Audit logs created, returning success response");
    return NextResponse.json({
      message: "Account created and admin assigned",
      user: { id: result.id, fullName: result.full_name, email: result.email },
    });
  } catch (err) {
    console.error("💥 Error accepting election invite:", err);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}
