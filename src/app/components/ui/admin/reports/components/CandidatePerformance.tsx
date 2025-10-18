import React, { useState } from "react";
import { Trophy, Users, Award, TrendingUp } from "lucide-react";
import type { CandidatePerformanceProps } from "../types";
import {
  getCandidateColor,
  getCandidateColorLight,
  getPerformanceColor,
  formatNumber,
  formatPercentage,
  truncateText,
} from "../utils";

const CandidatePerformance: React.FC<CandidatePerformanceProps> = ({
  candidates,
  portfolios,
  totalVotes,
  showResults,
}) => {
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(
    null
  );

  // Group candidates by portfolio and sort by votes
  const candidatesByPortfolio = portfolios.map((portfolio) => {
    const portfolioCandidates = candidates
      .filter((c) => c.portfolio_id === portfolio.id)
      .sort((a, b) => b._count.votes - a._count.votes);

    return {
      ...portfolio,
      candidates: portfolioCandidates,
      totalVotes: portfolioCandidates.reduce(
        (sum, c) => sum + c._count.votes,
        0
      ),
    };
  });

  const getPerformanceColorForCandidate = (rank: number, total: number) => {
    return getPerformanceColor(rank, total);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Candidate Performance
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {showResults
                ? "Final results by portfolio"
                : "Current standings (results hidden during live election)"}
            </p>
          </div>
          {!showResults && (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              Results Hidden
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Portfolio filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPortfolio(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedPortfolio === null
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Portfolios
            </button>
            {portfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => setSelectedPortfolio(portfolio.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedPortfolio === portfolio.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {portfolio.title}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate listings */}
        <div className="space-y-6">
          {candidatesByPortfolio
            .filter(
              (portfolio) =>
                !selectedPortfolio || portfolio.id === selectedPortfolio
            )
            .map((portfolio) => (
              <div
                key={portfolio.id}
                className="border border-gray-200 rounded-lg"
              >
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {portfolio.title}
                    </h4>
                    <div className="text-sm text-gray-600">
                      {formatNumber(portfolio.totalVotes)} total votes •{" "}
                      {portfolio.candidates.length} candidates
                    </div>
                  </div>
                  {portfolio.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {truncateText(portfolio.description, 100)}
                    </p>
                  )}
                </div>

                <div className="p-4">
                  <div className="space-y-3">
                    {portfolio.candidates.map((candidate, index) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Rank indicator */}
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{
                              backgroundColor: getCandidateColor(index),
                            }}
                          >
                            {index + 1}
                          </div>

                          {/* Candidate info */}
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {candidate.full_name}
                            </h5>
                            {candidate.manifesto && (
                              <p className="text-sm text-gray-600">
                                {truncateText(candidate.manifesto, 80)}
                              </p>
                            )}
                          </div>

                          {/* Winner badge */}
                          {showResults &&
                            index === 0 &&
                            portfolio.candidates.length > 1 && (
                              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Winner
                              </div>
                            )}
                        </div>

                        {/* Vote statistics */}
                        <div className="text-right">
                          {showResults ? (
                            <>
                              <div className="text-lg font-bold text-gray-900">
                                {formatNumber(candidate._count.votes)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatPercentage(
                                  portfolio.totalVotes > 0
                                    ? (candidate._count.votes /
                                        portfolio.totalVotes) *
                                        100
                                    : 0
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-500">
                              Results hidden
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {showResults && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">
              Performance Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {candidates.length}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  Total Candidates
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {portfolios.length}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  Winning Candidates
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(Math.round(totalVotes / portfolios.length))}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  Avg Votes/Portfolio
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(Math.round(totalVotes / candidates.length))}
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  Avg Votes/Candidate
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidatePerformance;
