import { z } from "zod";

/**
 * Zod Validation Schemas for Authentication
 * Provides runtime type checking and validation for forms and API responses
 */

// Admin login form schema
export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

// Staff login form schema
export const staffLoginSchema = z.object({
  service_no: z
    .string()
    .min(1, "Service number is required")
    .regex(/^\d+$/, "Service number must contain only digits"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type StaffLoginFormData = z.infer<typeof staffLoginSchema>;

// Retirement time remaining schema
const retirementTimeRemainingSchema = z.object({
  status: z.string(),
  years: z.number(),
  months: z.number(),
  days: z.number(),
  human_readable: z.string(),
});

// Base user schema
const baseUserSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  status: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Staff user schema
export const staffUserSchema = baseUserSchema.extend({
  service_no: z.string(),
  phone_number: z.string().nullable(),
  assigned_state: z.string().nullable(),
  prison: z.string().nullable(),
  surname: z.string(),
  first_name: z.string(),
  other_names: z.string(),
  sex: z.string(),
  initial_rank: z.string(),
  present_rank: z.string(),
  level: z.number(),
  step: z.number().nullable(),
  dob: z.string(),
  date_of_first_appointment: z.string(),
  present_appointment_date: z.string().nullable(),
  command_post_date: z.string().nullable(),
  initial_command: z.string().nullable(),
  present_command: z.string().nullable(),
  state_of_origin: z.string(),
  lga: z.string(),
  department: z.string(),
  file_no: z.string(),
  duty: z.string(),
  description: z.string(),
  photo: z.string().nullable(),
  last_login: z.string().nullable(),
  is_verified: z.number(),
  zone_id: z.number().nullable(),
  retirement_date_formatted: z.string(),
  is_retired: z.boolean(),
  retirement_time_remaining: retirementTimeRemainingSchema,
});

// Admin user schema
export const adminUserSchema = baseUserSchema.extend({
  name: z.string(),
  email_verified_at: z.string(),
});

// Union schema for user
export const userSchema = z.union([staffUserSchema, adminUserSchema]);

// Login response schema
export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  user: userSchema,
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});
