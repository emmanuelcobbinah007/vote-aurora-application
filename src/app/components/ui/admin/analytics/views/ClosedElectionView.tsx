import React from "react";
import {
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  Award,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../utils/analyticsUtils";

interface ClosedElectionProps {
  election: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: string;
    _count: {
      candidates: number;
      portfolios: number;
    };
  };
  analytics: {
    totalVoters: number;
    totalVotes: number;
    participationRate: number;
    portfolioStats: Array<{
      id: string;
      title: string;
      voteCount: number;
      participationRate: number;
    }>;
    results: Array<{
      portfolioId: string;
      portfolioTitle: string;
      winner: {
        id: string;
        name: string;
        voteCount: number;
        votePercentage: number;
      };
      candidates: Array<{
        id: string;
        name: string;
        voteCount: number;
        votePercentage: number;
      }>;
    }>;
    finalStats: {
      totalDuration: string;
      peakVotingHour: string;
      averageVotesPerHour: number;
    };
  };
}

const ClosedElectionView: React.FC<ClosedElectionProps> = ({
  election,
  analytics,
}) => {
  const highestTurnout = Math.max(
    ...analytics.portfolioStats.map((p) => p.participationRate)
  );
  const totalCandidates = analytics.results.reduce(
    (sum, portfolio) => sum + portfolio.candidates.length,
    0
  );

  // Compute duration from start and end dates
  const computeDuration = (start?: Date, end?: Date, fallback?: string) => {
    if (!start || !end) return fallback ?? "Unknown";
    try {
      const diff = Math.abs(end.getTime() - start.getTime());
      const minutes = Math.floor(diff / (1000 * 60));
      const days = Math.floor(minutes / (60 * 24));
      const hours = Math.floor((minutes % (60 * 24)) / 60);
      const mins = minutes % 60;
      const parts = [] as string[];
      if (days) parts.push(`${days}d`);
      if (hours) parts.push(`${hours}h`);
      if (mins || parts.length === 0) parts.push(`${mins}m`);
      return parts.join(" ");
    } catch (e) {
      return fallback ?? "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Election Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl" style={{ color: "#2ecc71" }}>
              {election.title} - Final Results
            </CardTitle>
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
              CLOSED
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{election.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                Started: {formatDate(election.startDate.toISOString())}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                Ended: {formatDate(election.endDate.toISOString())}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                {totalCandidates} Total Candidates
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" style={{ color: "#2ecc71" }} />
              <span className="text-sm text-gray-600">
                {analytics.results.length} Portfolios
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Votes Cast
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {analytics.totalVotes}
                </p>
              </div>
              <BarChart3 className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Eligible Voters
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {analytics.totalVoters}
                </p>
              </div>
              <Users className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Final Turnout
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {analytics.participationRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duration</p>
                <p className="text-2xl font-bold" style={{ color: "#2ecc71" }}>
                  {computeDuration(
                    election.startDate,
                    election.endDate,
                    analytics.finalStats.totalDuration
                  )}
                </p>
              </div>
              <Calendar className="w-8 h-8" style={{ color: "#2ecc71" }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Election Winners */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy style={{ color: "#2ecc71" }} />
            <span style={{ color: "#2ecc71" }}>Election Winners</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analytics.results.map((portfolio) => (
              <div
                key={portfolio.portfolioId}
                className="border rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    {portfolio.portfolioTitle}
                  </h4>
                  <Award className="w-5 h-5 text-yellow-500" />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">
                        🏆 {portfolio.winner.name}
                      </p>
                      <p className="text-sm text-green-700">Winner</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-900">
                        {portfolio.winner.voteCount} votes
                      </p>
                      <p className="text-sm text-green-700">
                        {portfolio.winner.votePercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    All Candidates:
                  </p>
                  {portfolio.candidates
                    .sort((a, b) => b.voteCount - a.voteCount)
                    .map((candidate, index) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-sm text-gray-600">
                          #{index + 1} {candidate.name}
                        </span>
                        <span className="text-sm font-medium">
                          {candidate.voteCount} (
                          {candidate.votePercentage.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Insights */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: "#2ecc71" }}>Election Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: "#2ecc71" }}
              >
                {analytics.finalStats.peakVotingHour}
              </div>
              <p className="text-sm text-gray-600">Peak Voting Hour</p>
            </div>
            <div className="text-center">
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: "#2ecc71" }}
              >
                {analytics.finalStats.averageVotesPerHour}
              </div>
              <p className="text-sm text-gray-600">Avg Votes/Hour</p>
            </div>
            <div className="text-center">
              <div
                className="text-2xl font-bold mb-2"
                style={{ color: "#2ecc71" }}
              >
                {highestTurnout.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Highest Portfolio Turnout</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClosedElectionView;
