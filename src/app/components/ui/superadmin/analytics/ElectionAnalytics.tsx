"use client";

import React, { useState, useEffect } from "react";
import {
  Election,
  PortfolioAnalytics,
  CandidateAnalytics,
  VotingTrend,
  TurnoutAnalytics,
  mockElections,
  mockPortfolios,
  mockCandidates,
  mockAnalyticsData,
} from "./analyticsTypes";
import { getCandidateColor } from "../../admin/reports/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  Vote,
  Calendar,
  BarChart3,
  Activity,
  ArrowLeft,
  Download,
  Clock,
  Award,
  Target,
} from "lucide-react";
import Link from "next/link";

interface ElectionAnalyticsProps {
  electionId: string;
  superadminId?: string;
}

const ElectionAnalytics: React.FC<ElectionAnalyticsProps> = ({
  electionId,
  superadminId = "superadmin-001",
}) => {
  const [election, setElection] = useState<Election | null>(null);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<
    PortfolioAnalytics[]
  >([]);
  const [votingTrends, setVotingTrends] = useState<VotingTrend[]>([]);
  const [turnoutAnalytics, setTurnoutAnalytics] =
    useState<TurnoutAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadElectionAnalytics = () => {
      // Find the election
      const foundElection = mockElections.find((e) => e.id === electionId);
      if (!foundElection) return;

      setElection(foundElection);

      // Get portfolios for this election
      const electionPortfolios = mockPortfolios.filter(
        (p) => p.election_id === electionId
      );

      // Build portfolio analytics
      const portfolioAnalyticsData: PortfolioAnalytics[] =
        electionPortfolios.map((portfolio) => {
          const portfolioCandidates = mockCandidates.filter(
            (c) => c.portfolio_id === portfolio.id
          );
          const portfolioAnalyticsRecords = mockAnalyticsData.filter(
            (a) => a.portfolio_id === portfolio.id
          );

          const candidateAnalytics: CandidateAnalytics[] = portfolioCandidates
            .map((candidate) => {
              const analyticsRecord = portfolioAnalyticsRecords.find(
                (a) => a.candidate_id === candidate.id
              );
              return {
                candidate,
                votesCount: analyticsRecord?.votes_count || 0,
                percentage: analyticsRecord?.percentage || 0,
                rank: 1, // Will be calculated after sorting
              };
            })
            .sort((a, b) => b.votesCount - a.votesCount)
            .map((candidate, index) => ({ ...candidate, rank: index + 1 }));

          const totalVotes = candidateAnalytics.reduce(
            (sum, c) => sum + c.votesCount,
            0
          );

          return {
            portfolio,
            totalVotes,
            candidates: candidateAnalytics,
          };
        });

      setPortfolioAnalytics(portfolioAnalyticsData);

      // Generate mock voting trends (hourly data for the last 24 hours)
      const mockVotingTrends: VotingTrend[] = [];
      const now = new Date();
      let cumulativeVotes = 0;

      for (let i = 23; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        const votes = Math.floor(Math.random() * 50) + 10; // Random votes between 10-60
        cumulativeVotes += votes;

        mockVotingTrends.push({
          date: date.toISOString(),
          votes,
          cumulative: cumulativeVotes,
        });
      }
      setVotingTrends(mockVotingTrends);

      // Generate mock turnout analytics
      const totalVotes = portfolioAnalyticsData.reduce(
        (sum, p) => sum + p.totalVotes,
        0
      );
      const totalEligibleVoters = 800; // Mock data

      const hourlyTrends = mockVotingTrends.map((trend) => ({
        hour:
          new Date(trend.date).getHours().toString().padStart(2, "0") + ":00",
        votes: trend.votes,
      }));

      setTurnoutAnalytics({
        totalEligibleVoters,
        totalVotes,
        turnoutPercentage: (totalVotes / totalEligibleVoters) * 100,
        hourlyTrends,
      });

      setLoading(false);
    };

    loadElectionAnalytics();
  }, [electionId]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "APPROVED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DRAFT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!election || !turnoutAnalytics) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Election Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested election could not be found.
          </p>
          <Link href={`/superadmin/${superadminId}/analytics`}>
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Analytics
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalVotes = portfolioAnalytics.reduce(
    (sum, p) => sum + p.totalVotes,
    0
  );
  const totalCandidates = portfolioAnalytics.reduce(
    (sum, p) => sum + p.candidates.length,
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Link href={`/superadmin/${superadminId}/analytics`}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {election.title}
              </h1>
              <Badge className={getStatusBadgeVariant(election.status)}>
                {election.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-gray-600">{election.description}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Start: {formatDate(election.start_time)}</span>
              <span>End: {formatDate(election.end_time)}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalVotes.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Turnout Rate
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {turnoutAnalytics.turnoutPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolios</p>
                <p className="text-3xl font-bold text-gray-900">
                  {portfolioAnalytics.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidates</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalCandidates}
                </p>
              </div>
              <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Voting Trends (Last 24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={votingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatTime(value)}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => formatTime(value)}
                  formatter={(value, name) => [
                    value,
                    name === "votes" ? "Votes This Hour" : "Cumulative Votes",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="votes"
                  stackId="1"
                  stroke="#D97706"
                  fill="#D97706"
                  fillOpacity={0.6}
                  name="votes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Hourly Voting Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={turnoutAnalytics.hourlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="votes" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Results */}
      <div className="space-y-6">
        {portfolioAnalytics.map((portfolio) => (
          <Card key={portfolio.portfolio.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {portfolio.portfolio.title}
                </div>
                <Badge variant="outline">
                  {portfolio.totalVotes.toLocaleString()} votes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Results Chart */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Results Distribution
                  </h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={portfolio.candidates.map((c) => ({
                          name: c.candidate.full_name,
                          value: c.votesCount,
                          percentage: c.percentage,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) =>
                          `${name}: ${(percentage as number).toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#92400E"
                        dataKey="value"
                      >
                        {portfolio.candidates.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#D97706",
                                "#F59E0B",
                                "#92400E",
                                "#B45309",
                                "#A16207",
                              ][index % 5]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value} votes`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Candidate Rankings */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Candidate Rankings
                  </h4>
                  <div className="space-y-4">
                    {portfolio.candidates.map((candidate) => (
                      <div
                        key={candidate.candidate.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{
                              backgroundColor: getCandidateColor(
                                candidate.rank - 1
                              ),
                            }}
                          >
                            {candidate.rank}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {candidate.candidate.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {candidate.percentage.toFixed(1)}% of votes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {candidate.votesCount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">votes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ElectionAnalytics;
