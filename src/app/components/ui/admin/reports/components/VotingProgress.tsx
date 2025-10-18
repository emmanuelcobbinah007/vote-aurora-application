import React from "react";
import { TrendingUp, Users, Vote, Clock } from "lucide-react";
import type { VotingProgressProps } from "../types";
import { formatNumber, formatPercentage } from "../utils";

const VotingProgress: React.FC<VotingProgressProps> = ({
  votingStats,
  portfolios,
  isLive,
}) => {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return "#2ecc71"; // High progress - green
    if (percentage >= 50) return "#27ae60"; // Medium-high progress - green-600
    if (percentage >= 25) return "#52c41a"; // Medium progress - green-500
    return "#73d13d"; // Low progress - green-400
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Voting Progress
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Real-time participation by portfolio
            </p>
          </div>
          {isLive && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Overall progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Turnout
            </span>
            <span className="text-sm font-bold text-gray-900">
              {formatNumber(
                votingStats.distinctVotersWhoVoted || votingStats.totalVotes
              )}{" "}
              / {formatNumber(votingStats.totalVoters)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(votingStats.turnoutPercentage, 100)}%`,
                backgroundColor: getProgressColor(
                  votingStats.turnoutPercentage
                ),
              }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-green-600">
              {formatPercentage(votingStats.turnoutPercentage)}
            </span>
            <span className="text-sm text-gray-600">
              {formatNumber(
                votingStats.totalVoters -
                  (votingStats.distinctVotersWhoVoted || votingStats.totalVotes)
              )}{" "}
              remaining
            </span>
          </div>
        </div>

        {/* Portfolio breakdown */}
        <div>
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            Portfolio Participation
          </h4>
          <div className="space-y-4">
            {votingStats.portfolioParticipation.map((portfolio, index) => (
              <div
                key={portfolio.portfolioId}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">
                      {portfolio.portfolioTitle}
                    </h5>
                    {portfolio.leading_candidate && !isLive && (
                      <p className="text-sm text-gray-600">
                        Leading: {portfolio.leading_candidate.name} (
                        {formatNumber(portfolio.leading_candidate.votes)} votes)
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatNumber(portfolio.votes)}
                    </div>
                    <div className="text-sm text-gray-600">votes</div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(portfolio.percentage, 100)}%`,
                      backgroundColor: getProgressColor(portfolio.percentage),
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-green-600">
                    {formatPercentage(portfolio.percentage)}
                  </span>
                  <span className="text-xs text-gray-500">of total votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(votingStats.votingRate)}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Votes/Hour
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Vote className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {portfolios.length}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Active Portfolios
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {portfolios.reduce((sum, p) => sum + p._count.candidates, 0)}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Total Candidates
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(
                  (votingStats.portfolioParticipation.filter((p) => p.votes > 0)
                    .length /
                    votingStats.portfolioParticipation.length) *
                    100
                )}
              </div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">
                Portfolios Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingProgress;
