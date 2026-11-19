import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import type { ApiResponse } from "../types";
import type { DashboardStats } from "./types";

/**
 * Dashboard Service
 * Handles dashboard statistics fetching
 */
class DashboardService {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const response =
      await apiClient.get<ApiResponse<DashboardStats>>("/dashboard");
    return response.data;
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();

/**
 * React Query Hooks
 */

// Query key for dashboard stats
export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardQueryKeys.all, "stats"] as const,
};

/**
 * Hook to fetch dashboard statistics
 * @param options - React Query options
 */
export const useDashboardStats = (options?: { refetchInterval?: number }) => {
  return useQuery({
    queryKey: dashboardQueryKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: 1000 * 30, // 30 seconds - shorter for more responsive badge updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    ...options,
  });
};
