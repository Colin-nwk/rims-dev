export const ROUTES = {
  // Auth
  STAFF_LOGIN: "/staff-login",
  ADMIN_LOGIN: "/admin-login",
  CONFIRM_SERVICE_NUMBER: "/confirm-service-number",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  PUBLIC_COMPLAINT: "/complaint",

  // Protected
  DASHBOARD: "/dashboard",
  QUALIFICATIONS: "/qualifications",
  PERSONNEL_DOCUMENTS: "/personnel_documents",
  HELP_DESK: "/help-desk",
  STAFF_DIRECTORY: "/staff",
  STAFF_ADD: "/staff/add",
  STAFF_EDIT: "/staff/edit/:serviceNo",
  STAFF_VIEW: "/staff/view/:serviceNo",
  STAFF_POSTINGS: "/staff-postings",
  CAREER_HISTORY_VIEW: "/career-history/view/:serviceNo",
  CAREER_HISTORY_CREATE: "/career-history/create/:serviceNo",
  ADMIN_USERS_DIRECTORY: "/admin-users",
  APPROVALS: "/approvals",
  CHANGE_REQUESTS: "/change-requests",
  STATISTICS: "/statistics",
  ROLES_PERMISSIONS: "/admin/roles",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",

  // Public
  STAFF_PROFILE: "/staff/:serviceNo",
  NOT_FOUND: "/404",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
