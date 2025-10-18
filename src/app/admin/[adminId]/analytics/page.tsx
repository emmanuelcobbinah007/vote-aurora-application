"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAnalyticsData } from "@/app/components/ui/admin/analytics/hooks/useAnalyticsData";
import {
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

const AdminAnalyticsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const adminId = params.adminId as string;

  const { data, isLoading, error, refetch } = useAnalyticsData(adminId);

  const handleBackToDashboard = () => {
    router.push(`/admin/${adminId}`);
  };

  const handleConfigureElection = () => {
    router.push(`/admin/${adminId}/elections`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AnalyticsShimmer />
      </div>
    );
  }

  // Error states
  if (!data) {
    return <ErrorStates type="no-election" onBack={handleBackToDashboard} />;
  }

  if (error) {
    return (
      <ErrorStates
        type="analytics-error"
        onBack={handleBackToDashboard}
        onRetry={() => refetch()}
      />
    );
  }

  if (!data.analytics) {
    return <ErrorStates type="no-data" onBack={handleBackToDashboard} />;
  }

  const { election, analytics } = data;

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

export default AdminAnalyticsPage;
