import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { Prisma } from "@prisma/client";
import { emailService } from "../../../libs/email";
import { validateOrchestratorOrAdmin } from "../../../libs/auth-utils";
import { createAuditLog, AUDIT_ACTIONS } from "../../../libs/audit-utils";
import crypto from "crypto";

interface InviteRequest {
  electionId?: string;
  email: string;
  role?: string;
}

export async function POST(request: NextRequest) {
  // Validate authentication and authorization - ORCHESTRATOR and SUPERADMIN can send invites
  const authResult = await validateOrchestratorOrAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.statusCode }
    );
  }

  try {
    const body: InviteRequest = await request.json();
    const { electionId, email, role } = body;

    // Validate role
    const validRoles = [
      "VOTER",
      "ADMIN",
      "SUPERADMIN",
      "APPROVER",
      "ORCHESTRATOR",
    ];
    if (!role || !validRoles.includes(role.toUpperCase())) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
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

    if (existingUser) {
      // If user exists but is not an admin, prevent invitation
      if (existingUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      // If user is an admin, check their current assignment
      const currentAssignment = existingUser.adminAssignments[0]; // Assuming one assignment per admin

      if (currentAssignment) {
        // Admin is already assigned to an election
        if (currentAssignment.election_id === electionId) {
          return NextResponse.json(
            { error: "Admin is already assigned to this election" },
            { status: 409 }
          );
        }

        // Admin is assigned to a different election - return info for reassignment
        return NextResponse.json(
          {
            requiresReassignment: true,
            currentAssignment: {
              electionId: currentAssignment.election_id,
              electionTitle: currentAssignment.election.title,
              electionStatus: currentAssignment.election.status,
            },
            message: `Admin is currently assigned to election "${
              currentAssignment.election.title
            }". Would you like to reassign them to "${
              electionId ? "this election" : "no election"
            }"?`,
          },
          { status: 200 }
        );
      }

      // Admin exists but has no assignment - this shouldn't happen, but allow invitation
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitationTokens.findUnique({
      where: { email },
    });

    if (
      existingInvitation &&
      !existingInvitation.used &&
      existingInvitation.expires_at > new Date()
    ) {
      return NextResponse.json(
        { error: "A pending invitation already exists for this email" },
        { status: 409 }
      );
    }

    // Delete any existing expired or used invitations for this email if its expired
    if (existingInvitation) {
      await prisma.invitationTokens.delete({
        where: { email },
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Attempt normal Prisma create first
    try {
      await prisma.invitationTokens.create({
        data: {
          email,
          token,
          expires_at: expiresAt,
          election: electionId ? { connect: { id: electionId } } : undefined,
          role: role.toUpperCase() as any,
          creator: { connect: { id: authResult.user!.id } },
        },
      });
    } catch (createErr: any) {
      console.error(
        "Prisma create failed for invitation token, falling back to raw SQL:",
        createErr?.message || createErr
      );
      const insertSql = `INSERT INTO "public"."InvitationTokens" ("email","token","role","expires_at","used","created_at","created_by") VALUES ($1,$2,$3,$4,false,now(),$5)`;
      try {
        await prisma.$executeRawUnsafe(
          insertSql,
          email,
          token,
          role.toUpperCase(),
          expiresAt.toISOString(),
          authResult.user!.id
        );
      } catch (rawErr) {
        console.error("Raw insert fallback also failed:", rawErr);
        throw rawErr;
      }
    }

    // Log audit trail for invitation sent
    await createAuditLog({
      userId: authResult.user!.id,
      action: AUDIT_ACTIONS.INVITATION_SENT,
      metadata: {
        email,
        role: role.toUpperCase(),
        token,
        sent_by: authResult.user!.fullName,
        sent_by_email: authResult.user!.email,
      },
    });

    // Generate invitation link
    const invitationLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/invite/accept?token=${token}`;

    try {
      // Choose appropriate email sender based on role
      const normalizedRole = role.toUpperCase();

      await emailService.sendInvitationEmail(
        email,
        invitationLink,
        normalizedRole,
        authResult.user!.fullName
      );

      console.log("Invitation sent successfully to:", email);

      return NextResponse.json({
        message: "Invitation sent successfully",
        // Only include link in development for testing
        ...(process.env.NODE_ENV === "development" && {
          invitationLink,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);

      // If email fails, delete the created invitation to keep data consistent
      await prisma.invitationTokens.delete({
        where: { token },
      });

      return NextResponse.json(
        {
          error:
            "Failed to send invitation email. Please check email configuration and try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
