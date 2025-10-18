import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { electionsApi } from "@/services/electionsApi";
import { Election, ElectionWithDetails } from "@/data";

// Query keys for consistency
export const ELECTION_QUERY_KEYS = {
  all: ["elections"] as const,
  lists: () => [...ELECTION_QUERY_KEYS.all, "list"] as const,
  list: (filters: any) =>
    [...ELECTION_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ELECTION_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...ELECTION_QUERY_KEYS.details(), id] as const,
};

// Get all elections with pagination support
export const useElections = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ELECTION_QUERY_KEYS.list(params || {}),
    queryFn: () => electionsApi.getElections(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get election with details
export const useElectionWithDetails = (id: string) => {
  return useQuery({
    queryKey: ELECTION_QUERY_KEYS.detail(id),
    queryFn: () => electionsApi.getElectionWithDetails(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
};

// Create election mutation
export const useCreateElection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      election: Omit<Election, "id" | "created_at" | "updated_at">
    ) => electionsApi.createElection(election),
    onSuccess: () => {
      // Invalidate elections list to refetch
      queryClient.invalidateQueries({ queryKey: ELECTION_QUERY_KEYS.lists() });
    },
  });
};

// Update election mutation
export const useUpdateElection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Election> }) =>
      electionsApi.updateElection(id, updates),
    onSuccess: (data, variables) => {
      // Invalidate the specific election query to trigger refetch with full details
      queryClient.invalidateQueries({
        queryKey: ELECTION_QUERY_KEYS.detail(variables.id),
      });
      // Invalidate elections list
      queryClient.invalidateQueries({ queryKey: ELECTION_QUERY_KEYS.lists() });
    },
  });
};

// Delete election mutation
export const useDeleteElection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => electionsApi.deleteElection(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: ELECTION_QUERY_KEYS.detail(deletedId),
      });
      // Invalidate elections list
      queryClient.invalidateQueries({ queryKey: ELECTION_QUERY_KEYS.lists() });
    },
  });
};
