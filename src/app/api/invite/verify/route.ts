import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find the invitation token using raw query to ensure we get election_id
    const invitation = await prisma.$queryRaw<any[]>`
      SELECT 
        it.id, it.email, it.token, it.role, it.expires_at, it.used, 
        it.created_at, it.created_by, it.election_id,
        u.full_name as creator_name, u.email as creator_email
      FROM "InvitationTokens" it
      LEFT JOIN "Users" u ON it.created_by = u.id
      WHERE it.token = ${token}
      LIMIT 1
    `;

    if (!invitation || invitation.length === 0) {
      return NextResponse.json(
        { error: "Invalid invitation token" },
        { status: 404 }
      );
    }

    const inviteData = invitation[0];

    // Check if token is expired
    if (inviteData.expires_at < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 410 }
      );
    }

    // Check if token has already been used
    if (inviteData.used) {
      return NextResponse.json(
        { error: "Invitation has already been used" },
        { status: 410 }
      );
    }

    // Optionally include election info if this invitation is scoped to an election
    let electionInfo = null;
    const electionId = inviteData.election_id;
    console.log("🔍 Checking election_id:", electionId);
    if (electionId) {
      const election = await prisma.elections.findUnique({
        where: { id: electionId },
        select: { id: true, title: true },
      });
      if (election) {
        electionInfo = { id: election.id, title: election.title };
        console.log("✅ Found election info:", electionInfo);
      }
    }

    // Return invitation data (without sensitive information)
    return NextResponse.json({
      email: inviteData.email,
      role: inviteData.role,
      expires_at: inviteData.expires_at.toISOString(),
      created_by: inviteData.creator_name || "System Administrator",
      election: electionInfo,
    });
  } catch (error) {
    console.error("Error verifying invitation:", error);
    return NextResponse.json(
      { error: "Failed to verify invitation" },
      { status: 500 }
    );
  }
}
