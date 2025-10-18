import { useQuery } from "@tanstack/react-query";
import type { UseReportsDataReturn, ReportsData } from "../types";

// Fetch comprehensive reports data for the admin's assigned election
const fetchReportsData = async (adminId: string): Promise<ReportsData> => {
  const response = await fetch(`/api/admin/${adminId}/reports`);

  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.status}`);
  }

  const data = await response.json();

  // Convert date strings to Date objects
  if (data.election) {
    data.election.start_time = new Date(data.election.start_time);
    data.election.end_time = new Date(data.election.end_time);
    data.election.created_at = new Date(data.election.created_at);
  }

  if (data.auditLogs) {
    data.auditLogs = data.auditLogs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  }

  if (data.ballotIntegrity?.lastAuditTime) {
    data.ballotIntegrity.lastAuditTime = new Date(
      data.ballotIntegrity.lastAuditTime
    );
  }

  if (data.ballotIntegrity?.suspiciousActivity) {
    data.ballotIntegrity.suspiciousActivity =
      data.ballotIntegrity.suspiciousActivity.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp),
      }));
  }

  return data;
};

export const useReportsData = (adminId: string): UseReportsDataReturn => {
  const query = useQuery({
    queryKey: ["admin-reports", adminId],
    queryFn: () => fetchReportsData(adminId),
    staleTime: 30 * 1000, // 30 seconds for live election updates
    gcTime: 2 * 60 * 1000, // 2 minutes garbage collection
    retry: 2,
    retryDelay: 1000,
    refetchInterval: (query) => {
      // Auto-refresh every 30 seconds if election is live
      if (query.state.data?.election?.status === "LIVE") {
        return 30 * 1000;
      }
      return false;
    },
  });

  return {
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
  };
};
