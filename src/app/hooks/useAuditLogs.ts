import { useQuery } from "@tanstack/react-query";
import { AuditLog } from "../components/ui/superadmin/audit-logs/auditTypes";

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface AuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

// API function to fetch audit logs
const fetchAuditLogs = async (
  params: AuditLogsParams = {}
): Promise<AuditLogsResponse> => {
  const searchParams = new URLSearchParams();

  // Add parameters to URL if they exist
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `/api/superadmin/audit?${searchParams.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  return response.json();
};

// Custom hook for fetching audit logs with TanStack Query
export const useAuditLogs = (params: AuditLogsParams = {}) => {
  return useQuery({
    queryKey: ["auditLogs", params],
    queryFn: () => fetchAuditLogs(params),
    staleTime: 2 * 60 * 1000, // 2 minutes (audit logs are more time-sensitive)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
