"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import IndividualElectionAnalyticsContainer from "@/app/components/ui/superadmin/analytics/individual/IndividualElectionAnalyticsContainer";
import { superadminApi } from "@/services/superadminApi";
import {
  AnalyticsHeader,
  AnalyticsShimmer,
  ErrorStates,
} from "@/app/components/ui/admin/analytics/components";
import {
  DraftElectionView,
  LiveElectionView,
  ClosedElectionView,
} from "@/app/components/ui/admin/analytics/views";
import {
  isLiveAnalytics,
  isClosedAnalytics,
} from "@/app/components/ui/admin/analytics/types";
import { useAnalyticsData } from "@/app/components/ui/admin/analytics/hooks/useAnalyticsData";

interface ElectionAnalyticsPageProps {
  params: Promise<{
    superadminId: string;
    electionId: string;
  }>;
}

const ElectionAnalyticsPage = () => {
  const params = useParams();
  const router = useRouter();
  const superadminId = params.superadminId as string;
  const electionId = params.electionId as string;

  const { data, isLoading, error, refetch } = useAnalyticsData(
    superadminId,
    electionId
  );

  const handleBackToDashboard = () => {
    router.push(`/superadmin/${superadminId}/dashboard`);
  };

  const handleConfigureElection = () => {
    router.push(`/superadmin/${superadminId}/elections`);
  };

  // const {
  //   data: analyticsData,
  //   isLoading,
  //   isError,
  //   refetch,
  //   error,
  // } = useQuery({
  //   queryKey: ["individual-election-analytics", electionId],
  //   queryFn: () => superadminApi.getIndividualElectionAnalytics(electionId),
  //   staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  //   refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  //   retry: (failureCount, error: any) => {
  //     // Don't retry if it's a 404 (election not found)
  //     if (error?.response?.status === 404) return false;
  //     return failureCount < 3;
  //   },
  // });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnalyticsShimmer />
      </div>
    );
  }

  if (error || !data) {
    const errorMessage =
      (error as any)?.response?.status === 404
        ? "Election not found or you don't have permission to view its analytics."
        : "There was an error loading the analytics data for this election. Please try again.";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Analytics
          </h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <button
              onClick={() => refetch()}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
            <a
              href={`/superadmin/${superadminId}/analytics`}
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
            >
              Back to Analytics Overview
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { election, analytics } = data;

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">
            No election data
          </h2>
          <p className="text-gray-600 mt-2">
            The requested election data could not be found.
          </p>
          <div className="mt-4">
            <a
              href={`/superadmin/${superadminId}/analytics`}
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
            >
              Back to Analytics Overview
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate view based on election status
  const renderAnalyticsView = () => {
    switch (election.status) {
      case "DRAFT":
      case "PENDING_APPROVAL":
      case "APPROVED":
        return (
          <DraftElectionView
            election={election}
            onConfigureElection={handleConfigureElection}
          />
        );

      case "LIVE":
        if (isLiveAnalytics(analytics)) {
          return <LiveElectionView election={election} analytics={analytics} />;
        }
        return <ErrorStates type="no-data" onBack={handleBackToDashboard} />;

      case "CLOSED":
      case "ARCHIVED":
        if (isClosedAnalytics(analytics)) {
          return (
            <ClosedElectionView election={election} analytics={analytics} />
          );
        }
        return <ErrorStates type="no-data" onBack={handleBackToDashboard} />;

      default:
        return <ErrorStates type="no-data" onBack={handleBackToDashboard} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderAnalyticsView()}
      </main>
    </div>
  );
};

export default ElectionAnalyticsPage;
