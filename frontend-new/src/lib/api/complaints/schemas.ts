import { z } from "zod";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_PRIORITIES,
  COMPLAINT_STATUSES,
} from "./types";

/**
 * Schema for creating a new complaint
 */
export const createComplaintSchema = z.object({
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(255, "Subject must be less than 255 characters"),
  category: z.enum(COMPLAINT_CATEGORIES, {
    message: "Please select a valid category",
  }),
  priority: z.enum(COMPLAINT_PRIORITIES).optional().default("medium"),
});

export type CreateComplaintFormData = z.infer<typeof createComplaintSchema>;

/**
 * Schema for updating complaint status
 */
export const updateStatusSchema = z.object({
  status: z.enum(COMPLAINT_STATUSES, {
    message: "Please select a valid status",
  }),
});

export type UpdateStatusFormData = z.infer<typeof updateStatusSchema>;

/**
 * Schema for adding a message to a complaint
 */
export const addMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
  is_internal: z.boolean().optional().default(false),
});

export type AddMessageFormData = z.infer<typeof addMessageSchema>;
