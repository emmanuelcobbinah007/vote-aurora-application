import { NextRequest, NextResponse } from "next/server";
import { voterVerificationService } from "@/libs/voterVerificationService";
import prisma from "@/libs/prisma";
import crypto from "crypto";
import { voteRateLimit } from "@/lib/rateLimit";
import { AuditTrailService } from "@/libs/auditTrailService";

interface VoteData {
  portfolio_id: string;
  candidate_id: string | null;
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const { success: rateLimitSuccess } = await voteRateLimit.limit(ip);

    if (!rateLimitSuccess) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please slow down and try again.",
        },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

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

      // 1. Atomic Check-and-Set: Try to mark token as used.
      // If it's already used, this update will fail (throw RecordNotFound)
      // because of the 'used: false' condition.
      try {
        await tx.voterTokens.update({
          where: {
            id: voter.id,
            used: false, // CRITICAL: Only update if currently unused
          },
          data: {
            used: true,
            voted_at: new Date(),
            updated_at: new Date(),
          },
        });
        console.log("✅ Voter token marked as used (atomic)");
      } catch (error: any) {
        if (error.code === "P2025") {
          // Prisma error for "Record to update not found."
          console.warn("🚫 Token already used (caught by atomic check)");
          throw new Error("ALREADY_VOTED");
        }
        throw error;
      }

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

        const voteRecord = await tx.votes.create({
          data: voteData,
        });
        voteRecords.push(voteRecord);
      }
      console.log(`✅ Created ${voteRecords.length} vote records`);

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

      return { voteRecords };
    });

    try {
      await AuditTrailService.log({
        user_id: null, // Voter actions are anonymous (no user ID)
        election_id: election.id,
        action: "VOTE_CAST",
        metadata: {
          student_id: voter.student_id,
          vote_count: votes.length,
          portfolios: votes.map((v: VoteData) => v.portfolio_id),
          timestamp: new Date().toISOString(),
        },
        ip_address:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        user_agent: request.headers.get("user-agent") || "unknown",
      });
    } catch (auditError) {
      console.error("Failed to create audit trail:", auditError);
    }

    // Generate vote receipt with verification code
    let verificationCode: string | undefined;
    try {
      const { MerkleTreeService } = await import("@/libs/merkleTreeService");

      // Create vote commitment (doesn't reveal vote choices)
      const voteData = {
        election_id: election.id,
        votes: votes.map((v: VoteData) => ({
          portfolio_id: v.portfolio_id,
          candidate_id: v.candidate_id,
        })),
        timestamp: new Date().toISOString(),
      };

      const { commitment, salt } =
        MerkleTreeService.generateVoteCommitment(voteData);
      verificationCode = MerkleTreeService.generateVerificationCode();

      await prisma.voteReceipts.create({
        data: {
          election_id: election.id,
          voter_token_hash: voterTokenHash,
          verification_code: verificationCode,
          vote_commitment: commitment,
          salt,
          issued_at: new Date(),
        },
      });

      console.log(
        `✅ Vote receipt issued: ${verificationCode} for election ${election.id}`
      );
    } catch (receiptError) {
      console.error("Failed to issue vote receipt:", receiptError);
      // Don't fail the vote if receipt fails, but log it
    }

    console.log(
      "Vote successfully cast for student:" +
        voter.student_id +
        " in election:" +
        election.id
    );

    // Send vote confirmation email with verification code
    if (verificationCode) {
      try {
        const { brevoEmailService } = await import("@/libs/brevo-email");
        const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify`;
        
        // Get voter's email from database
        const voterRecord = await prisma.voterTokens.findUnique({
          where: { id: voter.id },
          select: { student_email: true },
        });
        
        if (!voterRecord?.student_email) {
          console.error("Voter email not found:", voter.id);
          throw new Error("Voter email not available");
        }
        
        await brevoEmailService.sendEmail({
          to: voterRecord.student_email,
          subject: `Vote Confirmation - ${election.title}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                  .verification-code { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                  .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px; font-family: monospace; }
                  .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                  .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0;">✅ Vote Confirmed!</h1>
                  </div>
                  <div class="content">
                    <p>Dear Voter,</p>
                    
                    <p>Your vote has been successfully recorded for:</p>
                    <p style="font-weight: bold; font-size: 18px; color: #667eea;">${election.title}</p>
                    
                    <p>Your vote verification code is:</p>
                    
                    <div class="verification-code">
                      <div class="code">${verificationCode}</div>
                    </div>
                    
                    <p><strong>⚠️ Important:</strong> Save this code! You can use it to verify that your vote was counted.</p>
                    
                    <p style="text-align: center;">
                      <a href="${verifyUrl}" class="button">Verify Your Vote Now</a>
                    </p>
                    
                    <p>To verify your vote:</p>
                    <ol>
                      <li>Visit: <a href="${verifyUrl}">${verifyUrl}</a></li>
                      <li>Enter your verification code: <strong>${verificationCode}</strong></li>
                      <li>See cryptographic proof your vote was recorded</li>
                    </ol>
                    
                    <p style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                      <strong>🔒 Your vote remains secret!</strong><br>
                      The verification system proves your vote was counted without revealing who you voted for.
                    </p>
                    
                    <p>Thank you for participating in this election!</p>
                  </div>
                  <div class="footer">
                    <p>This is an automated message from VoteAurora E-Voting System</p>
                    <p>If you did not vote in this election, please contact the election administrators immediately.</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `
Vote Confirmation - ${election.title}

Your vote has been successfully recorded!

Verification Code: ${verificationCode}

⚠️ IMPORTANT: Save this code! You can use it to verify that your vote was counted.

To verify your vote:
1. Visit: ${verifyUrl}
2. Enter your verification code: ${verificationCode}
3. See cryptographic proof your vote was recorded

🔒 Your vote remains secret!
The verification system proves your vote was counted without revealing who you voted for.

Thank you for participating in this election!

---
This is an automated message from VoteAurora E-Voting System
If you did not vote in this election, please contact the election administrators immediately.
          `,
        });

        console.log(`📧 Vote confirmation email sent to ${voterRecord.student_email}`);
      } catch (emailError) {
        console.error("Failed to send vote confirmation email:", emailError);
        // Don't fail the vote if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your vote has been successfully recorded",
      verification_code: verificationCode, // NEW: Return verification code to voter
      data: {
        election_id: election.id,
        election_title: election.title,
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
          message:
            error.message === "ALREADY_VOTED" ||
            error.message.includes("already voted")
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
