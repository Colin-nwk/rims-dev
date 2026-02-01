export const ROUTES = {
  // Auth
  STAFF_LOGIN: "/staff-login",
  ADMIN_LOGIN: "/admin-login",
  CONFIRM_SERVICE_NUMBER: "/confirm-service-number",
  PUBLIC_COMPLAINT: "/complaint",

  // Protected
  DASHBOARD: "/dashboard",
  QUALIFICATIONS: "/qualifications",
  HELP_DESK: "/help-desk",
  STAFF_DIRECTORY: "/staff",
  ADMIN_USERS_DIRECTORY: "/admin-users",
  APPROVALS: "/approvals",
  STATISTICS: "/statistics",
  ROLES_PERMISSIONS: "/admin/roles",
  PROFILE: "/profile",

  // Public
  STAFF_PROFILE: "/staff/:serviceNo",
  NOT_FOUND: "/404",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
