"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useReportsData } from "./hooks";
import {
  ReportsHeader,
  ElectionOverview,
  VotingProgress,
  CandidatePerformance,
  VoterEngagement,
  ReportsShimmer,
} from "./components";
import { isElectionLive, shouldShowResults } from "./types";

const ReportsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const adminId = params.adminId as string;

  const { data, isLoading, error, refetch } = useReportsData(adminId);

  // Handle navigation
  const handleBackToDashboard = () => {
    router.push(`/admin/${adminId}`);
  };

  // Handle export functionality
  const handleExport = async (format: string) => {
    try {
      const response = await fetch(
        `/api/admin/${adminId}/reports/export?format=${format}`
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `election-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  // Loading state
  if (isLoading) {
    return <ReportsShimmer />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-12">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-red-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 text-red-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Reports
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {error.message || "Failed to load reports data"}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => refetch()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Try Again
                </button>
                <button
                  onClick={handleBackToDashboard}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-12">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Reports Available
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                No election has been assigned to this admin account.
              </p>
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { election, votingStats, portfolios, candidates, voterEngagement } =
    data;
  const isLive = isElectionLive(election.status);
  const showResults = shouldShowResults(election.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Election Overview */}
        <ElectionOverview election={election} votingStats={votingStats} />

        {/* Two column layout for detailed reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <VotingProgress
              votingStats={votingStats}
              portfolios={portfolios}
              isLive={isLive}
            />

            <VoterEngagement
              engagement={voterEngagement}
              totalVoters={votingStats.totalVoters}
              distinctVotersWhoVoted={votingStats.distinctVotersWhoVoted}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <CandidatePerformance
              candidates={candidates}
              portfolios={portfolios}
              totalVotes={votingStats.totalVotes}
              showResults={showResults}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
