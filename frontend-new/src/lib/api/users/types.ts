/**
 * Users API Types
 * Type definitions for admin user management
 */

import type { Role } from "../roles/types";

// Admin User model
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  roles?: Role[];
}

// DTO for creating a new user
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// DTO for updating a user
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  status?: "active" | "inactive" | "suspended";
  password?: string;
  password_confirmation?: string;
}

// DTO for assigning a role
export interface AssignRoleDTO {
  role_id: number;
}

// Filters for user list
export interface UserFilters {
  search?: string;
  status?: "active" | "inactive" | "suspended";
  page?: number;
  per_page?: number;
}

// User status options
export const USER_STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "bg-emerald-100 text-emerald-800" },
  { value: "inactive", label: "Inactive", color: "bg-slate-100 text-slate-800" },
  { value: "suspended", label: "Suspended", color: "bg-red-100 text-red-800" },
] as const;

// Helper to get status color
export function getUserStatusColor(status: string): string {
  const option = USER_STATUS_OPTIONS.find((opt) => opt.value === status);
  return option?.color || "bg-slate-100 text-slate-800";
}

// Helper to get user initials
export function getUserInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper to format user role names
export function formatUserRoles(user: AdminUser): string {
  if (!user.roles || user.roles.length === 0) {
    return "No roles";
  }
  return user.roles.map((role) => role.name).join(", ");
}
