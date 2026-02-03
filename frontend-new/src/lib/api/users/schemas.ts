/**
 * Users Schemas
 * Zod validation schemas for user forms
 */

import { z } from "zod";

// Schema for creating a new user
export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name must be less than 255 characters"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(255, "Email must be less than 255 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

// Schema for updating a user (with optional password change)
export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(255, "Name must be less than 255 characters")
      .optional(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(255, "Email must be less than 255 characters")
      .optional(),
    status: z.enum(["active", "inactive", "suspended"]).optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .optional()
      .or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // If password is provided, confirmation must match
      if (data.password && data.password.length > 0) {
        return data.password === data.password_confirmation;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["password_confirmation"],
    }
  )
  .refine(
    (data) => {
      // If password is provided, it must meet requirements (already validated above)
      // If password_confirmation is provided without password, that's an error
      if (
        data.password_confirmation &&
        data.password_confirmation.length > 0 &&
        (!data.password || data.password.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please enter a password first",
      path: ["password"],
    }
  );

// Schema for assigning a role
export const assignRoleSchema = z.object({
  role_id: z.number().positive("Please select a valid role"),
});

// Form data types inferred from schemas
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type AssignRoleFormData = z.infer<typeof assignRoleSchema>;
