// API Layer exports
export { apiClient, getFileUrl } from "./apiClient";
export { queryClient } from "./queryClient";
export { createService, type ServiceType } from "./createService";
export { createQueryHooks } from "./createQueryHooks";
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  QueryOptions,
  FilterConfig,
  UploadOptions,
  UploadProgressCallback,
} from "./types";
export * from "./change-requests";
export * from "./roles";
export * from "./complaints";
export * from "./users";

export {
  statisticsService,
  statisticsQueryKeys,
  useAllStatistics,
  useGenderStats,
  useMaritalStatusStats,
  useStateOfOriginStats,
  useAssignedStateStats,
  useRankStats,
  useEducationTypeStats,
  useAppointmentTrends,
  useGenericData,
  CHART_COLORS,
  getChartColor,
  formatNumber,
} from "./statistics";

export type {
  StatItem,
  OverviewStats,
  AppointmentTrends,
  AppointmentTrendsSummary,
  StateYearTrend,
  AllStatistics,
  StatisticsFilters,
  GenericData,
  Ranking,
  Level,
  MaritalStatus,
  LGA,
} from "./statistics";
