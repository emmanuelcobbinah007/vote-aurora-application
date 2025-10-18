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
    ["adminCandidates", "admin", context.adminId, "election", context.electionId] as const,
  detail: (context: CandidateContext) =>
    ["adminCandidates", "admin", context.adminId, "election", context.electionId, context.candidateId] as const,
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

const handleMutationError = (error: any, defaultMessage: string) => {
  toast.error(error.message || defaultMessage);
};

const handleQueryRetry = (failureCount: number, error: any): boolean => {
  if (error?.response?.status === 403) {
    toast.error("You don't have access to manage candidates for this election.");
    return false;
  }
  return failureCount < 2;
};


interface MutationConfig<TVariables> {
  mutationFn: (variables: TVariables) => Promise<any>;
  successMessage: string;
  errorMessage: string;
  shouldInvalidateDetail?: boolean;
}

const createAdminCandidateMutation = <TVariables>(
  context: AdminContext,
  config: MutationConfig<TVariables>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: config.mutationFn,
    onSuccess: (data, variables: any) => {
      const candidateId = config.shouldInvalidateDetail ? variables.candidateId : undefined;
      invalidateAdminCandidateQueries(queryClient, context, candidateId);
      toast.success(config.successMessage);
    },
    onError: (error: any) => {
      handleMutationError(error, config.errorMessage);
      if (config.errorMessage.includes("create") || config.errorMessage.includes("update")) {
        throw error;
      }
    },
  });
};


export function useAdminCandidates(context: AdminContext) {
  return useQuery({
    queryKey: adminCandidateKeys.byElection(context),
    queryFn: () => adminApi.getCandidates(context.adminId, context.electionId),
    enabled: !!context.adminId && !!context.electionId,
    staleTime: 5 * 60 * 1000, 
    retry: handleQueryRetry,
  });
}

export function useAdminCandidate(context: CandidateContext) {
  return useQuery({
    queryKey: adminCandidateKeys.detail(context),
    queryFn: () => adminApi.getCandidate(context.adminId, context.electionId, context.candidateId),
    enabled: !!context.adminId && !!context.electionId && !!context.candidateId,
  });
}


export function useCreateAdminCandidate(context: AdminContext) {
  return createAdminCandidateMutation(context, {
    mutationFn: (request: CreateCandidateRequest) =>
      adminApi.createCandidate(context.adminId, context.electionId, request.portfolioId, request.candidateData),
    successMessage: "Candidate created successfully!",
    errorMessage: "Failed to create candidate. Please try again.",
  });
}

export function useUpdateAdminCandidate(context: AdminContext) {
  return createAdminCandidateMutation(context, {
    mutationFn: (request: UpdateCandidateRequest) =>
      adminApi.updateCandidate(context.adminId, context.electionId, request.candidateId, request.candidateData),
    successMessage: "Candidate updated successfully!",
    errorMessage: "Failed to update candidate. Please try again.",
    shouldInvalidateDetail: true,
  });
}


export function useDeleteAdminCandidate(context: AdminContext) {
  return createAdminCandidateMutation(context, {
    mutationFn: (candidateId: string) => adminApi.deleteCandidate(context.adminId, context.electionId, candidateId),
    successMessage: "Candidate deleted successfully!",
    errorMessage: "Failed to delete candidate. Please try again.",
  });
}