import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { AuditLog } from "@/data";
import { ElectionId } from "@/services/adminApi";

// Domain types for audit logs
type ActorId = string & { readonly __brand: unique symbol };
type AuditLogLimit = number & { readonly __brand: unique symbol };

export interface AuditLogFilter {
  readonly electionId?: ElectionId;
  readonly actorId?: ActorId;
  readonly limit?: AuditLogLimit;
}

export interface AuditLogsByElectionQuery {
  readonly electionId: ElectionId;
}

export interface AuditLogsByActorQuery {
  readonly actorId: ActorId;
}

export interface RecentAuditLogsQuery {
  readonly limit: AuditLogLimit;
}

// Helper functions to create domain types
const createElectionId = (value: string): ElectionId => value as ElectionId;
export const createActorId = (value: string): ActorId => value as ActorId;
export const createAuditLogLimit = (value: number): AuditLogLimit =>
  value as AuditLogLimit;

const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  const response = await apiClient.get("/audit-logs");
  return response.data;
};

const fetchAuditLogsByElection = async (
  query: AuditLogsByElectionQuery
): Promise<AuditLog[]> => {
  const response = await apiClient.get(
    `/audit-logs?electionId=${query.electionId}`
  );
  return response.data;
};

const fetchAuditLogsByActor = async (
  query: AuditLogsByActorQuery
): Promise<AuditLog[]> => {
  const response = await apiClient.get(`/audit-logs?actorId=${query.actorId}`);
  return response.data;
};

const fetchRecentAuditLogs = async (
  query: RecentAuditLogsQuery
): Promise<AuditLog[]> => {
  const response = await apiClient.get(
    `/audit-logs/recent?limit=${query.limit}`
  );
  return response.data;
};

// Query keys for consistency
export const AUDIT_QUERY_KEYS = {
  all: ["auditLogs"] as const,
  lists: () => [...AUDIT_QUERY_KEYS.all, "list"] as const,
  list: (filters: AuditLogFilter) =>
    [...AUDIT_QUERY_KEYS.lists(), { filters }] as const,
  byElection: (electionId: ElectionId) =>
    [...AUDIT_QUERY_KEYS.lists(), { electionId }] as const,
  byActor: (actorId: ActorId) =>
    [...AUDIT_QUERY_KEYS.lists(), { actorId }] as const,
  recent: (limit: AuditLogLimit) =>
    [...AUDIT_QUERY_KEYS.lists(), { recent: limit }] as const,
};

// Custom hooks using domain types
export const useAuditLogs = () => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.lists(),
    queryFn: fetchAuditLogs,
    staleTime: 2 * 60 * 1000, // 2 minutes - audit logs need fresher data
  });
};

export const useAuditLogsByElection = (query: AuditLogsByElectionQuery) => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.byElection(query.electionId),
    queryFn: () => fetchAuditLogsByElection(query),
    staleTime: 2 * 60 * 1000,
    enabled: !!query.electionId,
  });
};

export const useAuditLogsByActor = (query: AuditLogsByActorQuery) => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.byActor(query.actorId),
    queryFn: () => fetchAuditLogsByActor(query),
    staleTime: 2 * 60 * 1000,
    enabled: !!query.actorId,
  });
};

export const useRecentAuditLogs = (query: RecentAuditLogsQuery) => {
  return useQuery({
    queryKey: AUDIT_QUERY_KEYS.recent(query.limit),
    queryFn: () => fetchRecentAuditLogs(query),
    staleTime: 1 * 60 * 1000, // 1 minute - recent logs should be very fresh
  });
};
