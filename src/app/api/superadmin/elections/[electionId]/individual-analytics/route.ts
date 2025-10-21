import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";

interface RouteParams {
  params: Promise<{
    electionId: string;
  }>;
}

// Individual Election Analytics API - Purpose-built for single election insights
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await validateSuperAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  try {
    const { electionId } = await params;

    // 1. Get election details with relationships
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      include: {
        creator: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
        portfolios: {
          include: {
            candidates: {
              select: {
                id: true,
                full_name: true,
                photo_url: true,
                manifesto: true,
              },
            },
          },
        },
        adminAssignments: {
          include: {
            admin: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
            assigner: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!election) {
      return NextResponse.json(
        { success: false, error: "Election not found" },
        { status: 404 }
      );
    }

    // 2. Get voting metrics
    const [totalVotes, totalEligibleVoters] = await Promise.all([
      prisma.votes.count({ where: { election_id: electionId } }),
      prisma.voterTokens.count({ where: { election_id: electionId } }),
    ]);

    const turnoutPercentage =
      totalEligibleVoters > 0 ? (totalVotes / totalEligibleVoters) * 100 : 0;

    // 3. Get candidate performance
    const candidateVotes = await prisma.votes.groupBy({
      by: ["candidate_id"],
      where: { election_id: electionId },
      _count: {
        candidate_id: true,
      },
    });

    const candidatePerformance = candidateVotes
      .map((cv) => {
        // Find candidate in portfolios
        const candidate = election.portfolios
          .flatMap((p) => p.candidates)
          .find((c) => c.id === cv.candidate_id);

        const portfolio = election.portfolios.find((p) =>
          p.candidates.some((c) => c.id === cv.candidate_id)
        );

        const votes = cv._count.candidate_id;
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

        return {
          candidateId: cv.candidate_id,
          candidateName: candidate?.full_name || "Unknown Candidate",
          candidatePhoto: candidate?.photo_url || null,
          portfolioId: portfolio?.id || "unknown",
          portfolioTitle: portfolio?.title || "Unknown Portfolio",
          votes,
          percentage: parseFloat(percentage.toFixed(2)),
        };
      })
      .sort((a, b) => b.votes - a.votes); // Sort by votes descending

    // 4. Get portfolio distribution
    const portfolioVotes = await prisma.votes.groupBy({
      by: ["portfolio_id"],
      where: { election_id: electionId },
      _count: {
        portfolio_id: true,
      },
    });

    const portfolioDistribution = portfolioVotes
      .map((pv) => {
        const portfolio = election.portfolios.find(
          (p) => p.id === pv.portfolio_id
        );
        const votes = pv._count.portfolio_id;
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

        return {
          portfolioId: pv.portfolio_id,
          portfolioTitle: portfolio?.title || "Unknown Portfolio",
          portfolioDescription: portfolio?.description || null,
          votes,
          percentage: parseFloat(percentage.toFixed(2)),
          candidatesCount: portfolio?.candidates.length || 0,
        };
      })
      .sort((a, b) => b.votes - a.votes);

    // 5. Get hourly voting trends (during election period)
    const startTime = election.start_time;
    const endTime = election.status === "LIVE" ? new Date() : election.end_time;

    const hourlyVotingTrends = await prisma.$queryRaw<
      Array<{ hour: string; votes: number }>
    >`
      SELECT 
        TO_CHAR(cast_at, 'YYYY-MM-DD HH24:00') as hour,
        COUNT(*)::int as votes
      FROM "Votes"
      WHERE election_id = ${electionId}
        AND cast_at >= ${startTime}
        AND cast_at <= ${endTime}
      GROUP BY TO_CHAR(cast_at, 'YYYY-MM-DD HH24:00')
      ORDER BY hour ASC
    `;

    // 6. Get voter participation timeline (used tokens over time)
    const voterParticipationTimeline = await prisma.$queryRaw<
      Array<{ hour: string; voters: number }>
    >`
      SELECT 
        TO_CHAR(used_at, 'YYYY-MM-DD HH24:00') as hour,
        COUNT(*)::int as voters
      FROM "VoterTokens"
      WHERE election_id = ${electionId}
        AND used = true
        AND used_at >= ${startTime}
        AND used_at <= ${endTime}
      GROUP BY TO_CHAR(used_at, 'YYYY-MM-DD HH24:00')
      ORDER BY hour ASC
    `;

    // 7. Calculate voting efficiency metrics
    const usedTokens = await prisma.voterTokens.count({
      where: {
        election_id: electionId,
        used: true,
      },
    });

    const votingEfficiency =
      usedTokens > 0 ? (totalVotes / usedTokens) * 100 : 0;

    // 8. Prepare response data
    const analyticsData = {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        status: election.status,
        isGeneral: election.is_general,
        department: election.department,
        startTime: election.start_time.toISOString(),
        endTime: election.end_time.toISOString(),
        createdAt: election.created_at.toISOString(),
        updatedAt: election.updated_at.toISOString(),
        creator: election.creator,
        approver: election.approver,
      },
      metrics: {
        totalVotes,
        totalEligibleVoters,
        usedTokens,
        turnoutPercentage: parseFloat(turnoutPercentage.toFixed(2)),
        votingEfficiency: parseFloat(votingEfficiency.toFixed(2)),
        portfoliosCount: election.portfolios.length,
        candidatesCount: election.portfolios.reduce(
          (sum, p) => sum + p.candidates.length,
          0
        ),
        assignedAdminsCount: election.adminAssignments.length,
      },
      candidatePerformance,
      portfolioDistribution,
      votingTimeline: {
        hourlyVotes: hourlyVotingTrends.map((trend) => ({
          hour: trend.hour,
          votes: trend.votes,
        })),
        hourlyVoters: voterParticipationTimeline.map((trend) => ({
          hour: trend.hour,
          voters: trend.voters,
        })),
      },
      assignedAdmins: election.adminAssignments.map((assignment) => ({
        id: assignment.id,
        admin: assignment.admin,
        assignedBy: assignment.assigner,
        assignedAt: assignment.created_at.toISOString(),
      })),
      portfolios: election.portfolios.map((portfolio) => ({
        id: portfolio.id,
        title: portfolio.title,
        description: portfolio.description,
        candidatesCount: portfolio.candidates.length,
        candidates: portfolio.candidates,
      })),
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching individual election analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch individual election analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
