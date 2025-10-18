"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardContainer from "@/app/components/ui/superadmin/dashboard/DashboardContainer";
import DashboardShimmer from "@/app/components/ui/superadmin/dashboard/DashboardShimmer";
import { superadminApi } from "@/services/superadminApi";

const DashboardPage = () => {
  const params = useParams();
  const superadminId = params.superadminId as string;

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["dashboard", superadminId],
    queryFn: superadminApi.getDashboardData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time data
  });

  if (isLoading) {
    return <DashboardShimmer />;
  }

  if (isError || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#2ecc71] hover:bg-[#2ecc71] text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardContainer
      superadminId={superadminId}
      dashboardData={{
        ...dashboardData,
        superadminId,
      }}
    />
  );
};

export default DashboardPage;
