export const ROUTES = {
  // Auth
  STAFF_LOGIN: "/staff-login",
  ADMIN_LOGIN: "/admin-login",

  // Protected - Staff Module
  DASHBOARD: "/dashboard",
  DOCUMENTS: "/documents",
  HELP_DESK: "/help-desk",

  // Protected - Management
  STAFF_DIRECTORY: "/staff",
  ADMIN_USERS_DIRECTORY: "/admin-users",
  APPROVALS: "/approvals",
  STATISTICS: "/statistics",

  // Protected - System
  ROLES_PERMISSIONS: "/admin/roles",
  PROFILE: "/profile",

  // Public
  STAFF_PROFILE: "/staff/:serviceNo",
  NOT_FOUND: "/404",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
