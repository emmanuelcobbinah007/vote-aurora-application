import prisma from "@/libs/prisma";
import { NextRequest, NextResponse } from "next/server";
import { electionActivationService } from "@/libs/electionActivation";

export async function POST(req: NextRequest) {
  try {
    const result =
      await electionActivationService.checkForElectionsToActivate();

    return NextResponse.json({
      success: true,
      message: `Processed ${result.processed} elections`,
      data: result,
    });
  } catch (error) {
    console.error("Election activation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to activate elections" },
      { status: 500 }
    );
  }
}

// For testing specific election
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const electionId = searchParams.get("electionId");

  if (electionId) {
    // Return specific election status
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        status: true,
        start_time: true,
        voter_list_generated: true,
        total_eligible_voters: true,
      },
    });

    return NextResponse.json(election);
  }

  // Return all elections ready for activation
  const readyElections = await prisma.elections.findMany({
    where: {
      status: "APPROVED",
      voter_list_generated: false,
    },
    select: {
      id: true,
      title: true,
      start_time: true,
      end_time: true,
      is_general: true,
      department: true,
    },
  });

  return NextResponse.json(readyElections);
}
