import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { validateSuperAdmin, createAuthErrorResponse } from "@/libs/auth-utils";

type RecentElectionItem = {
  election: {
    id: string;
    title: string;
    status: string;
    start_time: string;
    end_time: string;
    created_at: string;
  };
  totalVotes: number;
  totalVoters: number;
  turnoutPercentage: number;
  portfoliosCount: number;
  candidatesCount: number;
  status: string;
};

// Helper: format month name from SQL result if needed
function normalizeMonth(row: any) {
  if (!row) return null;
  // row.month might already be a string like 'Jan'
  return row.month || row.mon || row.month_name || null;
}

// Analytics data service to organize complex calculations
class AnalyticsService {
  static async getBasicCounts() {
    const [
      totalElections,
      activeElections,
      completedElections,
      draftElections,
      totalVotes,
    ] = await Promise.all([
      prisma.elections.count(),
      prisma.elections.count({ where: { status: "LIVE" } }),
      prisma.elections.count({ where: { status: "CLOSED" } }),
      prisma.elections.count({ where: { status: "DRAFT" } }),
      prisma.votes.count(),
    ]);

    const totalVoterTokens = await prisma.voterTokens.count();

    return {
      totalElections,
      activeElections,
      completedElections,
      draftElections,
      totalVotes,
      totalVoterTokens,
    };
  }

  static async getRecentElections(): Promise<RecentElectionItem[]> {
    const recent = await prisma.elections.findMany({
      orderBy: { created_at: "desc" },
      take: 20, // Increased from 3 to 20 to show more elections in the chart
      select: {
        id: true,
        title: true,
        status: true,
        start_time: true,
        end_time: true,
        created_at: true,
      },
    });

    return await Promise.all(
      recent.map(async (e) => {
        const [votesCount, votersCount, portfoliosCount, candidatesCount] =
          await Promise.all([
            prisma.votes.count({ where: { election_id: e.id } }),
            prisma.voterTokens.count({ where: { election_id: e.id } }),
            prisma.portfolios.count({ where: { election_id: e.id } }),
            prisma.candidates.count({ where: { election_id: e.id } }),
          ]);

        // Get distinct voters who actually voted
        const distinctVotersWhoVoted = await prisma.voterTokens.count({
          where: {
            election_id: e.id,
            OR: [{ used: true }, { voted_at: { not: null } }],
          },
        });

        const turnout =
          votersCount === 0
            ? 0
            : (distinctVotersWhoVoted / Math.max(1, votersCount)) * 100;

        return {
          election: {
            id: e.id,
            title: e.title,
            status: e.status,
            start_time: e.start_time.toISOString(),
            end_time: e.end_time.toISOString(),
            created_at: e.created_at.toISOString(),
          },
          totalVotes: votesCount,
          totalVoters: votersCount,
          turnoutPercentage: parseFloat(turnout.toFixed(1)),
          portfoliosCount,
          candidatesCount,
          status: e.status,
        };
      })
    );
  }

  static async getPortfolioDistribution() {
    const portfolios = await prisma.portfolios.findMany({
      select: { id: true, title: true, candidates: { select: { id: true } } },
    });

    const portfolioDistributionPromises = portfolios.map(async (p) => {
      const candidateIds = p.candidates.map((c) => c.id);
      const votes = candidateIds.length
        ? await prisma.votes.count({
            where: { candidate_id: { in: candidateIds } },
          })
        : 0;
      return { name: p.title, votes };
    });

    const portfolioDistributionRaw = await Promise.all(
      portfolioDistributionPromises
    );
    const totalPortfolioVotes = portfolioDistributionRaw.reduce(
      (s, p) => s + p.votes,
      0
    );

    return portfolioDistributionRaw.map((p) => ({
      name: p.name,
      votes: p.votes,
      percentage: totalPortfolioVotes
        ? parseFloat(((p.votes / totalPortfolioVotes) * 100).toFixed(1))
        : 0,
    }));
  }

  static async getMonthlyTrends() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentVotes = await prisma.votes.findMany({
      where: {
        cast_at: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        cast_at: true,
      },
    });

    // Group votes by month
    const monthGroups: Record<string, number> = {};
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    recentVotes.forEach((vote) => {
      const month = months[vote.cast_at.getMonth()];
      monthGroups[month] = (monthGroups[month] || 0) + 1;
    });

    return Object.entries(monthGroups).map(([month, votes]) => ({
      month,
      votes,
    }));
  }

  static calculateAverageTurnout(totalVotes: number, totalVoterTokens: number) {
    return totalVoterTokens === 0
      ? 0
      : parseFloat(((totalVotes / totalVoterTokens) * 100).toFixed(1));
  }
}

export async function GET(req: NextRequest) {
  // authorize
  const auth = await validateSuperAdmin(req);
  if (!auth.success) return createAuthErrorResponse(auth);

  try {
    // Get all analytics data using service methods
    const basicCounts = await AnalyticsService.getBasicCounts();
    const recentElections = await AnalyticsService.getRecentElections();
    const portfolioDistribution =
      await AnalyticsService.getPortfolioDistribution();
    const monthlyTrends = await AnalyticsService.getMonthlyTrends();

    // Calculate derived metrics
    const averageTurnout = AnalyticsService.calculateAverageTurnout(
      basicCounts.totalVotes,
      basicCounts.totalVoterTokens
    );

    // Voter demographics placeholder
    const voterDemographics: Array<{
      category: string;
      count: number;
      percentage: number;
    }> = [];

    const payload = {
      ...basicCounts,
      totalVoters: basicCounts.totalVoterTokens,
      averageTurnout,
      recentElections,
      portfolioDistribution,
      monthlyTrends,
      voterDemographics,
    };

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (err) {
    console.error("/api/superadmin/analytics error", err);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
