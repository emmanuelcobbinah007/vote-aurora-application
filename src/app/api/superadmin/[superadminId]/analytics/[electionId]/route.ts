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

// Fetch election by id with necessary relations
async function fetchElectionById(electionId: string) {
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

function generateClosedAnalytics(context: AnalyticsContext) {
  const { election, metrics } = context;
  const portfolioResults = election.portfolios.map((portfolio: any) => {
    const portfolioVotes = portfolio.candidates.reduce(
      (sum: number, candidate: any) => sum + candidate._count.votes,
      0
    );

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

  const finalStats = {
    totalDuration: "8 hours",
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

function isDraftOrPending(status: string): boolean {
  return status === "DRAFT" || status === "PENDING_APPROVAL";
}

function generateStatusSpecificAnalytics(context: AnalyticsContext) {
  const { election } = context;

  if (isDraftOrPending(election.status)) {
    return generateDraftAnalytics(context);
  }

  if (election.status === "APPROVED") {
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

  if (election.status === "LIVE") {
    return generateLiveAnalytics(context);
  }

  if (election.status === "CLOSED") {
    return generateClosedAnalytics(context);
  }

  if (election.status === "ARCHIVED") {
    return {
      ...generateClosedAnalytics(context),
      archivalMetadata: {
        archivedAt: new Date().toISOString(),
        retentionPeriod: "5 years",
      },
    };
  }

  return {
    totalVoters: context.metrics.totalVoters,
    totalVotes: context.metrics.totalVotes,
    participationRate: context.metrics.turnoutPercentage,
    portfolioStats: [],
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { superadminId: string; electionId: string } }
) {
  try {
    // `params` can be a Promise in some Next.js runtimes — await it before use
    const { electionId } = (await params) as { electionId: string };

    const election = await fetchElectionById(electionId);

    if (!election) {
      return NextResponse.json(
        { error: "Election not found" },
        { status: 404 }
      );
    }

    const totalVotes = await getTotalVotes(election.id);

    const votersWhoVoted = await getDistinctVotersWhoVoted(election.id);
    const totalVoters = await prisma.voterTokens.count({
      where: { election_id: election.id },
    });
    const turnoutPercentage =
      totalVoters > 0 ? (votersWhoVoted / totalVoters) * 100 : 0;

    const metrics = { totalVoters, totalVotes, turnoutPercentage };

    const transformedElection = transformElectionData(election);

    // accurate aggregations
    const votesByCandidate = await getVotesByCandidate(election.id);
    const votesByPortfolio = await getVotesByPortfolio(election.id);
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

    const portfolioStats = votesByPortfolio.map((p: any) => ({
      id: p.portfolio_id,
      title: p.title,
      voteCount: p.votes,
      participationRate: totalVotes > 0 ? (p.votes / totalVotes) * 100 : 0,
    }));

    const results = await Promise.all(
      votesByPortfolio.map(async (p: any) => {
        const candidates = await prisma.candidates.findMany({
          where: { portfolio_id: p.portfolio_id },
        });
        const candidateResults = candidates.map((c: any) => {
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
        });
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
      data: { election: transformedElection, analytics },
    });
  } catch (error) {
    console.error("Error fetching superadmin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
