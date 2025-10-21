import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

// Helper function to fetch election with analytics data
async function fetchElectionWithAnalytics(electionId: string) {
  return await prisma.elections.findUnique({
    where: { id: electionId },
    include: {
      portfolios: {
        include: {
          candidates: {
            include: {
              _count: {
                select: { votes: true },
              },
            },
          },
        },
      },
      _count: {
        select: { votes: true },
      },
    },
  });
}

// Helper function to calculate turnout statistics
async function calculateTurnoutStats(electionId: string, totalVotes: number) {
  const totalVoters = await prisma.voterTokens.count({
    where: { election_id: electionId },
  });

  const turnoutPercentage =
    totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;

  return {
    totalVoters,
    turnoutPercentage,
  };
}

// Helper function to calculate portfolio distribution
function calculatePortfolioDistribution(portfolios: any[], totalVotes: number) {
  return portfolios.map((portfolio) => {
    const portfolioVotes = portfolio.candidates.reduce(
      (sum: number, candidate: any) => sum + candidate._count.votes,
      0
    );
    return {
      name: portfolio.title,
      votes: portfolioVotes,
      percentage: totalVotes > 0 ? (portfolioVotes / totalVotes) * 100 : 0,
    };
  });
}

// Helper function to calculate candidate performance
function calculateCandidatePerformance(portfolios: any[], totalVotes: number) {
  return portfolios.flatMap((portfolio) =>
    portfolio.candidates.map((candidate: any) => ({
      name: candidate.full_name,
      portfolio: portfolio.title,
      votes: candidate._count.votes,
      percentage:
        totalVotes > 0 ? (candidate._count.votes / totalVotes) * 100 : 0,
    }))
  );
}

// Helper function to generate real voter demographics data
async function generateVoterDemographics(electionId: string) {
  const voterTokens = await prisma.voterTokens.findMany({
    where: { election_id: electionId },
  });

  const totalVoters = voterTokens.length;
  const usedTokens = voterTokens.filter((token) => token.used).length;
  const unusedTokens = totalVoters - usedTokens;

  return [
    {
      category: "Voted",
      count: usedTokens,
      percentage: totalVoters > 0 ? (usedTokens / totalVoters) * 100 : 0,
    },
    {
      category: "Not Voted",
      count: unusedTokens,
      percentage: totalVoters > 0 ? (unusedTokens / totalVoters) * 100 : 0,
    },
    {
      category: "Total Eligible",
      count: totalVoters,
      percentage: 100,
    },
  ];
}

// Helper function to generate real hourly voting trends
async function generateHourlyVotingTrends(electionId: string) {
  const votes = await prisma.votes.findMany({
    where: { election_id: electionId },
    select: { cast_at: true },
  });

  // Initialize 24-hour array with zeros
  const hourlyTrends = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, "0")}:00`,
    votes: 0,
  }));

  // Count votes by hour
  votes.forEach((vote) => {
    const hour = vote.cast_at.getHours();
    hourlyTrends[hour].votes++;
  });

  return hourlyTrends;
}

// Helper function to build analytics response with better parameter structure
interface AnalyticsParams {
  election: any;
  totalVotes: number;
  totalVoters: number;
  turnoutPercentage: number;
  portfolioDistribution: any[];
  candidatePerformance: any[];
  hourlyVotingTrends: any[];
  voterDemographics: any[];
}

function buildAnalyticsResponse(params: AnalyticsParams) {
  const {
    election,
    totalVotes,
    totalVoters,
    turnoutPercentage,
    portfolioDistribution,
    candidatePerformance,
    hourlyVotingTrends,
    voterDemographics,
  } = params;

  return {
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
    turnoutPercentage,
    portfoliosCount: election.portfolios.length,
    candidatesCount: election.portfolios.reduce(
      (sum: number, p: any) => sum + p.candidates.length,
      0
    ),
    status: election.status,
    portfolioDistribution,
    hourlyVotingTrends,
    voterDemographics,
    candidatePerformance,
  };
}

// Main analytics processing function
async function processElectionAnalytics(electionId: string) {
  const election = await fetchElectionWithAnalytics(electionId);

  if (!election) {
    return null;
  }

  const totalVotes = election._count.votes;
  const { totalVoters, turnoutPercentage } = await calculateTurnoutStats(
    electionId,
    totalVotes
  );
  const portfolioDistribution = calculatePortfolioDistribution(
    election.portfolios,
    totalVotes
  );
  const candidatePerformance = calculateCandidatePerformance(
    election.portfolios,
    totalVotes
  );

  // Fetch real analytics data
  const hourlyVotingTrends = await generateHourlyVotingTrends(electionId);
  const voterDemographics = await generateVoterDemographics(electionId);

  return buildAnalyticsResponse({
    election,
    totalVotes,
    totalVoters,
    turnoutPercentage,
    portfolioDistribution,
    candidatePerformance,
    hourlyVotingTrends,
    voterDemographics,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { electionId: string } }
) {
  try {
    const { electionId } = params;

    const analyticsData = await processElectionAnalytics(electionId);

    if (!analyticsData) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
