"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import AnalyticsContainer from "@/app/components/ui/superadmin/analytics/AnalyticsContainer";
import AnalyticsShimmer from "@/app/components/ui/superadmin/analytics/AnalyticsShimmer";
import { superadminApi } from "@/services/superadminApi";

interface ElectionAnalyticsPageProps {
  params: {
    superadminId: string;
    electionId: string;
  };
}

// Mock fetch function for analytics data (for demo/testing)
async function fetchElectionAnalyticsData(electionId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    election: {
      id: electionId,
      title: "Student Union Executive Elections 2024",
      status: "LIVE",
      start_time: "2024-03-15T09:00:00Z",
      end_time: "2024-03-17T17:00:00Z",
      created_at: "2024-02-15T10:00:00Z",
    },
    candidates: [
      {
        name: "John Doe",
        portfolio: "President",
        votes: 512,
        percentage: 27.6,
        demographics: {
          year1: 98,
          year2: 95,
          year3: 92,
          year4: 93,
        },
      },
      {
        name: "Alice Johnson",
        portfolio: "Treasurer",
        votes: 337,
        percentage: 18.2,
        demographics: {
          year1: 89,
          year2: 84,
          year3: 82,
          year4: 82,
        },
      },
    ],
    recentElections: [
      {
        election: {
          id: electionId,
          title: "Student Union Executive Elections 2024",
          status: "LIVE",
          start_time: "2024-03-15T09:00:00Z",
          end_time: "2024-03-17T17:00:00Z",
          created_at: "2024-02-15T10:00:00Z",
        },
        totalVotes: 1847,
        totalVoters: 2500,
        turnoutPercentage: 73.9,
        portfoliosCount: 4,
        candidatesCount: 6,
        status: "LIVE",
      },
    ],
    totalElections: 1, // Just this election
    activeElections: 1,
    completedElections: 0,
    draftElections: 0,
    averageTurnout: 73.9,
  };
}

const ElectionAnalyticsPage: React.FC<ElectionAnalyticsPageProps> = ({
  params,
}) => {
  const { electionId } = params;

  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["election-analytics", electionId],
    queryFn: () => fetchElectionAnalyticsData(electionId),
    staleTime: 1000 * 60 * 2, // 2 minutes (more frequent for live elections)
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnalyticsShimmer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4"> </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load Election Analytics
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error loading the analytics data for this election.
              Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-gray-600">
            Detailed analytics for:{" "}
            <span className="font-semibold text-amber-600">
              {analyticsData?.election?.title}
            </span>
          </p>
        </div>
        <AnalyticsContainer
          analyticsData={analyticsData}
          isIndividualElection={true}
          superadminId={params.superadminId}
        />
      </div>
    </div>
  );
};

export default ElectionAnalyticsPage;
