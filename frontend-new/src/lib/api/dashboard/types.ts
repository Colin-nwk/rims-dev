/**
 * Dashboard types
 * Type definitions for dashboard statistics and related data
 */

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
}
