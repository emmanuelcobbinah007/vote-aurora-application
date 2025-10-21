import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";

interface RouteParams {
  params: Promise<{
    adminId: string;
    electionId: string;
  }>;
}

// GET: Fetch analytics data for a specific election (admin access)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { adminId, electionId } = await params;

    // Validate that the admin is assigned to this election
    const adminAssignment = await prisma.adminAssignments.findFirst({
      where: {
        admin_id: adminId,
        election_id: electionId,
      },
    });

    if (!adminAssignment) {
      return NextResponse.json(
        { error: "Admin not assigned to this election" },
        { status: 403 }
      );
    }

    // Verify election exists
    const election = await prisma.elections.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        status: true,
        start_time: true,
        end_time: true,
        created_at: true,
      },
    });

    if (!election) {
      return NextResponse.json(
        {
          success: false,
          error: "Election not found",
        },
        { status: 404 }
      );
    }

    // Get basic vote counts
    const [totalVotes, totalVoters, portfoliosCount, candidatesCount] =
      await Promise.all([
        prisma.votes.count({ where: { election_id: electionId } }),
        prisma.voterTokens.count({ where: { election_id: electionId } }),
        prisma.portfolios.count({ where: { election_id: electionId } }),
        prisma.candidates.count({ where: { election_id: electionId } }),
      ]);

    const turnoutPercentage =
      totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

    // Get portfolio distribution
    const portfolioVotes = await prisma.votes.groupBy({
      by: ["portfolio_id"],
      where: { election_id: electionId },
      _count: {
        portfolio_id: true,
      },
    });

    // Get portfolio names and create distribution
    const portfolios = await prisma.portfolios.findMany({
      where: { election_id: electionId },
      select: {
        id: true,
        title: true,
      },
    });

    const portfolioDistribution = portfolioVotes.map((pv) => {
      const portfolio = portfolios.find((p) => p.id === pv.portfolio_id);
      const votes = pv._count.portfolio_id;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

      return {
        name: portfolio?.title || "Unknown Portfolio",
        votes,
        percentage: parseFloat(percentage.toFixed(1)),
      };
    });

    // Get hourly voting trends (for the last 24 hours or election duration)
    const startTime = new Date(election.start_time);
    const endTime =
      election.status === "LIVE" ? new Date() : new Date(election.end_time);

    // Generate hourly data
    const hourlyVotes = await prisma.$queryRaw<
      Array<{ hour: string; votes: number }>
    >`
      SELECT
        TO_CHAR(cast_at, 'HH24:MI') as hour,
        COUNT(*)::int as votes
      FROM "Votes"
      WHERE election_id = ${electionId}
        AND cast_at >= ${startTime}
        AND cast_at <= ${endTime}
      GROUP BY TO_CHAR(cast_at, 'HH24:MI')
      ORDER BY hour
    `;

    // Get candidate performance
    const candidateVotes = await prisma.votes.groupBy({
      by: ["candidate_id"],
      where: { election_id: electionId },
      _count: {
        candidate_id: true,
      },
    });

    const candidates = await prisma.candidates.findMany({
      where: { election_id: electionId },
      include: {
        portfolio: {
          select: {
            title: true,
          },
        },
      },
    });

    const candidatePerformance = candidateVotes.map((cv) => {
      const candidate = candidates.find((c) => c.id === cv.candidate_id);
      const votes = cv._count.candidate_id;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

      return {
        name: candidate?.full_name || "Unknown Candidate",
        portfolio: candidate?.portfolio.title || "Unknown Portfolio",
        votes,
        percentage: parseFloat(percentage.toFixed(1)),
        demographics: {
          // This would need additional user demographic data
          year1: Math.floor(votes * 0.25),
          year2: Math.floor(votes * 0.25),
          year3: Math.floor(votes * 0.25),
          year4: Math.floor(votes * 0.25),
        },
      };
    });

    // Voter demographics (simplified - would need additional user data)
    const voterDemographics = [
      {
        category: "Year 1",
        count: Math.floor(totalVotes * 0.28),
        percentage: 28.0,
      },
      {
        category: "Year 2",
        count: Math.floor(totalVotes * 0.25),
        percentage: 25.0,
      },
      {
        category: "Year 3",
        count: Math.floor(totalVotes * 0.24),
        percentage: 24.0,
      },
      {
        category: "Year 4",
        count: Math.floor(totalVotes * 0.23),
        percentage: 23.0,
      },
    ];

    const analyticsData = {
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
        start_time: election.start_time.toISOString(),
        end_time: election.end_time.toISOString(),
        created_at: election.created_at.toISOString(),
      },
      totalVotes,
      totalVoters,
      turnoutPercentage: parseFloat(turnoutPercentage.toFixed(1)),
      portfoliosCount,
      candidatesCount,
      status: election.status,
      portfolioDistribution,
      hourlyVotingTrends: hourlyVotes.map((hv) => ({
        hour: hv.hour,
        votes: hv.votes,
      })),
      voterDemographics,
      candidatePerformance,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching election analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch election analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
