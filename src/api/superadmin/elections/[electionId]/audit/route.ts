import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { electionId: string } }
) {
  try {
    const { electionId } = params;

    // Fetch audit entries for the specific election
    const auditEntries = await prisma.auditTrail.findMany({
      where: {
        election_id: electionId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json({
      auditEntries,
    });
  } catch (error) {
    console.error("Failed to fetch audit trail:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit trail" },
      { status: 500 }
    );
  }
}
