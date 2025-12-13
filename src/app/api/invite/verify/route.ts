import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find the invitation token with creator info
    const invitation = await prisma.invitationTokens.findUnique({
      where: { token },
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
      },
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

    // Return invitation data (without sensitive information)
    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      expires_at: invitation.expires_at.toISOString(),
      created_by: invitation.creator?.full_name || "System Administrator",
      election: invitation.election
        ? {
            id: invitation.election.id,
            title: invitation.election.title,
          }
        : null,
    });
  } catch (error) {
    console.error("Error verifying invitation:", error);
    return NextResponse.json(
      { error: "Failed to verify invitation" },
      { status: 500 }
    );
  }
}
