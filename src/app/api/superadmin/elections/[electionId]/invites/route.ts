import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { emailService } from "@/libs/email";
import { validateSuperAdmin } from "../../../../../../libs/auth-utils";
import {
  createAuditLog,
  AUDIT_ACTIONS,
} from "../../../../../../libs/audit-utils";

interface InviteRequest {
  email: string;
  role?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  // this is to make sure that the user is authenticated as a superadmin
  const auth = await validateSuperAdmin(req);
  if (!auth.success)
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );

  let body: InviteRequest;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, role } = body;

  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return NextResponse.json(
      { error: "Invalid email format" },
      { status: 400 }
    );

  const normalizedRole = (role || "ADMIN").toUpperCase();
  const validRoles = [
    "ADMIN",
    "ORCHESTRATOR",
    "APPROVER",
    "SUPERADMIN",
    "VOTER",
  ];
  if (!validRoles.includes(normalizedRole))
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  // Resolve params (Next.js requires awaiting params before using properties)
  const electionId = (await params).electionId;

  // Everything works till this point

  // Check election exists
  const election = await prisma.elections.findUnique({
    where: { id: electionId },
  });
  if (!election) {
    console.log("Election not found for ID:", electionId);
    return NextResponse.json({ error: "Election not found" }, { status: 404 });
  }

  // Check for existing user
  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    console.log("User already exists with email:", email);
    return NextResponse.json(
      { error: "An account with this email already exists in the system" },
      { status: 409 }
    );
  }
  // Check for existing pending invitation and cleanup expired/used ones (same behavior as global invite route)
  const existingInvitation = await prisma.invitationTokens.findUnique({
    where: { email },
  });

  if (
    existingInvitation &&
    !existingInvitation.used &&
    existingInvitation.expires_at > new Date()
  ) {
    console.log("Pending invitation already exists for email:", email);
    return NextResponse.json(
      { error: "A pending invitation already exists for this email" },
      { status: 409 }
    );
  }

  // Delete any existing invitation (expired/used) to create a fresh one
  if (existingInvitation) {
    await prisma.invitationTokens.delete({ where: { email } });
    console.log("Deleted existing invitation for email:", email);
  }

  console.log("Everything working till this point");

  const token = crypto.randomBytes(32).toString("hex");
  const inviteId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
    // Attempt normal Prisma create first
    try {
      // Use unchecked create to write scalar FK fields directly (id, created_by, election_id).
      await prisma.invitationTokens.create({
        data: {
          id: inviteId,
          email,
          token,
          role: normalizedRole as any,
          expires_at: expiresAt,
          created_by: auth.user!.id,
          election_id: electionId,
        },
      });

      console.log(
        "Invitation token created successfully with Prisma (unchecked create)"
      );
    } catch (createErr: any) {
      // If Prisma input validation fails (mismatched generated client), fall back to raw SQL insert
      console.log("error happened");
      console.error(
        "Prisma create failed for invitation token, falling back to raw SQL:",
        createErr?.message || createErr
      );

      // Note: include id, cast $4 to the Role enum and $5 to timestamp; ensure created_by and election_id cast to uuid
      const insertSql = `INSERT INTO "public"."InvitationTokens" ("id","email","token","role","expires_at","used","created_at","created_by","election_id") VALUES ($1,$2,$3,$4::\"Role\",$5::timestamp,false,now(),$6::uuid,$7::uuid)`;
      try {
        await prisma.$executeRawUnsafe(
          insertSql,
          inviteId,
          email,
          token,
          normalizedRole,
          expiresAt,
          auth.user!.id,
          electionId
        );
      } catch (rawErr) {
        console.error("Raw insert fallback also failed:", rawErr);
        throw rawErr;
      }
    }

    // Create audit log noting election context
    await createAuditLog({
      userId: auth.user!.id,
      action: AUDIT_ACTIONS.INVITATION_SENT,
      metadata: {
        email,
        role: normalizedRole,
        electionId,
        sent_by: auth.user!.fullName,
      },
    });

    const invitationLink = `${
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    }/invite/accept?token=${token}`;

    try {
      await emailService.sendInvitationEmail(
        email,
        invitationLink,
        normalizedRole,
        auth.user!.fullName
      );

      return NextResponse.json(
        {
          message: "Invitation sent",
          ...(process.env.NODE_ENV === "development" ? { invitationLink } : {}),
        },
        { status: 200 }
      );
    } catch (emailErr) {
      console.error(
        "Failed to send election-scoped invitation email:",
        emailErr
      );
      // Clean up the created token to avoid stale invites
      try {
        await prisma.invitationTokens.delete({ where: { token } });
      } catch (delErr) {
        console.error("Failed to delete invitation after email error:", delErr);
      }

      return NextResponse.json(
        {
          error:
            "Failed to send invitation email. Please check email configuration and try again.",
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Failed to create election invite", err);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
