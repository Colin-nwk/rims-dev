import { z } from "zod";

/**
 * Change Request Validation Schemas
 * Used with Formik for form validation
 */

// Schema for rejecting a change request
export const rejectRequestSchema = z.object({
  reason: z
    .string()
    .min(1, "Rejection reason is required")
    .min(10, "Please provide a more detailed reason (at least 10 characters)")
    .max(500, "Rejection reason must be less than 500 characters"),
});

export type RejectRequestFormData = z.infer<typeof rejectRequestSchema>;

// Schema for filtering change requests
export const changeRequestFiltersSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  model_type: z.string().optional(),
  service_no: z.string().optional(),
});

export type ChangeRequestFiltersFormData = z.infer<
  typeof changeRequestFiltersSchema
>;
