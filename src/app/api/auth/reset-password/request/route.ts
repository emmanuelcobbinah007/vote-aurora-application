import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/libs/prisma";
import { emailService } from "@/libs/email";
import { createHash, randomBytes } from "crypto";
import { logAuditEvent } from "@/libs/audit-utils";

// Schema for email validation
const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Token expiration time (1 hour)
const TOKEN_EXPIRATION = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = requestSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { email } = parsedBody.data;

    // Find user with the provided email
    const user = await prisma.users.findFirst({
      where: { email: email.toLowerCase() },
    });

    // For security reasons, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return NextResponse.json(
        {
          success: true,
          message:
            "If your email exists in our system, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate a random token
    const resetToken = randomBytes(32).toString("hex");
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    // Store the token in the InvitationTokens table as a lightweight fallback
    // We tag the record with role = ORCHESTRATOR (unused) and use the token field.
    // This avoids modifying the Prisma schema while still persisting tokens.
    await prisma.invitationTokens.upsert({
      where: { email: user.email },
      update: {
        token: hashedToken,
        expires_at: new Date(Date.now() + TOKEN_EXPIRATION),
        used: false,
        created_at: new Date(),
      },
      create: {
        email: user.email,
        token: hashedToken,
        role: "ORCHESTRATOR",
        expires_at: new Date(Date.now() + TOKEN_EXPIRATION),
        used: false,
        created_at: new Date(),
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;

    // Send email with reset link
    await emailService.sendPasswordResetEmail(
      user.email,
      resetUrl,
      user.full_name || undefined
    );

    // Log the password reset request
    await logAuditEvent({
      userId: user.id,
      action: "PASSWORD_RESET_REQUEST",
      entityType: "USER",
      entityId: user.id,
      details: "Password reset requested via email",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "If your email exists in our system, a password reset link has been sent.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}
