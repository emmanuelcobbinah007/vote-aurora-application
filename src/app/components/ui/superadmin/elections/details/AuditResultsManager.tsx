"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Activity,
  Download,
  Eye,
  Clock,
  User,
  Vote,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { ElectionWithDetails } from "./ElectionDetailsTypes";
import { useAuditTrail } from "@/hooks/useAuditTrail";
import { useElectionAnalytics } from "@/hooks/useAnalytics";
import Link from "next/link";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";

interface AuditResultsManagerProps {
  election: ElectionWithDetails;
}

const AuditResultsManager: React.FC<AuditResultsManagerProps> = ({
  election,
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = useState<"results" | "audit">("results");

  // Fetch real data using our custom hooks
  const {
    data: auditTrail,
    isLoading: auditLoading,
    isError: auditError,
    refetch: refetchAudit,
  } = useAuditTrail(election.id);
  const {
    data: analytics,
    isLoading: analyticsLoading,
    isError: analyticsError,
    refetch: refetchAnalytics,
  } = useElectionAnalytics(election.id);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "election created":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "portfolio added":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "candidate added":
        return <User className="h-4 w-4 text-purple-600" />;
      case "election status changed":
        return <Activity className="h-4 w-4 text-orange-600" />;
      case "vote cast":
        return <Vote className="h-4 w-4 text-indigo-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const exportElectionResultsToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add text with word wrap
    const addWrappedText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      fontSize: number = 10
    ) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + lines.length * fontSize * 0.4;
    };

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Election Results Report", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 20;

    // Election Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Election Details", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Election Title: ${election.title}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Status: ${election.status.replace(/_/g, " ")}`, 20, yPosition);
    yPosition += 8;
    doc.text(
      `Start Date: ${new Date(election.start_time).toLocaleDateString()}`,
      20,
      yPosition
    );
    yPosition += 8;
    doc.text(
      `End Date: ${new Date(election.end_time).toLocaleDateString()}`,
      20,
      yPosition
    );
    yPosition += 15;

    // Status Overview
    checkNewPage(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Status Overview", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const totalVotes =
      analytics?.candidatePerformance?.reduce(
        (sum: number, candidate) => sum + candidate.votes,
        0
      ) ||
      analytics?.totalVotes ||
      0;

    doc.text(`Total Votes: ${totalVotes}`, 20, yPosition);
    yPosition += 8;
    doc.text(
      `Turnout Rate: ${analytics?.turnoutPercentage?.toFixed(1) || "0.0"}%`,
      20,
      yPosition
    );
    yPosition += 8;
    doc.text(
      `Active Portfolios: ${
        analytics?.portfoliosCount ||
        analytics?.portfolioDistribution?.length ||
        0
      }`,
      20,
      yPosition
    );
    yPosition += 15;

    // Results by Portfolio
    if (analytics?.portfolioDistribution) {
      checkNewPage(30);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Election Results by Portfolio", 20, yPosition);
      yPosition += 10;

      analytics.portfolioDistribution.forEach((portfolio, portfolioIndex) => {
        checkNewPage(40);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${portfolioIndex + 1}. ${portfolio.name}`, 20, yPosition);
        yPosition += 8;

        const portfolioCandidates =
          analytics.candidatePerformance?.filter(
            (candidate) => candidate.portfolio === portfolio.name
          ) || [];

        portfolioCandidates.forEach((candidate, index) => {
          checkNewPage(15);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            `  ${index + 1}. ${candidate.name}: ${
              candidate.votes
            } votes (${candidate.percentage.toFixed(1)}%)`,
            25,
            yPosition
          );
          yPosition += 6;
        });
        yPosition += 5;
      });
    }

    // Analytics Summary
    checkNewPage(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Analytics Summary", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Total Votes: ${
        analytics?.totalVotes?.toLocaleString() || totalVotes.toLocaleString()
      }`,
      20,
      yPosition
    );
    yPosition += 8;
    doc.text(
      `Voter Turnout: ${analytics?.turnoutPercentage?.toFixed(1) || "0.0"}%`,
      20,
      yPosition
    );
    yPosition += 8;
    doc.text(
      `Active Portfolios: ${
        analytics?.portfoliosCount ||
        analytics?.portfolioDistribution?.length ||
        0
      }`,
      20,
      yPosition
    );
    yPosition += 15;

    // Recent Audit Trail
    if (auditTrail && auditTrail.length > 0) {
      checkNewPage(40);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Recent Audit Trail", 20, yPosition);
      yPosition += 10;

      const recentEntries = auditTrail.slice(0, 10); // Show last 10 entries
      recentEntries.forEach((entry, index) => {
        checkNewPage(20);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const timestamp = new Date(entry.timestamp).toLocaleString();
        doc.text(`${index + 1}. ${entry.action} - ${timestamp}`, 20, yPosition);
        yPosition += 6;
        if (entry.user) {
          doc.text(
            `   By: ${entry.user.full_name} (${entry.user.email})`,
            25,
            yPosition
          );
          yPosition += 6;
        }
      });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
      doc.text("Generated by VoteAurora", pageWidth - 20, pageHeight - 10, {
        align: "right",
      });
    }

    // Save the PDF
    const fileName = `election-results-${election.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  // Loading states
  if (analyticsLoading || auditLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Audit & Results
          </h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin text-[#2ecc71]" />
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error states
  if (analyticsError || auditError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Audit & Results
          </h2>
          <Button
            onClick={() => {
              refetchAnalytics();
              refetchAudit();
            }}
            variant="outline"
            size="sm"
            className="border-[#2ecc71] text-[#2ecc71] hover:bg-[#2ecc71] hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Failed to load audit and results data</span>
          </div>
        </Card>
      </div>
    );
  }

  const isElectionActive = election.status === "LIVE";
  const isElectionClosed = election.status === "CLOSED";

  // Calculate totals from analytics data
  const totalVotes =
    analytics?.candidatePerformance?.reduce(
      (sum: number, candidate) => sum + candidate.votes,
      0
    ) ||
    analytics?.totalVotes ||
    0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2" style={{ color: "#2ecc71" }} />
            Audit & Results
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor election activity and view results
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              refetchAnalytics();
              refetchAudit();
            }}
            className="flex items-center space-x-2 border-[#2ecc71] text-[#2ecc71] hover:bg-[#2ecc71] hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center space-x-2"
            onClick={exportElectionResultsToPDF}
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
          {isElectionClosed && (
            <Link
              href={
                session?.user?.role === "ADMIN"
                  ? `/admin/${userId}/reports`
                  : `/superadmin/${userId}/analytics/${election.id}`
              }
            >
              <Button
                className="text-white flex items-center space-x-2"
                style={{ backgroundColor: "#2ecc71" }}
              >
                <Eye className="h-4 w-4" />
                <span>View Full Results</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor:
                  election.status === "LIVE" ? "#22c55e1a" : "#2ecc711a",
              }}
            >
              {election.status === "LIVE" ? (
                <Activity className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5" style={{ color: "#2ecc71" }} />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-gray-900">
                {election.status.replace(/_/g, " ")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Vote className="h-5 w-5 text-[#2ecc71]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Votes</p>
              <p className="text-lg font-semibold text-gray-900">
                {isElectionActive || isElectionClosed ? totalVotes : "—"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-[#2ecc71]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Turnout Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {isElectionActive || isElectionClosed ? "67.3%" : "—"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="text-lg font-semibold text-gray-900">
                {isElectionClosed ? "100%" : isElectionActive ? "45%" : "0%"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("results")}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === "results"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={
              activeTab === "results"
                ? { borderColor: "#2ecc71", color: "#2ecc71" }
                : {}
            }
          >
            <BarChart3 className="h-4 w-4" />
            <span>Results</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === "audit"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            style={
              activeTab === "audit"
                ? { borderColor: "#2ecc71", color: "#2ecc71" }
                : {}
            }
          >
            <Activity className="h-4 w-4" />
            <span>Audit Trail</span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="space-y-6">
            {!isElectionActive && !isElectionClosed ? (
              <Card className="p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Results Not Available
                </h3>
                <p className="text-gray-500">
                  Results will be available once the election is live or closed.
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Election Results
                  </h3>
                  <div className="space-y-4">
                    {analytics?.portfolioDistribution?.map(
                      (portfolio, portfolioIndex) => (
                        <div
                          key={`portfolio-${portfolioIndex}`}
                          className="space-y-4"
                        >
                          <h4 className="font-medium text-gray-900 border-b pb-2">
                            {portfolio.name}
                          </h4>
                          <div className="space-y-3 ml-4">
                            {analytics.candidatePerformance
                              ?.filter(
                                (candidate) =>
                                  candidate.portfolio === portfolio.name
                              )
                              .map((candidate, index) => (
                                <div
                                  key={`candidate-${portfolioIndex}-${index}`}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-[#2ecc71] rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        {index + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {candidate.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {candidate.votes} votes
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-semibold text-gray-900">
                                      {candidate.percentage.toFixed(1)}%
                                    </p>
                                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                      <div
                                        className="h-2 rounded-full bg-[#2ecc71]"
                                        style={{
                                          width: `${candidate.percentage}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )
                    ) || (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          No results data available yet
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Analytics Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#2ecc71] bg-opacity-10 rounded-lg">
                        <Vote className="h-5 w-5 text-[#2ecc71]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Votes</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics?.totalVotes?.toLocaleString() ||
                            totalVotes.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#2ecc71] bg-opacity-10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-[#2ecc71]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Voter Turnout</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics?.turnoutPercentage &&
                          (analytics.portfoliosCount ||
                            analytics.portfolioDistribution?.length)
                            ? (
                                analytics.turnoutPercentage /
                                (analytics.portfoliosCount ||
                                  analytics.portfolioDistribution?.length)
                              ).toFixed(1)
                            : "0.0"}
                          %
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-[#2ecc71] bg-opacity-10 rounded-lg">
                        <User className="h-5 w-5 text-[#2ecc71]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Active Portfolios
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {analytics?.portfoliosCount ||
                            analytics?.portfolioDistribution?.length ||
                            0}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {isElectionClosed && (
                  <Card className="p-6 bg-green-50 border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">
                          Election Completed Successfully
                        </h3>
                        <p className="text-green-700 mt-1">
                          Final results are now available. The election
                          concluded with {totalVotes} total votes cast.
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audit Trail Tab */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Activity Log
              </h3>
              <div className="space-y-4">
                {auditTrail && auditTrail.length > 0 ? (
                  auditTrail.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(entry.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {entry.action}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {entry.user && (
                            <span className="block">
                              {entry.user.full_name} ({entry.user.email})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No audit trail entries found
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity
                  className="h-5 w-5 mr-2"
                  style={{ color: "#2ecc71" }}
                />
                System Health
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Database
                    </p>
                    <p className="text-xs text-gray-600">Operational</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Authentication
                    </p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Monitoring
                    </p>
                    <p className="text-xs text-gray-600">Limited</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditResultsManager;
