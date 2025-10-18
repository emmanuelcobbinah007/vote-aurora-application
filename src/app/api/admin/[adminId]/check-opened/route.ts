import { NextRequest, NextResponse } from "next/server";
import { fetchAdminAssignmentWithElection } from "../assigned-election/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { adminId: string } }
) {
  const { adminId } = params;
  try {
    const adminAssignment = await fetchAdminAssignmentWithElection(adminId);

    if (!adminAssignment || !adminAssignment.election) {
      return NextResponse.json(
        {
          error: "ASSIGNMENT_NOT_FOUND",
          message: "Admin assignment or election not found.",
        },
        { status: 404 }
      );
    }

    if (adminAssignment.election.status === "CLOSED") {
      return NextResponse.json(
        {
          error: "ELECTION_CLOSED",
          message:
            "This election has been closed. Please contact your supervisor to access the election results.",
          electionTitle: adminAssignment.election.title,
          electionId: adminAssignment.election.id,
        },
        { status: 403 }
      );
    }

    // If we reach here, the election is open
    return NextResponse.json(
      {
        status: "OPEN",
        electionId: adminAssignment.election.id,
        electionTitle: adminAssignment.election.title,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in check-opened route:", error);
    return NextResponse.json(
      { error: "CHECK_FAILED", message: "Failed to verify election status." },
      { status: 500 }
    );
  }
}
