"use client";

import React, { useState, useEffect } from "react";
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Vote,
  Calendar,
  BarChart3,
  Activity,
  Eye,
} from "lucide-react";
import Link from "next/link";
import ElectionResults from "./ElectionResults";
import { getSession } from "next-auth/react";

interface AnalyticsContainerProps {
  userRole?: string;
  analyticsData: any; // We'll properly type this based on your API response
  isIndividualElection?: boolean; // Flag to determine if this is individual election view
}

const AnalyticsContainer: React.FC<AnalyticsContainerProps> = ({
  userRole = "superadmin",
  analyticsData,
  isIndividualElection = false,
}) => {
  const [superadminId, setSuperadminId] = useState<string>("");
  const [showAllElections, setShowAllElections] = useState<boolean>(false);
  const [showAllTableRows, setShowAllTableRows] = useState<boolean>(false);
  useEffect(() => {
    const fetchSuperadminId = async () => {
      const session = await getSession();
      // getSession returns { user, expires } on the client when a session exists
      setSuperadminId((session as any)?.user?.id ?? "");
    };
    fetchSuperadminId();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING_APPROVAL":
        return "bg-gray-100 text-gray-600 border-gray-200";
      case "DRAFT":
        return "bg-gray-100 text-gray-600 border-gray-200";
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

  if (!analyticsData) return null;

  // Adapt data structure for individual election analytics
  const adaptedData = isIndividualElection
    ? {
        // For individual election, create adapted structure
        totalElections: 1, // This specific election
        activeElections: analyticsData.status === "LIVE" ? 1 : 0,
        completedElections: analyticsData.status === "CLOSED" ? 1 : 0,
        totalVotes: analyticsData.analytics?.totalVotes || 0,
        averageTurnout: analyticsData.analytics?.participationRate || 0,
        recentElections: [
          {
            election: analyticsData.election || {
              id: "unknown",
              title: "Current Election",
              status: analyticsData.status || "CLOSED",
            },
            totalVotes: analyticsData.analytics?.totalVotes || 0,
            turnoutPercentage: analyticsData.analytics?.participationRate || 0,
            status: analyticsData.status || "CLOSED",
          },
        ],
        candidatePerformance: analyticsData.analytics?.results || [],
        portfolioDistribution: analyticsData.analytics?.portfolioStats || [],
      }
    : analyticsData; // Use original data for general analytics

  const electionStatusData = [
    {
      name: "Active",
      value: adaptedData.activeElections || 0,
      color: "#2ecc71",
    },
    {
      name: "Completed",
      value: adaptedData.completedElections || 0,
      color: "#1e8e3e",
    },
    {
      name: "Upcoming",
      value:
        (adaptedData.totalElections || 0) -
        (adaptedData.activeElections || 0) -
        (adaptedData.completedElections || 0),
      color: "#22a045",
    },
  ];

  const turnoutData =
    adaptedData.recentElections?.map((election: any) => ({
      name: election.election.title.substring(0, 20) + "...",
      turnout: Math.round(election.turnoutPercentage),
      votes: election.totalVotes,
    })) || [];

  // Limit displayed elections when not expanded
  const displayedTurnoutData = showAllElections
    ? turnoutData
    : turnoutData.slice(0, 5);

  const totalElections = turnoutData.length;
  const displayedElections = displayedTurnoutData.length;

  // Limit table rows when not expanded
  const displayedTableData = showAllTableRows
    ? analyticsData.recentElections || []
    : (analyticsData.recentElections || []).slice(0, 3);

  const totalTableRows = analyticsData.recentElections?.length || 0;
  const displayedTableRows = displayedTableData.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[#2ecc71] mt-2">
            Comprehensive insights into all elections
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-[#2ecc71] text-[#2ecc71] hover:bg-[#2ecc71]/10"
        >
          <Activity className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Elections
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {adaptedData.totalElections || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-[#2ecc71]/20 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-[#2ecc71]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Elections
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {adaptedData.activeElections || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-[#2ecc71]/20 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-[#2ecc71]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(adaptedData.totalVotes || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-[#2ecc71]/20 rounded-lg flex items-center justify-center">
                <Vote className="h-6 w-6 text-[#2ecc71]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Turnout
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {adaptedData.averageTurnout?.toFixed(1) || "0.0"}%
                </p>
              </div>
              <div className="h-12 w-12 bg-[#2ecc71]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-[#2ecc71]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Election Results Section - Only show for individual elections */}
      {isIndividualElection && analyticsData.candidatePerformance && (
        <ElectionResults
          electionData={{
            id: analyticsData.recentElections?.[0]?.election?.id || "unknown",
            title:
              analyticsData.recentElections?.[0]?.election?.title ||
              "Election Results",
            status: analyticsData.recentElections?.[0]?.status || "CLOSED",
            totalVotes: analyticsData.totalVotes,
            portfoliosCount: analyticsData.portfolioDistribution?.length || 0,
            candidatesCount: analyticsData.candidatePerformance?.length || 0,
          }}
          candidatePerformance={analyticsData.candidatePerformance}
          portfolioDistribution={analyticsData.portfolioDistribution}
        />
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Election Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Election Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={electionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#2ecc71"
                  dataKey="value"
                >
                  {electionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Voter Turnout by Election */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Voter Turnout by Election
                <span className="text-sm font-normal text-gray-500">
                  ({displayedElections} of {totalElections} elections)
                </span>
              </CardTitle>
              {totalElections > 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllElections(!showAllElections)}
                  className="flex items-center gap-2"
                >
                  {showAllElections ? (
                    <>
                      <TrendingUp className="h-4 w-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4" />
                      Show All ({totalElections})
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {displayedTurnoutData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No election data available</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={
                  showAllElections
                    ? Math.max(400, Math.min(totalElections * 50, 600))
                    : 300
                }
              >
                <BarChart data={displayedTurnoutData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: showAllElections ? 10 : 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={showAllElections ? 100 : 80}
                    interval={showAllElections ? 0 : 0}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "turnout" ? `${value}%` : value,
                      name === "turnout" ? "Turnout" : "Total Votes",
                    ]}
                  />
                  <Bar dataKey="turnout" fill="#2ecc71" name="turnout" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Elections Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Elections
              <span className="text-sm font-normal text-gray-500">
                ({displayedTableRows} of {totalTableRows} elections)
              </span>
            </CardTitle>
            {totalTableRows > 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllTableRows(!showAllTableRows)}
                className="flex items-center gap-2"
              >
                {showAllTableRows ? (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    Show All ({totalTableRows})
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Election
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Start Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    End Date
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Votes
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Turnout
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedTableData.map((electionSummary: any) => (
                  <tr
                    key={electionSummary.election.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {electionSummary.election.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {electionSummary.election.description}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={getStatusBadgeVariant(
                          electionSummary.election.status
                        )}
                      >
                        {electionSummary.election.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(electionSummary.election.start_time)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(electionSummary.election.end_time)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {electionSummary.totalVotes.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {electionSummary.turnoutPercentage.toFixed(1)}%
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#2ecc71] h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                electionSummary.turnoutPercentage,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/superadmin/${superadminId}/analytics/${electionSummary.election.id}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {displayedTableData.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 px-4 text-center text-gray-500"
                    >
                      No recent elections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsContainer;
