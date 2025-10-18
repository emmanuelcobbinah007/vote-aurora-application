import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// PUT - Update a candidate
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string; candidateId: string }> }
) {
  try {
    const { electionId, candidateId } = await params;
    const body = await request.json();
    const { full_name, photo_url, manifesto } = body;

    // Validate required fields
    if (!full_name || full_name.trim() === "") {
      return NextResponse.json(
        { error: "Candidate name is required" },
        { status: 400 }
      );
    }

    // Validate that the candidate exists and belongs to this election
    const existingCandidate = await prisma.candidates.findFirst({
      where: {
        id: candidateId,
        election_id: electionId,
      },
      include: {
        election: true,
        portfolio: true,
      },
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Check if election is in a state where candidates can be modified
    if (
      existingCandidate.election.status === "LIVE" ||
      existingCandidate.election.status === "CLOSED" ||
      existingCandidate.election.status === "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot modify candidates in an election that is live, closed, or archived",
        },
        { status: 400 }
      );
    }

    // Check if another candidate with the same name already exists in the same portfolio (excluding current one)
    const duplicateCandidate = await prisma.candidates.findFirst({
      where: {
        election_id: electionId,
        portfolio_id: existingCandidate.portfolio_id,
        full_name: full_name.trim(),
        id: { not: candidateId },
      },
    });

    if (duplicateCandidate) {
      return NextResponse.json(
        {
          error: "A candidate with this name already exists in this portfolio",
        },
        { status: 409 }
      );
    }

    // Update the candidate
    const updatedCandidate = await prisma.candidates.update({
      where: { id: candidateId },
      data: {
        full_name: full_name.trim(),
        photo_url: photo_url?.trim() || null,
        manifesto: manifesto?.trim() || null,
      },
      select: {
        id: true,
        election_id: true,
        portfolio_id: true,
        full_name: true,
        photo_url: true,
        manifesto: true,
        created_at: true,
        portfolio: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Candidate updated successfully",
        candidate: updatedCandidate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a candidate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string; candidateId: string }> }
) {
  try {
    const { electionId, candidateId } = await params;

    // Validate that the candidate exists and belongs to this election
    const existingCandidate = await prisma.candidates.findFirst({
      where: {
        id: candidateId,
        election_id: electionId,
      },
      include: {
        election: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    // Check if election is in a state where candidates can be deleted
    if (
      existingCandidate.election.status === "LIVE" ||
      existingCandidate.election.status === "CLOSED" ||
      existingCandidate.election.status === "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete candidates from an election that is live, closed, or archived",
        },
        { status: 400 }
      );
    }

    // Check if candidate has votes
    if (existingCandidate._count.votes > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete candidate that has received votes. Please archive the election instead.",
        },
        { status: 400 }
      );
    }

    // Delete the candidate
    await prisma.candidates.delete({
      where: { id: candidateId },
    });

    return NextResponse.json(
      { message: "Candidate deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
