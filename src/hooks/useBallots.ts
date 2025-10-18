import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ballotApi, BallotResponse, BallotOrder } from "@/services/ballotApi";

// Query keys factory
export const ballotKeys = {
  all: ["ballots"] as const,
  byElection: (electionId: string) => ["ballots", electionId] as const,
};

// Hook to fetch ballot order for an election
export const useBallotOrder = (electionId: string) => {
  return useQuery({
    queryKey: ballotKeys.byElection(electionId),
    queryFn: () => ballotApi.getBallotOrder(electionId),
    staleTime: 5 * 60 * 1000, // 5 minutes
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

// Hook to update ballot order
export const useUpdateBallotOrder = (electionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ballotOrder: BallotOrder[]) =>
      ballotApi.updateBallotOrder(electionId, ballotOrder),

    onMutate: async (newBallotOrder) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ballotKeys.byElection(electionId),
      });

      // Snapshot the previous value
      const previousBallots = queryClient.getQueryData<BallotResponse[]>(
        ballotKeys.byElection(electionId)
      );

      // Optimistically update to the new value
      if (previousBallots) {
        const optimisticBallots = previousBallots
          .map((ballot) => {
            const newOrder = newBallotOrder.find(
              (item) => item.portfolioId === ballot.portfolio_id
            );
            return newOrder
              ? { ...ballot, ballot_order: newOrder.order }
              : ballot;
          })
          .sort((a, b) => a.ballot_order - b.ballot_order);

        queryClient.setQueryData(
          ballotKeys.byElection(electionId),
          optimisticBallots
        );
      }

      // Return a context object with the snapshotted value
      return { previousBallots };
    },

    onError: (error, newBallotOrder, context) => {
      // Rollback to the previous value
      if (context?.previousBallots) {
        queryClient.setQueryData(
          ballotKeys.byElection(electionId),
          context.previousBallots
        );
      }

      // Show error toast
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update ballot order";
      toast.error(errorMessage);
    },

    onSuccess: (data) => {
      // Update the cache with the server response
      queryClient.setQueryData(ballotKeys.byElection(electionId), data);

      // Show success toast
      toast.success("Ballot order updated successfully!");
    },

    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ballotKeys.byElection(electionId),
      });
    },
  });
};
