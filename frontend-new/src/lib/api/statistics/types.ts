/**
 * Statistics Types
 * Type definitions for statistics API responses
 */

// Base stat item returned by most endpoints
export interface StatItem {
  label: string;
  count: number;
  percentage: number;
}

// Overview statistics from the main endpoint
export interface OverviewStats {
  total_staff: number;
  staff_with_details: number;
  education_records: number;
  filters_applied: boolean;
}

// Appointment trends data
export interface AppointmentTrendsSummary {
  with_date: number;
  without_date: number;
  earliest: string | null;
  latest: string | null;
}

export interface StateYearTrend {
  state: string;
  year: string;
  count: number;
}

export interface AppointmentTrends {
  by_year: StatItem[];
  by_month: StatItem[];
  by_state_origin_year: StateYearTrend[];
  summary: AppointmentTrendsSummary;
}

// All statistics combined (from /statistics endpoint)
export interface AllStatistics {
  overview: OverviewStats;
  gender: StatItem[];
  marital_status: StatItem[];
  state_of_origin: StatItem[];
  assigned_state: StatItem[];
  present_rank: StatItem[];
  level: StatItem[];
  department: StatItem[];
  education_type: StatItem[];
  staff_status: StatItem[];
  appointment_by_year: StatItem[];
  appointment_by_month: StatItem[];
}

// Filters for statistics queries
export interface StatisticsFilters {
  state_of_origin?: string;
  assigned_state?: string;
  sex?: string;
  present_rank?: string;
  level?: string;
  department?: string;
  status?: string;
  zone_id?: string;
  year_from?: string;
  year_to?: string;
  marital_status?: string;
}

// Generic filter options data
export interface Zone {
  id: number;
  zone: string;
  status: boolean;
}

export interface State {
  id: number;
  state: string;
  zone_id: number;
  status: boolean;
}

export interface Ranking {
  id: number;
  title: string;
  status: boolean;
}

export interface Level {
  id: number;
  level: string;
  level_number: number;
  status: boolean;
}

export interface MaritalStatus {
  id: number;
  name: string;
  status: boolean;
}

export interface Prison {
  id: number;
  prison_name: string;
  state_id: number;
  status: boolean;
}

export interface LGA {
  id: number;
  lga: string;
  state_id: number;
  status: number;
}

export interface GenericData {
  zones: Zone[];
  states: State[];
  prisons: Prison[];
  lgas: LGA[];
  rankings: Ranking[];
  levels: Level[];
  marital_statuses: MaritalStatus[];
  departments?: string[];
  statuses?: string[];
}

// Chart color schemes
export const CHART_COLORS = {
  primary: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0"],
  gender: ["#3b82f6", "#ec4899", "#8b5cf6"],
  maritalStatus: ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#8b5cf6"],
  rank: ["#0891b2", "#0284c7", "#2563eb", "#4f46e5", "#7c3aed", "#9333ea"],
  states: [
    "#059669",
    "#0891b2",
    "#2563eb",
    "#7c3aed",
    "#c026d3",
    "#e11d48",
    "#ea580c",
    "#ca8a04",
    "#65a30d",
    "#14b8a6",
  ],
  trend: ["#10b981", "#3b82f6"],
  education: ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"],
} as const;

// Helper to get color for a chart item
export function getChartColor(
  index: number,
  palette: readonly string[],
): string {
  return palette[index % palette.length];
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
}
