import { NextRequest, NextResponse } from "next/server";
import { voterVerificationService } from "@/libs/voterVerificationService";
import prisma from "@/libs/prisma";
import crypto from "crypto";

interface VoteData {
  portfolio_id: string;
  candidate_id: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const { access_token, votes } = await request.json();

    console.log("📝 Ballot submit request:", {
      access_token: access_token?.substring(0, 8),
      votes,
    });

    if (!access_token) {
      return NextResponse.json(
        { success: false, message: "Access token is required" },
        { status: 400 }
      );
    }

    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vote data is required" },
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

    const { voter, election } = validationResult.data;

    console.log("👤 Voter data:", {
      id: voter.id,
      type: typeof voter.id,
      student_id: voter.student_id,
    });

    // Get full election details including status
    const fullElection = await prisma.elections.findUnique({
      where: { id: election.id },
      select: {
        id: true,
        status: true,
        end_time: true,
      },
    });

    if (!fullElection) {
      return NextResponse.json(
        { success: false, message: "Election not found" },
        { status: 404 }
      );
    }

    const voterTokenHash = crypto
      .createHash("sha256")
      .update(voter.id)
      .digest("hex");

    console.log("🔐 Voter token hash:", voterTokenHash);
    const existingVote = await prisma.votes.findFirst({
      where: {
        election_id: election.id,
        voter_token_hash: voterTokenHash,
      },
    });

    if (existingVote) {
      console.log(`🚫 Duplicate vote attempt detected:`, {
        student_id: voter.student_id,
        election_id: election.id,
        voter_hash: voterTokenHash.substring(0, 8) + "...",
        existing_vote_date: existingVote.cast_at,
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

    if (fullElection.status !== "LIVE") {
      return NextResponse.json(
        { success: false, message: "Election is not currently active" },
        { status: 403 }
      );
    }

    if (new Date() > new Date(fullElection.end_time)) {
      return NextResponse.json(
        { success: false, message: "Election has ended" },
        { status: 403 }
      );
    }

    const electionData = await prisma.elections.findUnique({
      where: { id: election.id },
      include: {
        portfolios: {
          include: { candidates: true },
        },
      },
    });

    if (!electionData) {
      return NextResponse.json(
        { success: false, message: "Election not found" },
        { status: 404 }
      );
    }

    // Simple validation - just check that we have votes for all portfolios
    const portfolioIds = electionData.portfolios.map((p) => p.id);
    const votedPortfolioIds = votes.map((v: VoteData) => v.portfolio_id);

    // For abstention support, we allow votes with null candidate_id
    // But we still require a vote record for each portfolio
    const missingPortfolios = portfolioIds.filter(
      (id) => !votedPortfolioIds.includes(id)
    );

    if (missingPortfolios.length > 0) {
      return NextResponse.json(
        { success: false, message: "Votes required for all positions" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      console.log("🔄 Starting transaction");
      const voteRecords = [];

      for (const vote of votes) {
        console.log("🗳️ Creating vote:", JSON.stringify(vote, null, 2));
        const voteData: any = {
          election_id: election.id,
          portfolio_id: vote.portfolio_id,
          voter_token_hash: voterTokenHash,
          cast_at: new Date(),
        };

        // Only set candidate_id if it's not null
        if (vote.candidate_id !== null) {
          voteData.candidate_id = vote.candidate_id;
        }

        console.log(
          "📝 Vote data to create:",
          JSON.stringify(voteData, null, 2)
        );
        const voteRecord = await tx.votes.create({
          data: voteData,
        });
        console.log("✅ Vote created:", voteRecord.id);
        voteRecords.push(voteRecord);
      }

      console.log("🔄 Updating voter token");
      await tx.voterTokens.update({
        where: { id: voter.id },
        data: {
          used: true,
          voted_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log("✅ Voter token updated");

      console.log("🔄 Updating student session");
      await tx.studentSessions.updateMany({
        where: {
          student_id: voter.student_id,
          election_id: election.id,
          access_token: access_token,
        },
        data: {
          session_status: "voted",
          vote_completed_at: new Date(),
          updated_at: new Date(),
        },
      });
      console.log("✅ Student session updated");

      console.log("🔄 Skipping analytics for now");

      return { voteRecords };
    });

    try {
      await prisma.auditTrail.create({
        data: {
          user_id: "System", // Use system user for voter actions
          election_id: election.id,
          action: "VOTE_CAST",
          metadata: {
            student_id: voter.student_id,
            vote_count: votes.length,
            portfolios: votes.map((v: VoteData) => v.portfolio_id),
            timestamp: new Date().toISOString(),
            ip_address:
              request.headers.get("x-forwarded-for") ||
              request.headers.get("x-real-ip") ||
              "unknown",
            user_agent: request.headers.get("user-agent") || "unknown",
          },
          timestamp: new Date(),
        },
      });
    } catch (auditError) {
      console.error("Failed to create audit trail:", auditError);
    }

    console.log(
      "Vote successfully cast for student:" +
        voter.student_id +
        " in election:" +
        election.id
    );

    return NextResponse.json({
      success: true,
      message: "Your vote has been successfully recorded",
      data: {
        election_id: election.id,
        vote_count: votes.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Vote submission error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message.includes("already voted")
            ? "You have already voted in this election"
            : "Failed to submit your vote. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while submitting your vote",
      },
      { status: 500 }
    );
  }
}
