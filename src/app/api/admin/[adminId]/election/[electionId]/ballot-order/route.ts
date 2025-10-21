import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { isAdminAuthorized } from "@/libs/auth-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ adminId: string; electionId: string }> }
) {
  try {
    const { adminId, electionId } = await params;

    // Check if admin is authorized to access this election
    const isAuthorized = await isAdminAuthorized(adminId, electionId);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized. Admin does not have access to this election." },
        { status: 403 }
      );
    }

    // Get ballot order for this election
    const ballotOrder = await prisma.ballots.findMany({
      where: { election_id: electionId },
      include: {
        portfolio: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: { ballot_order: "asc" },
    });

    return NextResponse.json({
      ballot_order: ballotOrder,
    });
  } catch (error: any) {
    console.error("Error fetching ballot order:", error);
    return NextResponse.json(
      { error: "Failed to fetch ballot order" },
      { status: 500 }
    );
  }
}
