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
  // New statistics
  initial_rank?: StatItem[];
  initial_command?: StatItem[];
  present_command?: StatItem[];
  zone?: StatItem[];
  age_groups?: StatItem[];
  prison?: StatItem[];
  lga?: StatItem[];
  retirement_eligibility?: StatItem[];
  promotion_eligibility?: StatItem[];
}

// Filters for statistics queries
export interface StatisticsFilters {
  state_of_origin?: string;
  assigned_state?: number;
  sex?: string;
  present_rank?: string;
  level?: string;
  directorate_id?: number;
  staff_status_id?: number;
  work_distribution_id?: number;
  training_institute_id?: number;
  zone_id?: string;
  year_from?: string;
  year_to?: string;
  marital_status?: string;
  // New filters
  initial_rank?: string;
  present_command?: string;
  initial_command?: string;
  prison?: number;
  lga?: string;
  age_range?: string;
  zone?: string;
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

export interface DegreeType {
  id: number;
  title: string;
  status: boolean | number;
}

export interface BloodGroup {
  id: number;
  name: string;
  status: boolean;
}

export interface BloodGenotype {
  id: number;
  name: string;
  status: boolean;
}

export interface Complexion {
  id: number;
  name: string;
  status: boolean;
}

export interface HairColour {
  id: number;
  name: string;
  status: boolean;
}

interface Regular {
  id: number;
  name: string;
  status: boolean;
}

export interface GenericData {
  zones: Zone[];
  states: State[];
  prisons: Prison[];
  lgas: LGA[];
  rankings: Ranking[];
  levels: Level[];
  marital_statuses: MaritalStatus[];
  statuses: Regular[];
  work_distributions: Regular[];
  training_institutes: Regular[];
  directorates: Regular[];
  blood_groups: BloodGroup[];
  blood_genotypes: BloodGenotype[];
  complexions: Complexion[];
  hair_colours: HairColour[];
  degree_types?: DegreeType[];
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
  // New color schemes
  ageGroups: [
    "#06b6d4",
    "#0891b2",
    "#0e7490",
    "#155e75",
    "#164e63",
    "#134e4a",
    "#115e59",
  ],
  eligibility: ["#10b981", "#f59e0b", "#ef4444"],
  documents: ["#22c55e", "#eab308", "#ef4444", "#94a3b8"],
  prison: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"],
  lga: ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"],
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
