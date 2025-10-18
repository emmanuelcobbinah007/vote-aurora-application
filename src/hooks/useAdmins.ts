import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/apiClient";
import { ElectionAdmin, AdminStats } from "@/data";

export interface AdminId {
  readonly value: string;
}

export interface ElectionId {
  readonly value: string;
}

export interface AdminRole {
  readonly value: ElectionAdmin["role"];
}

export interface AdminFilter {
  readonly role?: AdminRole;
  readonly electionId?: ElectionId;
  readonly status?: "ACTIVE" | "INACTIVE";
}

export interface AdminQuery {
  readonly adminId: AdminId;
}

export interface AdminStatsQuery extends AdminQuery {}

export interface AdminsByRoleQuery {
  readonly role: AdminRole;
}

export interface AdminsByElectionQuery {
  readonly electionId: ElectionId;
}


// Helper functions to create domain types
export const createAdminId = (value: string): AdminId => ({ value });
export const createElectionId = (value: string): ElectionId => ({ value });
export const createAdminRole = (value: ElectionAdmin["role"]): AdminRole => ({ value });

// API functions using real endpoints
const fetchAdmins = async (): Promise<ElectionAdmin[]> => {
  const response = await apiClient.get('/admins');
  return response.data;
};

const fetchAdminById = async (query: AdminQuery): Promise<ElectionAdmin | null> => {
  const response = await apiClient.get(`/admins/${query.adminId.value}`);
  return response.data;
};

const fetchAdminWithStats = async (
  query: AdminStatsQuery
): Promise<(ElectionAdmin & { stats: AdminStats }) | null> => {
  const response = await apiClient.get(`/admins/${query.adminId.value}/stats`);
  return response.data;
};

const fetchAdminsByRole = async (
  query: AdminsByRoleQuery
): Promise<ElectionAdmin[]> => {
  const response = await apiClient.get(`/admins?role=${query.role.value}`);
  return response.data;
};

const fetchActiveAdmins = async (): Promise<ElectionAdmin[]> => {
  const response = await apiClient.get('/admins?status=ACTIVE');
  return response.data;
};

const fetchAdminsByElection = async (
  query: AdminsByElectionQuery
): Promise<ElectionAdmin[]> => {
  const response = await apiClient.get(`/elections/${query.electionId.value}/admins`);
  return response.data;
};

// Query keys for consistency
export const ADMIN_QUERY_KEYS = {
  all: ["admins"] as const,
  lists: () => [...ADMIN_QUERY_KEYS.all, "list"] as const,
  list: (filters: AdminFilter) =>
    [...ADMIN_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ADMIN_QUERY_KEYS.all, "detail"] as const,
  detail: (adminId: AdminId) => [...ADMIN_QUERY_KEYS.details(), adminId.value] as const,
  stats: (adminId: AdminId) => [...ADMIN_QUERY_KEYS.detail(adminId), "stats"] as const,
  byRole: (role: AdminRole) => [...ADMIN_QUERY_KEYS.lists(), { role: role.value }] as const,
  byElection: (electionId: ElectionId) =>
    [...ADMIN_QUERY_KEYS.lists(), { electionId: electionId.value }] as const,
};

// Custom hooks following orchestrator pattern
export const useAdmins = () => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.lists(),
    queryFn: fetchAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAdmin = (query: AdminQuery) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.detail(query.adminId),
    queryFn: () => fetchAdminById(query),
    staleTime: 5 * 60 * 1000,
    enabled: !!query.adminId.value,
  });
};

export const useAdminWithStats = (query: AdminStatsQuery) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.stats(query.adminId),
    queryFn: () => fetchAdminWithStats(query),
    staleTime: 5 * 60 * 1000,
    enabled: !!query.adminId.value,
  });
};

export const useAdminsByRole = (query: AdminsByRoleQuery) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.byRole(query.role),
    queryFn: () => fetchAdminsByRole(query),
    staleTime: 5 * 60 * 1000,
    enabled: !!query.role.value,
  });
};

export const useActiveAdmins = () => {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEYS.lists(), { status: "ACTIVE" }],
    queryFn: fetchActiveAdmins,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminsByElection = (query: AdminsByElectionQuery) => {
  return useQuery({
    queryKey: ADMIN_QUERY_KEYS.byElection(query.electionId),
    queryFn: () => fetchAdminsByElection(query),
    staleTime: 5 * 60 * 1000,
    enabled: !!query.electionId.value,
  });
};
