import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// GET - Fetch ballot order for an election
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

    // Fetch ballot order with portfolio information
    const ballots = await prisma.ballots.findMany({
      where: { election_id: electionId },
      orderBy: { ballot_order: "asc" },
      include: {
        portfolio: {
          select: {
            id: true,
            title: true,
            description: true,
            _count: {
              select: {
                candidates: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ ballots }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ballot order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update ballot order for an election
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string }> }
) {
  try {
    const { electionId } = await params;
    const body = await request.json();
    const { ballotOrder } = body;

    // Validate required fields
    if (!Array.isArray(ballotOrder)) {
      return NextResponse.json(
        { error: "Ballot order must be an array" },
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

    // Check if election is in a state where ballot order can be modified
    if (
      election.status === "LIVE" ||
      election.status === "CLOSED" ||
      election.status === "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot modify ballot order for an election that is live, closed, or archived",
        },
        { status: 400 }
      );
    }

    // Validate that all portfolios in the ballot order exist and belong to this election
    const portfolioIds = ballotOrder.map((item: any) => item.portfolioId);
    const existingPortfolios = await prisma.portfolios.findMany({
      where: {
        id: { in: portfolioIds },
        election_id: electionId,
      },
    });

    if (existingPortfolios.length !== portfolioIds.length) {
      return NextResponse.json(
        {
          error:
            "Some portfolios do not exist or do not belong to this election",
        },
        { status: 400 }
      );
    }

    // Update ballot order in a transaction
    await prisma.$transaction(async (tx) => {
      // Update each ballot's order
      for (let i = 0; i < ballotOrder.length; i++) {
        const item = ballotOrder[i];

        // Check if ballot already exists
        const existingBallot = await tx.ballots.findFirst({
          where: {
            election_id: electionId,
            portfolio_id: item.portfolioId,
          },
        });

        if (existingBallot) {
          // Update existing ballot
          await tx.ballots.update({
            where: { id: existingBallot.id },
            data: { ballot_order: item.order },
          });
        } else {
          // Create new ballot
          await tx.ballots.create({
            data: {
              election_id: electionId,
              portfolio_id: item.portfolioId,
              ballot_order: item.order,
            },
          });
        }
      }
    });

    // Fetch updated ballot order
    const updatedBallots = await prisma.ballots.findMany({
      where: { election_id: electionId },
      orderBy: { ballot_order: "asc" },
      include: {
        portfolio: {
          select: {
            id: true,
            title: true,
            description: true,
            _count: {
              select: {
                candidates: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Ballot order updated successfully",
        ballots: updatedBallots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating ballot order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
