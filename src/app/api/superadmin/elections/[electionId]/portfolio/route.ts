import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// GET - Fetch all portfolios for an election
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

    // Fetch all portfolios for this election
    const portfolios = await prisma.portfolios.findMany({
      where: { election_id: electionId },
      orderBy: { created_at: "asc" },
      select: {
        id: true,
        election_id: true,
        title: true,
        description: true,
        created_at: true,
        _count: {
          select: {
            candidates: true, // Count of candidates in this portfolio
          },
        },
      },
    });

    return NextResponse.json({ portfolios }, { status: 200 });
  } catch (error) {
    console.error("Error fetching portfolios:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new portfolio for an election
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
    const { electionId } = await params;
    const body = await request.json();
    const { title, description } = body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Portfolio title is required" },
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

    // Check if election is in a state where portfolios can be added
    if (
      election.status === "LIVE" ||
      election.status === "CLOSED" ||
      election.status === "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot add portfolios to an election that is live, closed, or archived",
        },
        { status: 400 }
      );
    }

    // Check if a portfolio with the same title already exists in this election
    const existingPortfolio = await prisma.portfolios.findFirst({
      where: {
        election_id: electionId,
        title: title.trim(),
      },
    });

    if (existingPortfolio) {
      return NextResponse.json(
        {
          error: "A portfolio with this title already exists in this election",
        },
        { status: 409 }
      );
    }

    // Create the new portfolio and ballot entry in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the current number of portfolios to determine the next ballot order
      const portfolioCount = await tx.portfolios.count({
        where: { election_id: electionId },
      });

      // Create the new portfolio
      const newPortfolio = await tx.portfolios.create({
        data: {
          election_id: electionId,
          title: title.trim(),
          description: description?.trim() || null,
        },
        select: {
          id: true,
          election_id: true,
          title: true,
          description: true,
          created_at: true,
          _count: {
            select: {
              candidates: true,
            },
          },
        },
      });

      // Automatically create a ballot entry for this portfolio
      await tx.ballots.create({
        data: {
          election_id: electionId,
          portfolio_id: newPortfolio.id,
          ballot_order: portfolioCount + 1, // Next order position
        },
      });

      return newPortfolio;
    });

    return NextResponse.json(
      {
        message: "Portfolio created successfully",
        portfolio: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
