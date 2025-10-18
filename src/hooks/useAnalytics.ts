import { useQuery } from "@tanstack/react-query";
import { analyticsApi, AnalyticsData } from "@/services/analyticsApi";


export const analyticsKeys = {
  all: ["analytics"] as const,
  byElection: (electionId: string) => ["analytics", electionId] as const,
};

export const useElectionAnalytics = (electionId: string) => {
  return useQuery({
    queryKey: analyticsKeys.byElection(electionId),
    queryFn: () => analyticsApi.getAnalytics(electionId),
    staleTime: 1 * 60 * 1000, // 1 minute (analytics data changes more frequently during live elections)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
    // Refetch more frequently for live elections
    refetchInterval: (query) => {
      const isLive = query.state.data?.status === "LIVE";
      return isLive ? 30 * 1000 : false; // Refetch every 30 seconds for live elections
    },
  });
};
