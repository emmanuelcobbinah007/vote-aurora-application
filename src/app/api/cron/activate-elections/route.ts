import { NextResponse } from "next/server";
import { electionActivationService } from "@/libs/electionActivation";

export async function GET() {
  try {
    const result =
      await electionActivationService.checkForElectionsToActivate();
    const closedElections =
      await electionActivationService.closeExpiredElections();
    return NextResponse.json({
      success: true,
      processed: result.processed,
      elections: result.elections,
      closed: closedElections.closed,
      closedElections: closedElections.elections,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
