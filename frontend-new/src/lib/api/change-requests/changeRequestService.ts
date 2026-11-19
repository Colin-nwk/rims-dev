import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import { dashboardQueryKeys } from "../dashboard/dashboardService";
import type { ApiResponse, PaginatedResponse, QueryOptions } from "../types";
import type {
  ChangeRequest,
  ChangeRequestActionResponse,
  ChangeRequestFilters,
  RejectRequestDTO,
} from "./types";

/**
 * Change Request Service
 * Handles all change request-related API calls
 */
class ChangeRequestService {
  private readonly baseUrl = "/change-requests";

  /**
   * Get paginated list of change requests with filters
   */
  async getAll(
    options?: QueryOptions,
    filters?: ChangeRequestFilters,
  ): Promise<PaginatedResponse<ChangeRequest>> {
    const params = { ...options, ...filters };
    const response = await apiClient.get<{
      data: PaginatedResponse<ChangeRequest>;
    }>(this.baseUrl, { params });
    return response.data.data;
  }

  /**
   * Approve a change request
   */
  async approve(id: number): Promise<ApiResponse<ChangeRequestActionResponse>> {
    const response = await apiClient.post<
      ApiResponse<ChangeRequestActionResponse>
    >(`${this.baseUrl}/${id}/approve`);
    return response.data;
  }

  /**
   * Reject a change request with reason
   */
  async reject(
    id: number,
    data: RejectRequestDTO,
  ): Promise<ApiResponse<ChangeRequestActionResponse>> {
    const response = await apiClient.post<
      ApiResponse<ChangeRequestActionResponse>
    >(`${this.baseUrl}/${id}/reject`, data);
    return response.data;
  }
}

// Export singleton instance
export const changeRequestService = new ChangeRequestService();

/**
 * React Query Hooks
 */

// Query keys
export const changeRequestQueryKeys = {
  all: ["change-requests"] as const,
  lists: () => [...changeRequestQueryKeys.all, "list"] as const,
  list: (options?: QueryOptions, filters?: ChangeRequestFilters) =>
    [...changeRequestQueryKeys.lists(), options, filters] as const,
};

/**
 * Hook to fetch paginated change requests list
 */
export const useChangeRequests = (
  options?: QueryOptions,
  filters?: ChangeRequestFilters,
  queryOptions?: { enabled?: boolean; refetchInterval?: number },
) => {
  return useQuery({
    queryKey: changeRequestQueryKeys.list(options, filters),
    queryFn: () => changeRequestService.getAll(options, filters),
    staleTime: 1000 * 30, // 30 seconds - for responsive badge updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    ...queryOptions,
  });
};

/**
 * Hook to approve a change request
 */
export const useApproveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => changeRequestService.approve(id),
    onSuccess: () => {
      // Invalidate all change request queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: changeRequestQueryKeys.all,
        refetchType: "all",
      });
      // Invalidate dashboard stats to update pending count badge
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all,
      });
    },
  });
};

/**
 * Hook to reject a change request
 */
export const useRejectRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectRequestDTO }) =>
      changeRequestService.reject(id, data),
    onSuccess: () => {
      // Invalidate all change request queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: changeRequestQueryKeys.all,
        refetchType: "all",
      });
      // Invalidate dashboard stats to update pending count badge
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all,
      });
    },
  });
};

/**
 * Hook to bulk approve multiple requests
 */
export const useBulkApprove = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => changeRequestService.approve(id)),
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      return { succeeded, failed, total: ids.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: changeRequestQueryKeys.all,
        refetchType: "all",
      });
      // Invalidate dashboard stats to update pending count badge
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all,
      });
    },
  });
};

/**
 * Hook to bulk reject multiple requests
 */
export const useBulkReject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, reason }: { ids: number[]; reason: string }) => {
      const results = await Promise.allSettled(
        ids.map((id) => changeRequestService.reject(id, { reason })),
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      return { succeeded, failed, total: ids.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: changeRequestQueryKeys.all,
        refetchType: "all",
      });
      // Invalidate dashboard stats to update pending count badge
      queryClient.invalidateQueries({
        queryKey: dashboardQueryKeys.all,
      });
    },
  });
};
