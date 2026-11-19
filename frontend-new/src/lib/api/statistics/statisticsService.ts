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

  /**
   * Get initial rank statistics
   */
  async getInitialRank(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/initial-rank${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get initial command statistics
   */
  async getInitialCommand(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/initial-command${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get present command statistics
   */
  async getPresentCommand(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/present-command${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get zone statistics
   */
  async getZone(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/zone${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get age groups statistics
   */
  async getAgeGroups(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/age-groups${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get prison statistics
   */
  async getPrison(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/prison${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get LGA statistics
   */
  async getLga(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/lga${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get document verification statistics
   */
  async getDocumentVerification(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/documents/verification${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get document expiry statistics
   */
  async getDocumentExpiry(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/documents/expiry${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get retirement eligibility statistics
   */
  async getRetirementEligibility(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/retirement-eligibility${this.buildQueryString(filters)}`,
    );
    return response.data.data;
  }

  /**
   * Get promotion eligibility statistics
   */
  async getPromotionEligibility(filters: StatisticsFilters = {}): Promise<StatItem[]> {
    const response = await apiClient.get<ApiResponse<StatItem[]>>(
      `${this.baseUrl}/promotion-eligibility${this.buildQueryString(filters)}`,
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
  // New query keys
  initialRank: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "initial-rank", filters] as const,
  initialCommand: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "initial-command", filters] as const,
  presentCommand: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "present-command", filters] as const,
  zone: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "zone", filters] as const,
  ageGroups: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "age-groups", filters] as const,
  prison: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "prison", filters] as const,
  lga: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "lga", filters] as const,
  documentVerification: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "documents-verification", filters] as const,
  documentExpiry: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "documents-expiry", filters] as const,
  retirementEligibility: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "retirement-eligibility", filters] as const,
  promotionEligibility: (filters: StatisticsFilters) =>
    [...statisticsQueryKeys.all, "promotion-eligibility", filters] as const,
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

// Hook to fetch initial rank statistics
export const useInitialRankStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.initialRank(filters),
    queryFn: () => statisticsService.getInitialRank(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch initial command statistics
export const useInitialCommandStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.initialCommand(filters),
    queryFn: () => statisticsService.getInitialCommand(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch present command statistics
export const usePresentCommandStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.presentCommand(filters),
    queryFn: () => statisticsService.getPresentCommand(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch zone statistics
export const useZoneStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.zone(filters),
    queryFn: () => statisticsService.getZone(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch age groups statistics
export const useAgeGroupsStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.ageGroups(filters),
    queryFn: () => statisticsService.getAgeGroups(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch prison statistics
export const usePrisonStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.prison(filters),
    queryFn: () => statisticsService.getPrison(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch LGA statistics
export const useLgaStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.lga(filters),
    queryFn: () => statisticsService.getLga(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch document verification statistics
export const useDocumentVerificationStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.documentVerification(filters),
    queryFn: () => statisticsService.getDocumentVerification(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch document expiry statistics
export const useDocumentExpiryStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.documentExpiry(filters),
    queryFn: () => statisticsService.getDocumentExpiry(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch retirement eligibility statistics
export const useRetirementEligibilityStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.retirementEligibility(filters),
    queryFn: () => statisticsService.getRetirementEligibility(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

// Hook to fetch promotion eligibility statistics
export const usePromotionEligibilityStats = (
  filters: StatisticsFilters = {},
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: statisticsQueryKeys.promotionEligibility(filters),
    queryFn: () => statisticsService.getPromotionEligibility(filters),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};
