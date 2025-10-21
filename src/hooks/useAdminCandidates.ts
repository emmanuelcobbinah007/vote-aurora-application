import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminApi, Candidate, CandidateFormData } from "@/services/adminApi";

export interface AdminContext {
  readonly adminId: string;
  readonly electionId: string;
}

export interface CandidateContext extends AdminContext {
  readonly candidateId: string;
}

export interface CreateCandidateRequest {
  readonly portfolioId: string;
  readonly candidateData: CandidateFormData;
}

export interface UpdateCandidateRequest {
  readonly candidateId: string;
  readonly candidateData: CandidateFormData & { portfolio_id?: string };
}

export const adminCandidateKeys = {
  all: ["adminCandidates"] as const,
  byElection: (context: AdminContext) =>
    [
      "adminCandidates",
      "admin",
      context.adminId,
      "election",
      context.electionId,
    ] as const,
  detail: (context: CandidateContext) =>
    [
      "adminCandidates",
      "admin",
      context.adminId,
      "election",
      context.electionId,
      context.candidateId,
    ] as const,
};

const invalidateAdminCandidateQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  context: AdminContext,
  candidateId?: string
) => {
  queryClient.invalidateQueries({
    queryKey: adminCandidateKeys.byElection(context),
  });

  if (candidateId) {
    const candidateContext: CandidateContext = { ...context, candidateId };
    queryClient.invalidateQueries({
      queryKey: adminCandidateKeys.detail(candidateContext),
    });
  }
};

const handleMutationError = (error: Error, defaultMessage: string) => {
  toast.error(error.message || defaultMessage);
};

const handleQueryRetry = (failureCount: number, error: Error): boolean => {
  if ((error as any)?.response?.status === 403) {
    toast.error(
      "You don't have access to manage candidates for this election."
    );
    return false;
  }
  return failureCount < 2;
};

export function useAdminCandidates(context: AdminContext) {
  return useQuery({
    queryKey: adminCandidateKeys.byElection(context),
    queryFn: () =>
      adminApi.getCandidates(
        adminApi.createAdminId(context.adminId),
        adminApi.createElectionId(context.electionId)
      ),
    enabled: !!context.adminId && !!context.electionId,
    staleTime: 5 * 60 * 1000,
    retry: handleQueryRetry,
  });
}

export function useAdminCandidate(context: CandidateContext) {
  return useQuery({
    queryKey: adminCandidateKeys.detail(context),
    queryFn: () =>
      adminApi.getCandidate(
        adminApi.createAdminId(context.adminId),
        adminApi.createElectionId(context.electionId),
        adminApi.createCandidateId(context.candidateId)
      ),
    enabled: !!context.adminId && !!context.electionId && !!context.candidateId,
  });
}

export function useCreateAdminCandidate(context: AdminContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCandidateRequest) =>
      adminApi.createCandidate(
        adminApi.createAdminId(context.adminId),
        adminApi.createElectionId(context.electionId),
        adminApi.createPortfolioId(request.portfolioId),
        request.candidateData
      ),
    onSuccess: () => {
      invalidateAdminCandidateQueries(queryClient, context);
      toast.success("Candidate created successfully!");
    },
    onError: (error: Error) => {
      handleMutationError(
        error,
        "Failed to create candidate. Please try again."
      );
    },
  });
}

export function useUpdateAdminCandidate(context: AdminContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateCandidateRequest) =>
      adminApi.updateCandidate(
        adminApi.createAdminId(context.adminId),
        adminApi.createElectionId(context.electionId),
        adminApi.createCandidateId(request.candidateId),
        {
          ...request.candidateData,
          portfolio_id: request.candidateData.portfolio_id
            ? adminApi.createPortfolioId(request.candidateData.portfolio_id)
            : undefined,
        }
      ),
    onSuccess: (_, variables) => {
      invalidateAdminCandidateQueries(
        queryClient,
        context,
        variables.candidateId
      );
      toast.success("Candidate updated successfully!");
    },
    onError: (error: Error) => {
      handleMutationError(
        error,
        "Failed to update candidate. Please try again."
      );
    },
  });
}

export function useDeleteAdminCandidate(context: AdminContext) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateId: string) =>
      adminApi.deleteCandidate(
        adminApi.createAdminId(context.adminId),
        adminApi.createElectionId(context.electionId),
        adminApi.createCandidateId(candidateId)
      ),
    onSuccess: () => {
      invalidateAdminCandidateQueries(queryClient, context);
      toast.success("Candidate deleted successfully!");
    },
    onError: (error: Error) => {
      handleMutationError(
        error,
        "Failed to delete candidate. Please try again."
      );
    },
  });
}
