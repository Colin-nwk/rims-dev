/**
 * Dashboard types
 * Type definitions for dashboard statistics and related data
 */

/** Label → staff count (includes "Unassigned" when no FK). */
export type StaffDistributionMap = Record<string, number>;

export interface DashboardStaffDistributions {
  work_distributions: StaffDistributionMap;
  directorates: StaffDistributionMap;
  training_schools: StaffDistributionMap;
}

export interface DashboardStats {
  staff: {
    total: number;
    active: number;
  };
  users: {
    total: number;
  };
  change_requests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  zones: number;
  states: number;
  prisons: number;
  /** Rows in work_distributions lookup table */
  work_distributions?: number;
  /** Rows in directorates lookup table */
  directorates?: number;
  /** Rows in training_institutes lookup table */
  training_schools?: number;
  /** Staff counts grouped by work distribution, directorate, and training institute */
  staff_distributions?: DashboardStaffDistributions;
}
