// Types
export type {
  StatItem,
  OverviewStats,
  AppointmentTrends,
  AppointmentTrendsSummary,
  StateYearTrend,
  AllStatistics,
  StatisticsFilters,
  GenericData,
  Zone,
  State,
  Ranking,
  Level,
  MaritalStatus,
} from "./types";

export { CHART_COLORS, getChartColor, formatNumber } from "./types";

// Service and hooks
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
} from "./statisticsService";
