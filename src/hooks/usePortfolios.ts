import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { portfolioApi } from "@/services/portfolioApi";
import {
  Portfolio,
  PortfolioFormData,
} from "@/app/components/ui/superadmin/elections/details/ElectionDetailsTypes";

// Query Keys
export const portfolioKeys = {
  all: ["portfolios"] as const,
  byElection: (electionId: string) =>
    ["portfolios", "election", electionId] as const,
  detail: (electionId: string, portfolioId: string) =>
    ["portfolios", "election", electionId, portfolioId] as const,
};

// Get portfolios for an election
export const usePortfolios = (electionId: string) => {
  return useQuery({
    queryKey: portfolioKeys.byElection(electionId),
    queryFn: () => portfolioApi.getPortfolios(electionId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if it's a 404 (election not found)
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
};

// Create portfolio mutation
export const useCreatePortfolio = (electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioData: PortfolioFormData) =>
      portfolioApi.createPortfolio(electionId, portfolioData),

    onMutate: async (newPortfolio) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: portfolioKeys.byElection(electionId),
      });

      // Snapshot the previous value
      const previousPortfolios = queryClient.getQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId)
      );

      // Optimistically update to the new value
      const optimisticPortfolio: Portfolio = {
        id: `temp-${Date.now()}`,
        election_id: electionId,
        title: newPortfolio.title,
        description: newPortfolio.description || undefined,
        created_at: new Date().toISOString(),
        _count: { candidates: 0 },
      };

      queryClient.setQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId),
        (old) => (old ? [...old, optimisticPortfolio] : [optimisticPortfolio])
      );

      // Return a context object with the snapshotted value
      return { previousPortfolios, optimisticPortfolio };
    },

    onError: (err: any, newPortfolio, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPortfolios) {
        queryClient.setQueryData(
          portfolioKeys.byElection(electionId),
          context.previousPortfolios
        );
      }
      toast.error(err.message || "Failed to create portfolio");
    },

    onSuccess: (data, variables, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId),
        (old) => {
          if (!old) return [data];
          return old.map((portfolio) =>
            portfolio.id === context?.optimisticPortfolio.id ? data : portfolio
          );
        }
      );
      toast.success("Portfolio created successfully!");
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: portfolioKeys.byElection(electionId),
      });
    },
  });
};

// Update portfolio mutation
export const useUpdatePortfolio = (electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      portfolioId,
      portfolioData,
    }: {
      portfolioId: string;
      portfolioData: PortfolioFormData;
    }) => portfolioApi.updatePortfolio(electionId, portfolioId, portfolioData),

    onMutate: async ({ portfolioId, portfolioData }) => {
      await queryClient.cancelQueries({
        queryKey: portfolioKeys.byElection(electionId),
      });

      const previousPortfolios = queryClient.getQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId)
      );

      // Optimistically update
      queryClient.setQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId),
        (old) =>
          old?.map((portfolio) =>
            portfolio.id === portfolioId
              ? {
                  ...portfolio,
                  title: portfolioData.title,
                  description: portfolioData.description,
                }
              : portfolio
          ) || []
      );

      return { previousPortfolios };
    },

    onError: (err: any, variables, context) => {
      if (context?.previousPortfolios) {
        queryClient.setQueryData(
          portfolioKeys.byElection(electionId),
          context.previousPortfolios
        );
      }
      toast.error(err.message || "Failed to update portfolio");
    },

    onSuccess: (data) => {
      // Update with real data
      queryClient.setQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId),
        (old) =>
          old?.map((portfolio) =>
            portfolio.id === data.id ? data : portfolio
          ) || []
      );
      toast.success("Portfolio updated successfully!");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: portfolioKeys.byElection(electionId),
      });
    },
  });
};

// Delete portfolio mutation
export const useDeletePortfolio = (electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (portfolioId: string) =>
      portfolioApi.deletePortfolio(electionId, portfolioId),

    onMutate: async (portfolioId) => {
      await queryClient.cancelQueries({
        queryKey: portfolioKeys.byElection(electionId),
      });

      const previousPortfolios = queryClient.getQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId)
      );

      // Optimistically remove the portfolio
      queryClient.setQueryData<Portfolio[]>(
        portfolioKeys.byElection(electionId),
        (old) => old?.filter((portfolio) => portfolio.id !== portfolioId) || []
      );

      return { previousPortfolios };
    },

    onError: (err: any, portfolioId, context) => {
      if (context?.previousPortfolios) {
        queryClient.setQueryData(
          portfolioKeys.byElection(electionId),
          context.previousPortfolios
        );
      }
      toast.error(err.message || "Failed to delete portfolio");
    },

    onSuccess: () => {
      toast.success("Portfolio deleted successfully!");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: portfolioKeys.byElection(electionId),
      });
      // Also invalidate candidates as they might be affected
      queryClient.invalidateQueries({
        queryKey: ["candidates", "election", electionId],
      });
    },
  });
};
