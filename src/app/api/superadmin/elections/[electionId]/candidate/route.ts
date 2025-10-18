import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// GET - Fetch all candidates for an election
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

    // Fetch all candidates for this election
    const candidates = await prisma.candidates.findMany({
      where: { election_id: electionId },
      orderBy: { created_at: "asc" },
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

    return NextResponse.json({ candidates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new candidate for an election
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
    const { electionId } = await params;
    const body = await request.json();
    const { portfolio_id, full_name, photo_url, manifesto } = body;

    // Validate required fields
    if (!portfolio_id || portfolio_id.trim() === "") {
      return NextResponse.json(
        { error: "Portfolio is required" },
        { status: 400 }
      );
    }

    if (!full_name || full_name.trim() === "") {
      return NextResponse.json(
        { error: "Candidate name is required" },
        { status: 400 }
      );
    }

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

    // Validate that the portfolio exists and belongs to this election
    const portfolio = await prisma.portfolios.findFirst({
      where: {
        id: portfolio_id,
        election_id: electionId,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found or does not belong to this election" },
        { status: 404 }
      );
    }

    // Check if election is in a state where candidates can be added
    if (
      election.status === "LIVE" ||
      election.status === "CLOSED" ||
      election.status === "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot add candidates to an election that is live, closed, or archived",
        },
        { status: 400 }
      );
    }

    // Check if a candidate with the same name already exists in this portfolio
    const existingCandidate = await prisma.candidates.findFirst({
      where: {
        election_id: electionId,
        portfolio_id: portfolio_id,
        full_name: full_name.trim(),
      },
    });

    if (existingCandidate) {
      return NextResponse.json(
        {
          error: "A candidate with this name already exists in this portfolio",
        },
        { status: 409 }
      );
    }

    // Create the new candidate
    const newCandidate = await prisma.candidates.create({
      data: {
        election_id: electionId,
        portfolio_id: portfolio_id,
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
        message: "Candidate created successfully",
        candidate: newCandidate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating candidate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
