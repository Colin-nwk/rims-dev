// Types
export type {
  StatItem,
  OverviewStats,
  AppointmentTrends,
  AppointmentTrendsSummary,
  StateYearTrend,
  AllStatistics,
  StatisticsFilters,
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
} from "./statisticsService";
