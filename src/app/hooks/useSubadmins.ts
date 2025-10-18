import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface SubadminPaginationParams {
  page?: number;
  limit?: number;
}

interface SubadminPaginationResponse {
  subadmins: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const useSubadmins = (params?: SubadminPaginationParams) => {
  return useQuery<SubadminPaginationResponse>({
    queryKey: ["subadmins", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());

      const url = `/api/superadmin/subadmins${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      const response = await axios.get(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
