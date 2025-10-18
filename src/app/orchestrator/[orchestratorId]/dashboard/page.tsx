"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import {
  StatsGrid,
  ActivityFeed,
  QuickActions,
  DashboardSkeleton,
  fetchDashboardStats,
  fetchRecentActivity,
} from "@/app/components/ui/orchestrator/dashboard";

const OrchestratorDashboard = () => {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [orchestratorId, setOrchestratorId] = useState<string>("");

  // Ensure we only run client-side code after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set orchestratorId once we have session data
  useEffect(() => {
    if (isClient && session?.user?.id) {
      setOrchestratorId(session.user.id);
    }
  }, [isClient, session]);

  // Query hooks
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["dashboardStats", orchestratorId],
    queryFn: () => fetchDashboardStats(orchestratorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    enabled: isClient && !!orchestratorId,
  });

  const {
    data: activities,
    isLoading: activitiesLoading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: ["recentActivity", orchestratorId],
    queryFn: () => fetchRecentActivity(orchestratorId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
    enabled: isClient && !!orchestratorId,
  });

  // Show loading state during hydration or when session is loading
  if (!isClient || status === "loading" || !orchestratorId || statsLoading) {
    return <DashboardSkeleton />;
  }

  if (statsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Error loading dashboard data.</span>
          </div>
        </div>
        <button
          onClick={() => refetchStats()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-gray-50 min-h-screen">
      {/* Stats Grid */}
      <StatsGrid stats={stats!} orchestratorId={orchestratorId} />

      {/* Activity Feed */}
      <ActivityFeed
        activities={activities}
        loading={activitiesLoading}
        error={activitiesError}
        orchestratorId={orchestratorId}
        onRetry={refetchActivities}
      />

      {/* Quick Actions */}
      <QuickActions orchestratorId={orchestratorId} />
    </div>
  );
};

export default OrchestratorDashboard;
