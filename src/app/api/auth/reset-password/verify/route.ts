import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/libs/prisma";
import { createHash } from "crypto";
import { hashPassword } from "@/libs/auth-utils";
import { logAuditEvent } from "@/libs/audit-utils";

// Schema for password reset validation
const resetSchema = z.object({
  token: z.string().min(32, "Invalid token"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedBody = resetSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { token, password } = parsedBody.data;

    // Hash token from request to match the one stored in the database
    const hashedToken = createHash("sha256").update(token).digest("hex");

    // Find valid token stored in invitationTokens (fallback storage)
    const resetToken = await prisma.invitationTokens.findFirst({
      where: {
        token: hashedToken,
        expires_at: { gt: new Date() }, // Token is not expired
        used: false,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired token. Please request a new password reset.",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user's password
    // We stored invitationTokens by email, so resolve the user by email
    const user = await prisma.users.findFirst({
      where: { email: resetToken.email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found for token" },
        { status: 404 }
      );
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword },
    });

    // Mark token as used
    await prisma.invitationTokens.update({
      where: { email: resetToken.email },
      data: { used: true },
    });

    // Log password reset as audit event
    await logAuditEvent({
      userId: user.id,
      action: "PASSWORD_RESET",
      entityType: "USER",
      entityId: user.id,
      details: "Password reset via email verification",
    });

    return NextResponse.json(
      { success: true, message: "Password has been reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
