import { NextRequest, NextResponse } from "next/server";
import { voterVerificationService } from "@/libs/voterVerificationService";
import prisma from "@/libs/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { access_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { success: false, message: "Access token is required" },
        { status: 400 }
      );
    }

    const validationResult = await voterVerificationService.validateAccessToken(
      access_token
    );

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.message || "Invalid access token",
        },
        { status: 401 }
      );
    }

    const electionData = await prisma.elections.findUnique({
      where: { id: validationResult.data.election.id },
      include: {
        portfolios: {
          include: {
            candidates: {
              select: {
                id: true,
                full_name: true,
                photo_url: true,
                manifesto: true,
                created_at: true,
              },
              orderBy: { full_name: "asc" },
            },
            ballots: {
              select: {
                ballot_order: true,
              },
            },
          },
        },
      },
    });

    if (!electionData) {
      return NextResponse.json(
        { success: false, message: "Election not found" },
        { status: 404 }
      );
    }

    const voterTokenHash = crypto
      .createHash("sha256")
      .update(validationResult.data.voter.id)
      .digest("hex");
    const existingVote = await prisma.votes.findFirst({
      where: {
        voter_token_hash: voterTokenHash,
        election_id: validationResult.data.election.id,
      },
    });

    if (existingVote) {
      console.log(`🔒 Vote already submitted:`, {
        student_id: validationResult.data.voter.student_id,
        election_id: validationResult.data.election.id,
        voter_hash: voterTokenHash.substring(0, 8) + "...",
        voted_at: existingVote.cast_at,
      });

      return NextResponse.json(
        {
          success: false,
          message: "You have already submitted your vote for this election",
          error_code: "ALREADY_VOTED",
          voted_at: existingVote.cast_at,
        },
        { status: 403 }
      );
    }

    // Prepare ballot data with portfolios sorted by ballot order
    const ballotData = {
      voter: validationResult.data.voter,
      election: {
        id: electionData.id,
        title: electionData.title,
        description: electionData.description,
        is_general: electionData.is_general,
        department: electionData.department,
        end_time: electionData.end_time,
        positions: electionData.portfolios
          .map((portfolio) => ({
            id: portfolio.id,
            title: portfolio.title,
            description: portfolio.description,
            candidates: portfolio.candidates,
            ballot_order: portfolio.ballots[0]?.ballot_order || 0,
          }))
          .sort((a, b) => a.ballot_order - b.ballot_order),
      },
      session: validationResult.data.session,
      session_expires_at: validationResult.data.session.expires_at,
    };

    return NextResponse.json({
      success: true,
      message: "Ballot loaded successfully",
      data: ballotData,
    });
  } catch (error) {
    console.error("Ballot loading error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to load ballot",
      },
      { status: 500 }
    );
  }
}
