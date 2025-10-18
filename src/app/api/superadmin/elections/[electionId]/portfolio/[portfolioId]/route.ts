import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// PUT - Update a portfolio
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string; portfolioId: string }> }
) {
  try {
    const { electionId, portfolioId } = await params;
    const body = await request.json();
    const { title, description } = body;

    // Validate required fields
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Portfolio title is required" },
        { status: 400 }
      );
    }

    // Validate that the portfolio exists and belongs to this election
    const existingPortfolio = await prisma.portfolios.findFirst({
      where: {
        id: portfolioId,
        election_id: electionId,
      },
      include: {
        election: true,
      },
    });

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Check if election is in a state where portfolios can be modified
    if (
      existingPortfolio.election.status === "LIVE" ||
      existingPortfolio.election.status === "CLOSED" ||
      existingPortfolio.election.status === "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot modify portfolios in an election that is live, closed, or archived",
        },
        { status: 400 }
      );
    }

    // Check if another portfolio with the same title already exists (excluding current one)
    const duplicatePortfolio = await prisma.portfolios.findFirst({
      where: {
        election_id: electionId,
        title: title.trim(),
        id: { not: portfolioId },
      },
    });

    if (duplicatePortfolio) {
      return NextResponse.json(
        {
          error: "A portfolio with this title already exists in this election",
        },
        { status: 409 }
      );
    }

    // Update the portfolio
    const updatedPortfolio = await prisma.portfolios.update({
      where: { id: portfolioId },
      data: {
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

    return NextResponse.json(
      {
        message: "Portfolio updated successfully",
        portfolio: updatedPortfolio,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a portfolio
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ electionId: string; portfolioId: string }> }
) {
  try {
    const { electionId, portfolioId } = await params;

    // Validate that the portfolio exists and belongs to this election
    const existingPortfolio = await prisma.portfolios.findFirst({
      where: {
        id: portfolioId,
        election_id: electionId,
      },
      include: {
        election: true,
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    });

    if (!existingPortfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 }
      );
    }

    // Check if election is in a state where portfolios can be deleted
    if (
      existingPortfolio.election.status === "LIVE" ||
      existingPortfolio.election.status === "CLOSED" ||
      existingPortfolio.election.status === "ARCHIVED"
    ) {
      return NextResponse.json(
        {
          error:
            "Cannot delete portfolios from an election that is live, closed, or archived",
        },
        { status: 400 }
      );
    }

    // Check if portfolio has candidates
    if (existingPortfolio._count.candidates > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete portfolio that has candidates. Please remove all candidates first.",
        },
        { status: 400 }
      );
    }

    // Delete the portfolio and update ballot orders in a transaction
    await prisma.$transaction(async (tx) => {
      // Get the ballot order of the portfolio being deleted
      const ballotToDelete = await tx.ballots.findFirst({
        where: {
          election_id: electionId,
          portfolio_id: portfolioId,
        },
      });

      // Delete the portfolio (this will also cascade delete related ballots due to foreign key)
      await tx.portfolios.delete({
        where: { id: portfolioId },
      });

      // If there was a ballot entry, reorder the remaining ballots
      if (ballotToDelete) {
        // Update ballot orders for portfolios that came after the deleted one
        await tx.ballots.updateMany({
          where: {
            election_id: electionId,
            ballot_order: { gt: ballotToDelete.ballot_order },
          },
          data: {
            ballot_order: { decrement: 1 },
          },
        });
      }
    });

    return NextResponse.json(
      { message: "Portfolio deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
