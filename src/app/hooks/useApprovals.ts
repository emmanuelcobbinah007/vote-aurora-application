import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ElectionApproval } from "../components/ui/superadmin/approvals/approvalTypes";

interface ApprovalsPaginationParams {
  page?: number;
  limit?: number;
}

interface ApprovalsPaginationResponse {
  approvals: ElectionApproval[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// API function to fetch approvals with pagination
const fetchApprovals = async (
  params?: ApprovalsPaginationParams
): Promise<ApprovalsPaginationResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append("page", params.page.toString());
  if (params?.limit) searchParams.append("limit", params.limit.toString());

  const url = `/api/superadmin/approvals${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch approvals");
  }

  return response.json();
};

// API function to update approval status
const updateApprovalStatus = async ({
  electionId,
  status,
  notes,
}: {
  electionId: string;
  status: "approved" | "rejected";
  notes?: string;
}) => {
  const response = await fetch(`/api/superadmin/approvals/${electionId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    throw new Error("Failed to update approval status");
  }

  return response.json();
};

// Custom hook for fetching approvals with TanStack Query and pagination support
export const useApprovals = (params?: ApprovalsPaginationParams) => {
  return useQuery({
    queryKey: ["approvals", params],
    queryFn: () => fetchApprovals(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Custom hook for updating approval status
export const useUpdateApprovalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApprovalStatus,
    onSuccess: () => {
      // Invalidate and refetch approvals data
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
    onError: (error) => {
      console.error("Error updating approval status:", error);
    },
  });
};
