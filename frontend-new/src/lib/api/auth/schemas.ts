import { z } from "zod";

/**
 * Zod Validation Schemas for Authentication
 * Provides runtime type checking and validation for forms and API responses
 */

// Admin login form schema
export const adminLoginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

// Staff login form schema
export const staffLoginSchema = z.object({
  service_no: z
    .string({ error: "Service number is required" })
    .min(1, "Service number is required"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
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
  email: z.string().email().nullish(), // Can be null or undefined
  status: z.number().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Staff user schema - fields are nullable to support newly registered users
export const staffUserSchema = baseUserSchema.extend({
  service_no: z.string(),
  phone_number: z.string().nullish(),
  assigned_state: z.string().nullish(),
  prison: z.string().nullish(),
  surname: z.string().nullish(),
  first_name: z.string().nullish(),
  other_names: z.string().nullish(),
  sex: z.string().nullish(),
  initial_rank: z.string().nullish(),
  present_rank: z.string().nullish(),
  level: z.number().nullish(),
  step: z.number().nullish(),
  dob: z.string().nullish(),
  date_of_first_appointment: z.string().nullish(),
  present_appointment_date: z.string().nullish(),
  command_post_date: z.string().nullish(),
  initial_command: z.string().nullish(),
  present_command: z.string().nullish(),
  state_of_origin: z.string().nullish(),
  lga: z.string().nullish(),
  department: z.string().nullish(),
  file_no: z.string().nullish(),
  duty: z.string().nullish(),
  description: z.string().nullish(),
  photo: z.string().nullish(),
  last_login: z.string().nullish(),
  is_verified: z.number().nullish(),
  zone_id: z.number().nullish(),
  retirement_date_formatted: z.string().nullish(),
  is_retired: z.boolean().nullish(),
  retirement_time_remaining: retirementTimeRemainingSchema.nullish(),
});

// Admin user schema
export const adminUserSchema = baseUserSchema.extend({
  name: z.string(),
  email_verified_at: z.string().nullable(),
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

// Confirm service number schema (Step 1: Verify service number, file number, IPPIS)
export const confirmServiceNumberSchema = z.object({
  service_no: z
    .string({ error: "Service number is required" })
    .min(1, "Service number is required"),
  file_no: z
    .string({ error: "File number is required" })
    .min(1, "File number is required"),
  ippis: z
    .string({ error: "IPPIS number is required" })
    .min(1, "IPPIS number is required"),
});

export type ConfirmServiceNumberFormData = z.infer<typeof confirmServiceNumberSchema>;

// Set password schema (Step 2: Set password after registration)
export const setPasswordSchema = z
  .object({
    service_no: z.string(),
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_confirmation: z
      .string({ error: "Please confirm your password" })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;
