"use client";

import React from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import AnalyticsContainer from "@/app/components/ui/superadmin/analytics/AnalyticsContainer";
import AnalyticsShimmer from "@/app/components/ui/superadmin/analytics/AnalyticsShimmer";

// Fetch analytics data for all elections using axios
const fetchAnalyticsData = async () => {
  try {
    const response = await axios.get("/api/superadmin/analytics", {
      timeout: 30_000, // Increased timeout to 30 seconds
    });

    // axios returns the parsed body on response.data
    return response.data;
  } catch (err) {
    // Let react-query handle the error state (and show retry UI). Log for debugging.
    console.error("Failed to load analytics", err);
    // Re-throw so useQuery sets `error` and `isError`
    throw err;
  }
};

const SuperadminAnalyticsPage: React.FC = () => {
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["superadmin-analytics"],
    queryFn: fetchAnalyticsData,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4"> </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load Analytics
            </h2>
            <p className="text-gray-600 mb-4">
              There was an error loading the analytics data. Please try again.
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
    <div className="min-h-screen bg-gray-50">
      <AnalyticsContainer analyticsData={analyticsData} />
    </div>
  );
};

export default SuperadminAnalyticsPage;
