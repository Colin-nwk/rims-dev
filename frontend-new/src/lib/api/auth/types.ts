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
export interface StaffUser extends BaseUser {
  service_no: string;
  phone_number: string | null;
  assigned_state: string | null;
  prison: string | null;
  surname: string;
  first_name: string;
  other_names: string;
  sex: string;
  initial_rank: string;
  present_rank: string;
  level: number;
  step: number | null;
  dob: string;
  date_of_first_appointment: string;
  present_appointment_date: string | null;
  command_post_date: string | null;
  initial_command: string | null;
  present_command: string | null;
  state_of_origin: string;
  lga: string;
  department: string;
  file_no: string;
  duty: string;
  description: string;
  photo: string | null;
  last_login: string | null;
  is_verified: number;
  zone_id: number | null;
  retirement_date_formatted: string;
  is_retired: boolean;
  retirement_time_remaining: {
    status: string;
    years: number;
    months: number;
    days: number;
    human_readable: string;
  };
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
    return `${user.first_name} ${user.surname}`;
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
