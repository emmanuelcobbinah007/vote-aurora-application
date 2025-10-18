"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import IndividualElectionHeader from "./IndividualElectionHeader";
import IndividualElectionMetrics from "./IndividualElectionMetrics";
import IndividualCandidatePerformance from "./IndividualCandidatePerformance";
import IndividualVotingTimeline from "./IndividualVotingTimeline";
import IndividualPortfolioAnalysis from "./IndividualPortfolioAnalysis";
import { IndividualElectionAnalytics } from "./individualElectionTypes";
import { generateElectionReport } from "@/app/utils/reportGenerator";

interface IndividualElectionAnalyticsContainerProps {
  analyticsData: IndividualElectionAnalytics;
  superadminId: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const IndividualElectionAnalyticsContainer: React.FC<
  IndividualElectionAnalyticsContainerProps
> = ({ analyticsData, superadminId, onRefresh, isLoading = false }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    toast.info("Generating report... This may take a few moments.", {
      autoClose: 2000,
    });

    try {
      await generateElectionReport(analyticsData, {
        includeScreenshot: true,
        includeDetailedData: true,
        format: "pdf",
      });
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-analytics-container>
      <div className="mx-auto px-4 py-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/superadmin/${superadminId}/analytics`}
              className="flex items-center gap-2 text-gray-600 hover:text-[#cc910d] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Analytics Overview</span>
            </Link>
            <div className="h-4 border-l border-gray-300"></div>
            <h1 className="text-lg font-semibold text-gray-900">
              Individual Election Analytics
            </h1>
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 border-[#cc910d] text-[#cc910d] hover:bg-[#cc910d] hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh Data
            </Button>
          )}
        </div>

        <div className="space-y-8">
          {/* Election Header */}
          <IndividualElectionHeader
            election={analyticsData.election}
            assignedAdminsCount={analyticsData.metrics.assignedAdminsCount}
            onExportReport={handleExportReport}
            isExporting={isExporting}
          />

          {/* Key Metrics */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Key Metrics</h2>
            <IndividualElectionMetrics metrics={analyticsData.metrics} />
          </div>

          {/* Voting Timeline */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Voting Activity Timeline
            </h2>
            <IndividualVotingTimeline
              votingTimeline={analyticsData.votingTimeline}
              electionStatus={analyticsData.election.status}
            />
          </div>

          {/* Performance Analysis Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Candidate Performance */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Candidate Performance
              </h2>
              <IndividualCandidatePerformance
                candidatePerformance={analyticsData.candidatePerformance}
                totalVotes={analyticsData.metrics.totalVotes}
              />
            </div>

            {/* Portfolio Analysis */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Portfolio Analysis
              </h2>
              <IndividualPortfolioAnalysis
                portfolioDistribution={analyticsData.portfolioDistribution}
                totalVotes={analyticsData.metrics.totalVotes}
              />
            </div>
          </div>

          {/* Additional Information */}
          {analyticsData.assignedAdmins.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Election Management
              </h2>
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Assigned Administrators
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.assignedAdmins.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">
                          {assignment.admin.full_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {assignment.admin.email}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>Assigned by: {assignment.assignedBy.full_name}</p>
                          <p>
                            Date:{" "}
                            {new Date(
                              assignment.assignedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Details */}
          {analyticsData.portfolios.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Portfolio & Candidate Details
              </h2>
              <div className="bg-white rounded-lg border p-6">
                <div className="space-y-6">
                  {analyticsData.portfolios.map((portfolio) => (
                    <div
                      key={portfolio.id}
                      className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
                    >
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {portfolio.title}
                        </h3>
                        {portfolio.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {portfolio.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {portfolio.candidatesCount} candidate
                          {portfolio.candidatesCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {portfolio.candidates.map((candidate) => (
                          <div
                            key={candidate.id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                                {candidate.photo_url ? (
                                  <img
                                    src={candidate.photo_url}
                                    alt={candidate.full_name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="text-amber-700 font-semibold text-sm">
                                    {candidate.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {candidate.full_name}
                                </p>
                                {candidate.manifesto && (
                                  <p className="text-xs text-gray-500 truncate">
                                    {candidate.manifesto}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualElectionAnalyticsContainer;
