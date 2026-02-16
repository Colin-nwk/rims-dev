/**
 * Authentication Types
 * Based on backend API responses, enhanced with better TypeScript support
 */

// Base user fields shared by all user types
interface BaseUser {
  id: number;
  email?: string;
  status?: number;
  created_at: string;
  updated_at: string;
}

// Staff user with detailed profile information
// Fields are nullable to support newly registered users who haven't completed their profile
export interface StaffUser extends BaseUser {
  service_no: string;
  phone_number?: string | null;
  assigned_state?: string | null;
  prison?: string | null;
  surname?: string | null;
  first_name?: string | null;
  other_names?: string | null;
  sex?: string | null;
  initial_rank?: string | null;
  initial_rank_name?: string | null;
  present_rank?: string | null;
  present_rank_name?: string | null;
  level?: number | null;
  step?: number | null;
  dob?: string | null;
  date_of_first_appointment?: string | null;
  present_appointment_date?: string | null;
  command_post_date?: string | null;
  initial_command?: string | null;
  present_command?: string | null;
  state_of_origin?: string | null;
  lga?: string | null;
  department?: string | null;
  file_no?: string | null;
  duty?: string | null;
  description?: string | null;
  photo?: string | null;
  last_login?: string | null;
  is_verified?: number | null;
  zone_id?: number | null;
  retirement_date_formatted?: string | null;
  is_retired?: boolean | null;
  retirement_time_remaining?: {
    status: string;
    years: number;
    months: number;
    days: number;
    human_readable: string;
  } | null;
}

// Admin user with basic information
export interface AdminUser extends BaseUser {
  name: string;
  email_verified_at: string | null;
}

// Union type for any authenticated user
export type User = StaffUser | AdminUser;

// Login request payloads
export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface StaffLoginRequest {
  service_no: string;
  password: string;
}

// Login response from API
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
  roles: string[];
  permissions: string[];
}

// Confirm service number request payload (Step 1)
export interface ConfirmServiceNumberRequest {
  service_no: string;
  file_no: string;
  ippis: string;
}

// Confirm service number response from API
export interface ConfirmServiceNumberResponse {
  first_name: string;
  surname: string;
  service_no: string;
}

// Set password request payload (Step 2)
export interface SetPasswordRequest {
  service_no: string;
  password: string;
  password_confirmation: string;
}

// Forgot password request payload
export interface ForgotPasswordRequest {
  email: string;
}

// Staff forgot password request payload
export interface StaffForgotPasswordRequest {
  service_no: string;
  email: string;
}

// Reset password request payload
export interface ResetPasswordRequest {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Staff reset password request payload
export interface StaffResetPasswordRequest {
  token: string;
  service_no: string;
  password: string;
  password_confirmation: string;
}

// Type guards for user discrimination
export function isStaffUser(user: User): user is StaffUser {
  return "service_no" in user;
}

export function isAdminUser(user: User): user is AdminUser {
  return "name" in user && !("service_no" in user);
}

// Helper to get display name from any user type
export function getDisplayName(user: User | null | undefined): string {
  if (!user) return "";
  if (isStaffUser(user)) {
    const firstName = user.first_name || "";
    const surname = user.surname || "";
    const fullName = `${firstName} ${surname}`.trim();
    return fullName || user.service_no; // Fall back to service_no if no name
  }
  return user.name || "";
}

// Helper to get initials from display name
export function getUserInitials(user: User | null | undefined): string {
  const displayName = getDisplayName(user);
  if (!displayName) return "";

  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
