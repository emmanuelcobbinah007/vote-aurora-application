import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// GET - Fetch audit trail for an election
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
    const { electionId } = await params;

    // Validate that the election exists
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    // Fetch audit trail entries for this election
    const auditEntries = await prisma.auditTrail.findMany({
      where: {
        election_id: electionId,
      },
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Transform the data to include user information
    const transformedEntries = auditEntries.map((entry) => ({
      id: entry.id,
      user_id: entry.user_id,
      election_id: entry.election_id,
      action: entry.action,
      metadata: entry.metadata,
      timestamp: entry.timestamp.toISOString(),
      user: entry.user,
    }));

    return NextResponse.json(
      { auditEntries: transformedEntries },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching audit trail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
