import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "../apiClient";
import type { ApiError, ApiResponse } from "../types";
import type { Complaint } from "./types";

/**
 * Related To options for public complaints
 */
export const RELATED_TO_OPTIONS = [
  "Others",
  "Service Number/Name Mismatch",
  "Names Misspelled",
  "Unable To Login",
] as const;

export type RelatedToOption = (typeof RELATED_TO_OPTIONS)[number];

/**
 * Public Complaint Form Data
 */
export interface PublicComplaintFormData {
  first_name: string;
  other_names?: string;
  last_name: string;
  phone_number?: string;
  ippis: string;
  service_no: string;
  email?: string;
  related_to: RelatedToOption;
  subject: string;
  message: string;
}

/**
 * Zod validation schema for public complaint form
 */
export const publicComplaintSchema = z.object({
  first_name: z
    .string({ error: "First name is required" })
    .min(1, "First name is required")
    .max(255, "First name must be less than 255 characters"),
  other_names: z
    .string()
    .max(255, "Other names must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  last_name: z
    .string({ error: "Last name is required" })
    .min(1, "Last name is required")
    .max(255, "Last name must be less than 255 characters"),
  phone_number: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
  ippis: z
    .string({ error: "IPPIS is required" })
    .min(1, "IPPIS is required"),
  service_no: z
    .string({ error: "Service number is required" })
    .min(1, "Service number is required"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  related_to: z.enum(RELATED_TO_OPTIONS, {
    message: "Please select what this complaint is related to",
  }),
  subject: z
    .string({ error: "Subject is required" })
    .min(1, "Subject is required")
    .max(255, "Subject must be less than 255 characters"),
  message: z
    .string({ error: "Message is required" })
    .min(1, "Message is required"),
});

export type PublicComplaintFormSchema = z.infer<typeof publicComplaintSchema>;

/**
 * Submit a public complaint
 */
async function submitPublicComplaint(
  data: PublicComplaintFormData,
): Promise<ApiResponse<Complaint>> {
  const response = await apiClient.post<ApiResponse<Complaint>>(
    "/complaints/public",
    data,
  );
  return response.data;
}

/**
 * Hook to submit a public complaint
 */
export function useSubmitPublicComplaint() {
  return useMutation<ApiResponse<Complaint>, ApiError, PublicComplaintFormData>({
    mutationFn: submitPublicComplaint,
  });
}
