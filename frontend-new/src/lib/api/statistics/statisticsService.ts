import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import type { ApiResponse } from "../types";
import type {
  AllStatistics,
  StatItem,
  AppointmentTrends,
  StatisticsFilters,
  GenericData,
} from "./types";

/**
 * Statistics Service
 * Handles all statistics-related API calls
 */
class StatisticsService {
  private readonly baseUrl = "/statistics";

  /**
   * Build query string from filters
   */
  private buildQueryString(filters: StatisticsFilters): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Get all statistics
   */
  async getAll(filters: StatisticsFilters = {}): Promise<AllStatistics> {
    const response = await apiClient.get<ApiResponse<AllStatistics>>(
      `${this.baseUrl}${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get gender statistics
   */
  async getGender(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/gender${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get marital status statistics
   */
  async getMaritalStatus(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/marital-status${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get state of origin statistics
   */
  async getStateOfOrigin(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/state-of-origin${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get assigned state statistics
   */
  async getAssignedState(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/assigned-state${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get rank statistics
   */
  async getRank(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/rank${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get education type statistics
   */
  async getEducationType(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/education-type${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get appointment trends
   */
  async getAppointmentTrends(
    filters: StatisticsFilters = {},
  ): Promise<AppointmentTrends> {
    const response = await apiClient.get<ApiResponse<AppointmentTrends>>(
      `${this.baseUrl}/appointment-trends${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get generic filter options data
   */
  async getGenericData(): Promise<GenericData> {
    const response = await apiClient.get<ApiResponse<GenericData>>(
      "/generic-data",
    );
    return response.data.data;
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService();

/**
 * React Query Keys
 */
export const statisticsQueryKeys = {
  all: ["statistics"] as const,
  allStats: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "all", filters] as const,
  gender: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "gender", filters] as const,
  maritalStatus: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "marital-status", filters] as const,
  stateOfOrigin: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "state-of-origin", filters] as const,
  assignedState: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "assigned-state", filters] as const,
  rank: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "rank", filters] as const,
  educationType: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "education-type", filters] as const,
  appointmentTrends: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "appointment-trends", filters] as const,
  genericData: () => [...statisticsQueryKeys.all, "generic-data"] as const,
};

/**
 * React Query Hooks
 */

// Hook to fetch all statistics
export const useAllStatistics = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.allStats(filters),
    queryFn: () => statisticsService.getAll(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

// Hook to fetch gender statistics
export const useGenderStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.gender(filters),
    queryFn: () => statisticsService.getGender(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch marital status statistics
export const useMaritalStatusStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.maritalStatus(filters),
    queryFn: () => statisticsService.getMaritalStatus(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch state of origin statistics
export const useStateOfOriginStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.stateOfOrigin(filters),
    queryFn: () => statisticsService.getStateOfOrigin(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch assigned state statistics
export const useAssignedStateStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.assignedState(filters),
    queryFn: () => statisticsService.getAssignedState(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch rank statistics
export const useRankStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.rank(filters),
    queryFn: () => statisticsService.getRank(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch education type statistics
export const useEducationTypeStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.educationType(filters),
    queryFn: () => statisticsService.getEducationType(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch appointment trends
export const useAppointmentTrends = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.appointmentTrends(filters),
    queryFn: () => statisticsService.getAppointmentTrends(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch generic filter options data
export const useGenericData = (enabled: boolean = true) => {
  return useQuery({
    queryKey: statisticsQueryKeys.genericData(),
    queryFn: () => statisticsService.getGenericData(),
    staleTime: 1000 * 60 * 10, // 10 minutes - this data changes infrequently
    enabled,
  });
};
