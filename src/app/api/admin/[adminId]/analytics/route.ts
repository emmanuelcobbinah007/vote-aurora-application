import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import {
  getTotalVotes,
  getVotesByCandidate,
  getVotesByPortfolio,
  getDistinctVotersWhoVoted,
  getHourlyTrends,
  formatHourToLabel,
  formatDurationFromDates,
} from "@/lib/analyticsHelpers";

interface RouteParams {
  params: { adminId: string };
}

// Domain types to avoid primitive obsession
interface AnalyticsMetrics {
  totalVoters: number;
  totalVotes: number;
  turnoutPercentage: number;
}

interface ElectionData {
  id: string;
  status: string;
  portfolios: any[];
  _count: { votes: number };
  start_time?: Date | null;
  approved_by?: string | null;
}

interface AnalyticsContext {
  election: ElectionData;
  metrics: AnalyticsMetrics;
}

// Helper function to fetch admin assignment with election data
async function fetchAdminElectionData(adminId: string) {
  return await prisma.adminAssignments.findFirst({
    where: {
      admin_id: adminId,
    },
    include: {
      election: {
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
      },
    },
  });
}

// Helper function to calculate basic analytics metrics
async function calculateBasicMetrics(
  electionId: string,
  totalVotes: number
): Promise<AnalyticsMetrics> {
  const totalVoters = await prisma.voterTokens.count({
    where: { election_id: electionId },
  });

  const distinctVotersWhoVoted = await getDistinctVotersWhoVoted(electionId);

  const turnoutPercentage =
    totalVoters > 0 ? (distinctVotersWhoVoted / totalVoters) * 100 : 0;

  return {
    totalVoters,
    totalVotes,
    turnoutPercentage,
  };
}

// Helper function to transform election data
function transformElectionData(election: any) {
  return {
    id: election.id,
    title: election.title,
    description: election.description || "",
    startDate: election.start_time?.toISOString(),
    endDate: election.end_time?.toISOString(),
    status: election.status,
    _count: {
      portfolios: election.portfolios.length,
      candidates: election.portfolios.reduce(
        (sum: number, portfolio: any) => sum + portfolio.candidates.length,
        0
      ),
    },
  };
}

// Helper function to generate draft/pending analytics
function generateDraftAnalytics(context: AnalyticsContext) {
  const { election, metrics } = context;
  return {
    totalVoters: metrics.totalVoters,
    totalVotes: metrics.totalVotes,
    participationRate: metrics.turnoutPercentage,
    portfolioStats: [],
    readinessChecks: {
      portfoliosSetup: election.portfolios.length > 0,
      candidatesRegistered: election.portfolios.some(
        (p: any) => p.candidates.length > 0
      ),
      votersRegistered: metrics.totalVoters > 0,
      ballotConfigured: election.portfolios.every(
        (p: any) => p.candidates.length > 0
      ),
    },
  };
}

// Helper function to generate live election analytics
function generateLiveAnalytics(context: AnalyticsContext) {
  const { election, metrics } = context;
  const portfolioParticipation = election.portfolios.map((portfolio: any) => {
    const portfolioVotes = portfolio.candidates.reduce(
      (sum: number, candidate: any) => sum + candidate._count.votes,
      0
    );
    return {
      id: portfolio.id,
      title: portfolio.title,
      voteCount: portfolioVotes,
      participationRate:
        metrics.totalVotes > 0
          ? (portfolioVotes / metrics.totalVotes) * 100
          : 0,
    };
  });

  // Generate realistic voting trends (mock time-series data)
  const votingTrends = [
    { hour: "09:00", votes: Math.floor(metrics.totalVotes * 0.1) },
    { hour: "10:00", votes: Math.floor(metrics.totalVotes * 0.2) },
    { hour: "11:00", votes: Math.floor(metrics.totalVotes * 0.35) },
    { hour: "12:00", votes: Math.floor(metrics.totalVotes * 0.45) },
    { hour: "13:00", votes: Math.floor(metrics.totalVotes * 0.6) },
    { hour: "14:00", votes: Math.floor(metrics.totalVotes * 0.75) },
    { hour: "15:00", votes: Math.floor(metrics.totalVotes * 0.85) },
    { hour: "16:00", votes: Math.floor(metrics.totalVotes * 0.95) },
    { hour: "17:00", votes: metrics.totalVotes },
  ];

  return {
    totalVoters: metrics.totalVoters,
    totalVotes: metrics.totalVotes,
    participationRate: Math.round(metrics.turnoutPercentage * 100) / 100,
    portfolioStats: portfolioParticipation,
    hourlyTrends: votingTrends,
  };
}

// Helper function to generate closed election analytics
function generateClosedAnalytics(context: AnalyticsContext) {
  const { election, metrics } = context;
  const portfolioResults = election.portfolios.map((portfolio: any) => {
    const portfolioVotes = portfolio.candidates.reduce(
      (sum: number, candidate: any) => sum + candidate._count.votes,
      0
    );

    // Find the winner for this portfolio
    const winner = portfolio.candidates.reduce((prev: any, current: any) =>
      current._count.votes > prev._count.votes ? current : prev
    );

    const candidates = portfolio.candidates.map((candidate: any) => ({
      id: candidate.id,
      name: candidate.full_name,
      voteCount: candidate._count.votes,
      votePercentage:
        metrics.totalVotes > 0
          ? (candidate._count.votes / metrics.totalVotes) * 100
          : 0,
    }));

    return {
      portfolioId: portfolio.id,
      portfolioTitle: portfolio.title,
      winner: {
        id: winner.id,
        name: winner.full_name,
        voteCount: winner._count.votes,
        votePercentage:
          metrics.totalVotes > 0
            ? (winner._count.votes / metrics.totalVotes) * 100
            : 0,
      },
      candidates,
    };
  });

  const portfolioStats = election.portfolios.map((portfolio: any) => {
    const portfolioVotes = portfolio.candidates.reduce(
      (sum: number, candidate: any) => sum + candidate._count.votes,
      0
    );
    return {
      id: portfolio.id,
      title: portfolio.title,
      voteCount: portfolioVotes,
      participationRate:
        metrics.totalVotes > 0
          ? (portfolioVotes / metrics.totalVotes) * 100
          : 0,
    };
  });

  // Calculate final stats
  const finalStats = {
    totalDuration: "8 hours", // This would be calculated from actual start/end times
    peakVotingHour: "14:00",
    averageVotesPerHour: Math.floor(metrics.totalVotes / 8),
  };

  return {
    totalVoters: metrics.totalVoters,
    totalVotes: metrics.totalVotes,
    participationRate: Math.round(metrics.turnoutPercentage * 100) / 100,
    portfolioStats,
    results: portfolioResults,
    finalStats,
  };
}

// Helper function to handle draft/pending status analytics
function handleDraftPendingStatus(context: AnalyticsContext) {
  return generateDraftAnalytics(context);
}

// Helper function to handle approved status analytics
function handleApprovedStatus(context: AnalyticsContext) {
  return {
    ...generateDraftAnalytics(context),
    approvalMetadata: {
      approvedAt: context.election.approved_by
        ? new Date().toISOString()
        : null,
      scheduledStart: context.election.start_time?.toISOString(),
    },
  };
}

// Helper function to handle live status analytics
function handleLiveStatus(context: AnalyticsContext) {
  return generateLiveAnalytics(context);
}

// Helper function to handle closed status analytics
function handleClosedStatus(context: AnalyticsContext) {
  return generateClosedAnalytics(context);
}

// Helper function to handle archived status analytics
function handleArchivedStatus(context: AnalyticsContext) {
  return {
    ...generateClosedAnalytics(context),
    archivalMetadata: {
      archivedAt: new Date().toISOString(),
      retentionPeriod: "5 years",
    },
  };
}

// Helper function to handle default/unknown status
function handleDefaultStatus(context: AnalyticsContext) {
  return {
    totalVoters: context.metrics.totalVoters,
    totalVotes: context.metrics.totalVotes,
    participationRate: context.metrics.turnoutPercentage,
    portfolioStats: [],
  };
}

// Helper function to determine if status is draft or pending
function isDraftOrPending(status: string): boolean {
  return status === "DRAFT" || status === "PENDING_APPROVAL";
}

// Helper function to generate status-specific analytics
function generateStatusSpecificAnalytics(context: AnalyticsContext) {
  const { election } = context;

  if (isDraftOrPending(election.status)) {
    return handleDraftPendingStatus(context);
  }

  if (election.status === "APPROVED") {
    return handleApprovedStatus(context);
  }

  if (election.status === "LIVE") {
    return handleLiveStatus(context);
  }

  if (election.status === "CLOSED") {
    return handleClosedStatus(context);
  }

  if (election.status === "ARCHIVED") {
    return handleArchivedStatus(context);
  }

  return handleDefaultStatus(context);
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { adminId } = params;

    // Get admin assignment with election data
    const adminAssignment = await fetchAdminElectionData(adminId);

    if (!adminAssignment) {
      return NextResponse.json(
        { error: "Admin assignment not found" },
        { status: 404 }
      );
    }

    const election = adminAssignment.election;

    // Calculate accurate total votes from Votes table
    const totalVotes = await getTotalVotes(election.id);

    // Calculate basic metrics (total eligible voters and turnout)
    const votersWhoVoted = await getDistinctVotersWhoVoted(election.id);
    const totalVoters = await prisma.voterTokens.count({
      where: { election_id: election.id },
    });
    const turnoutPercentage =
      totalVoters > 0 ? (votersWhoVoted / totalVoters) * 100 : 0;

    const metrics = {
      totalVoters,
      totalVotes,
      turnoutPercentage,
    };

    // Transform election data
    const transformedElection = transformElectionData(election);

    // Create analytics context with domain types
    const analyticsContext: AnalyticsContext = {
      election,
      metrics,
    };

    // Replace mocked/derived analytics for closed/live with real aggregations
    // Votes by candidate
    const votesByCandidate = await getVotesByCandidate(election.id);

    // Votes by portfolio
    const votesByPortfolio = await getVotesByPortfolio(election.id);

    // Hourly trends
    const hourlyRows = await getHourlyTrends(election.id);
    const hourlyTrends = hourlyRows.map((r: any) => ({
      hour: formatHourToLabel(r.hour),
      votes: r.votes,
    }));

    const peakRow = hourlyRows.reduce(
      (prev: any, curr: any) => (curr.votes > (prev?.votes ?? 0) ? curr : prev),
      null
    );
    const peakVotingHour = peakRow ? formatHourToLabel(peakRow.hour) : null;

    const durationHours = Math.max(
      1,
      Math.abs(
        new Date(election.end_time).getTime() -
          new Date(election.start_time).getTime()
      ) /
        (1000 * 60 * 60)
    );
    const averageVotesPerHour = Math.round(totalVotes / durationHours);

    // Build portfolioStats and results using the accurate counts
    const portfolioStats = votesByPortfolio.map((p: any) => ({
      id: p.portfolio_id,
      title: p.title,
      voteCount: p.votes,
      participationRate: totalVotes > 0 ? (p.votes / totalVotes) * 100 : 0,
    }));

    const results = await Promise.all(
      votesByPortfolio.map(async (p: any) => {
        const candidateRows = votesByCandidate.filter((c: any) => {
          // we'll join candidate -> portfolio via Candidates table; simpler approach: query candidates for this portfolio
          return true; // we'll compute candidates below per portfolio
        });

        // fetch candidates for the portfolio
        const candidates = await prisma.candidates.findMany({
          where: { portfolio_id: p.portfolio_id },
        });

        const candidateResults = await Promise.all(
          candidates.map(async (c: any) => {
            const row = votesByCandidate.find(
              (v: any) => v.candidate_id === c.id
            );
            const votes = row ? row.votes : 0;
            return {
              id: c.id,
              name: c.full_name,
              voteCount: votes,
              votePercentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0,
            };
          })
        );

        const winner = candidateResults.reduce(
          (a: any, b: any) => (b.voteCount > a.voteCount ? b : a),
          candidateResults[0] || {
            id: "",
            name: "",
            voteCount: 0,
            votePercentage: 0,
          }
        );

        return {
          portfolioId: p.portfolio_id,
          portfolioTitle: p.title,
          winner,
          candidates: candidateResults,
        };
      })
    );

    const analytics = {
      totalVoters: metrics.totalVoters,
      totalVotes: metrics.totalVotes,
      participationRate: Math.round(metrics.turnoutPercentage * 100) / 100,
      portfolioStats,
      hourlyTrends,
      results,
      finalStats: {
        totalDuration:
          formatDurationFromDates(election.start_time, election.end_time) ??
          null,
        peakVotingHour,
        averageVotesPerHour,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        election: transformedElection,
        analytics,
      },
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
