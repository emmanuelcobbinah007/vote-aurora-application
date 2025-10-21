import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { candidateApi } from "@/services/candidateApi";
import {
  Candidate,
  CandidateFormData,
  Portfolio,
} from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";

// Query Keys
export const candidateKeys = {
  all: ["candidates"] as const,
  byElection: (electionId: string) =>
    ["candidates", "election", electionId] as const,
  byPortfolio: (electionId: string, portfolioId: string) =>
    ["candidates", "election", electionId, "portfolio", portfolioId] as const,
  detail: (electionId: string, candidateId: string) =>
    ["candidates", "election", electionId, candidateId] as const,
};

// Get candidates for an election
export const useCandidates = (electionId: string) => {
  return useQuery({
    queryKey: candidateKeys.byElection(electionId),
    queryFn: () => candidateApi.getCandidates(electionId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry if it's a 404 (election not found)
      if ((error as any)?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
};

// Create candidate mutation
export const useCreateCandidate = (electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      portfolioId,
      candidateData,
    }: {
      portfolioId: string;
      candidateData: CandidateFormData;
    }) => candidateApi.createCandidate(electionId, portfolioId, candidateData),

    onMutate: async ({ portfolioId, candidateData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: candidateKeys.byElection(electionId),
      });

      // Snapshot the previous value
      const previousCandidates = queryClient.getQueryData<Candidate[]>(
        candidateKeys.byElection(electionId)
      );

      // Optimistically update to the new value
      const optimisticCandidate: Candidate = {
        id: `temp-${Date.now()}`,
        election_id: electionId,
        portfolio_id: portfolioId,
        full_name: candidateData.full_name,
        photo_url: candidateData.photo_url,
        manifesto: candidateData.manifesto,
        created_at: new Date().toISOString(),
        _count: { votes: 0 },
      };

      queryClient.setQueryData<Candidate[]>(
        candidateKeys.byElection(electionId),
        (old) => (old ? [...old, optimisticCandidate] : [optimisticCandidate])
      );

      // Update portfolio count optimistically
      queryClient.setQueryData(
        ["portfolios", "election", electionId],
        (old: any) =>
          old?.map((portfolio: any) =>
            portfolio.id === portfolioId
              ? {
                  ...portfolio,
                  _count: {
                    candidates: (portfolio._count?.candidates || 0) + 1,
                  },
                }
              : portfolio
          )
      );

      // Return a context object with the snapshotted value
      return { previousCandidates, optimisticCandidate };
    },

    onError: (err: Error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCandidates) {
        queryClient.setQueryData(
          candidateKeys.byElection(electionId),
          context.previousCandidates
        );
      }
      // Rollback portfolio count
      queryClient.setQueryData(
        ["portfolios", "election", electionId],
        (old: Portfolio[] | undefined) =>
          old?.map((portfolio: Portfolio) =>
            portfolio.id === variables.portfolioId
              ? {
                  ...portfolio,
                  _count: {
                    candidates: Math.max(
                      (portfolio._count?.candidates || 1) - 1,
                      0
                    ),
                  },
                }
              : portfolio
          )
      );
      toast.error(err.message || "Failed to create candidate");
    },

    onSuccess: (data, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData<Candidate[]>(
        candidateKeys.byElection(electionId),
        (old) => {
          if (!old) return [data];
          return old.map((candidate) =>
            candidate.id === context?.optimisticCandidate.id ? data : candidate
          );
        }
      );
      toast.success("Candidate added successfully!");
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: candidateKeys.byElection(electionId),
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", "election", electionId],
      });
    },
  });
};

// Update candidate mutation
export const useUpdateCandidate = (electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      candidateId,
      candidateData,
    }: {
      candidateId: string;
      candidateData: CandidateFormData;
    }) => candidateApi.updateCandidate(electionId, candidateId, candidateData),

    onMutate: async ({ candidateId, candidateData }) => {
      await queryClient.cancelQueries({
        queryKey: candidateKeys.byElection(electionId),
      });

      const previousCandidates = queryClient.getQueryData<Candidate[]>(
        candidateKeys.byElection(electionId)
      );

      // Optimistically update
      queryClient.setQueryData<Candidate[]>(
        candidateKeys.byElection(electionId),
        (old) =>
          old?.map((candidate) =>
            candidate.id === candidateId
              ? {
                  ...candidate,
                  full_name: candidateData.full_name,
                  photo_url: candidateData.photo_url,
                  manifesto: candidateData.manifesto,
                }
              : candidate
          ) || []
      );

      return { previousCandidates };
    },

    onError: (err: Error, variables, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueryData(
          candidateKeys.byElection(electionId),
          context.previousCandidates
        );
      }
      toast.error(err.message || "Failed to update candidate");
    },

    onSuccess: (data) => {
      // Update with real data
      queryClient.setQueryData<Candidate[]>(
        candidateKeys.byElection(electionId),
        (old) =>
          old?.map((candidate) =>
            candidate.id === data.id ? data : candidate
          ) || []
      );
      toast.success("Candidate updated successfully!");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: candidateKeys.byElection(electionId),
      });
    },
  });
};

// Delete candidate mutation
export const useDeleteCandidate = (electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateId: string) =>
      candidateApi.deleteCandidate(electionId, candidateId),

    onMutate: async (candidateId) => {
      await queryClient.cancelQueries({
        queryKey: candidateKeys.byElection(electionId),
      });

      const previousCandidates = queryClient.getQueryData<Candidate[]>(
        candidateKeys.byElection(electionId)
      );

      // Find the candidate to get portfolio ID
      const candidateToDelete = previousCandidates?.find(
        (c) => c.id === candidateId
      );

      // Optimistically remove the candidate
      queryClient.setQueryData<Candidate[]>(
        candidateKeys.byElection(electionId),
        (old) => old?.filter((candidate) => candidate.id !== candidateId) || []
      );

      // Update portfolio count optimistically
      if (candidateToDelete) {
        queryClient.setQueryData(
          ["portfolios", "election", electionId],
          (old: any) =>
            old?.map((portfolio: any) =>
              portfolio.id === candidateToDelete.portfolio_id
                ? {
                    ...portfolio,
                    _count: {
                      candidates: Math.max(
                        (portfolio._count?.candidates || 1) - 1,
                        0
                      ),
                    },
                  }
                : portfolio
            )
        );
      }

      return { previousCandidates, candidateToDelete };
    },

    onError: (err: Error, candidateId, context) => {
      if (context?.previousCandidates) {
        queryClient.setQueryData(
          candidateKeys.byElection(electionId),
          context.previousCandidates
        );
      }
      // Rollback portfolio count
      if (context?.candidateToDelete) {
        queryClient.setQueryData(
          ["portfolios", "election", electionId],
          (old: Portfolio[] | undefined) =>
            old?.map((portfolio: Portfolio) =>
              portfolio.id === context.candidateToDelete?.portfolio_id
                ? {
                    ...portfolio,
                    _count: {
                      candidates: (portfolio._count?.candidates || 0) + 1,
                    },
                  }
                : portfolio
            )
        );
      }
      toast.error(err.message || "Failed to delete candidate");
    },

    onSuccess: () => {
      toast.success("Candidate deleted successfully!");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: candidateKeys.byElection(electionId),
      });
      queryClient.invalidateQueries({
        queryKey: ["portfolios", "election", electionId],
      });
    },
  });
};
