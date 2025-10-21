import { useQuery } from "@tanstack/react-query";
import type { AnalyticsResponse, UseAnalyticsDataReturn } from "../types";

// Fetch analytics data for the admin's assigned election
const fetchAnalyticsData = async (
  adminId: string,
  electionId?: string
): Promise<AnalyticsResponse> => {
  const url = electionId
    ? `/api/superadmin/${adminId}/analytics/${electionId}`
    : `/api/admin/${adminId}/analytics`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.status}`);
  }

  const data = await response.json();

  // The API returns { success: true, data: { election, analytics } }
  // Unwrap that wrapper so callers receive { election, analytics } directly.
  const payload = data && data.success && data.data ? data.data : data;

  // Convert date strings to Date objects on the unwrapped payload
  if (payload?.election) {
    if (payload.election.startDate) {
      payload.election.startDate = new Date(payload.election.startDate);
    }
    if (payload.election.endDate) {
      payload.election.endDate = new Date(payload.election.endDate);
    }
  }

  return payload;
};

export const useAnalyticsData = (
  adminId: string,
  electionId?: string
): UseAnalyticsDataReturn => {
  const query = useQuery({
    queryKey: electionId
      ? ["admin-analytics", adminId, electionId]
      : ["admin-analytics", adminId],
    queryFn: () => fetchAnalyticsData(adminId, electionId),
    staleTime: 2 * 60 * 1000, // 2 minutes for live election updates
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
    retryDelay: 1000,
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
