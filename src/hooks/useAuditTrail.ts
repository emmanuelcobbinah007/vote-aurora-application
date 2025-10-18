import { useQuery } from "@tanstack/react-query";
import { auditApi, AuditEntry } from "@/services/auditApi";

// Query keys factory
export const auditKeys = {
  all: ["audit"] as const,
  byElection: (electionId: string) => ["audit", electionId] as const,
};

// Hook to fetch audit trail for an election
export const useAuditTrail = (electionId: string) => {
  return useQuery({
    queryKey: auditKeys.byElection(electionId),
    queryFn: () => auditApi.getAuditTrail(electionId),
    staleTime: 2 * 60 * 1000, // 2 minutes (audit data changes less frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a 404 error
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
