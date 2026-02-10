import { z } from "zod";

/**
 * Roles & Permissions Validation Schemas
 * Used with Formik for form validation
 */

// Slug pattern - lowercase letters, numbers, and hyphens
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Create Role Schema
export const createRoleSchema = z.object({
  name: z
    .string({ error: "Role name is required" })
    .min(1, "Role name is required")
    .min(2, "Role name must be at least 2 characters")
    .max(255, "Role name must be less than 255 characters"),
  slug: z
    .string({ error: "Slug is required" })
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(
      slugPattern,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  prison_id: z.number().int().positive().nullable().optional(),
  state_id: z.number().int().positive().nullable().optional(),
  zone_id: z.number().int().positive().nullable().optional(),
  scopeless: z.boolean().optional().default(false),
  permissions: z.array(z.number().int().positive()).optional().default([]),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;

// Update Role Schema (all fields optional)
export const updateRoleSchema = z.object({
  name: z
    .string({ error: "Role name is required" })
    .min(2, "Role name must be at least 2 characters")
    .max(255, "Role name must be less than 255 characters")
    .optional(),
  slug: z
    .string({ error: "Slug is required" })
    .max(255, "Slug must be less than 255 characters")
    .regex(
      slugPattern,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
  prison_id: z.number().int().positive().nullable().optional(),
  state_id: z.number().int().positive().nullable().optional(),
  zone_id: z.number().int().positive().nullable().optional(),
  scopeless: z.boolean().optional(),
  permissions: z.array(z.number().int().positive()).optional(),
});

export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

// Permission Sync Schema
export const syncPermissionsSchema = z.object({
  permissions: z
    .array(z.number().int().positive())
    .min(0, "Permissions array is required"),
});

export type SyncPermissionsFormData = z.infer<typeof syncPermissionsSchema>;

// Permission Action Schema (attach/detach)
export const permissionActionSchema = z.object({
  permission_id: z.number().int().positive("Please select a valid permission"),
});

export type PermissionActionFormData = z.infer<typeof permissionActionSchema>;
