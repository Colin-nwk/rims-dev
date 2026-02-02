import { z } from "zod";

/**
 * Staff Education Types & Schemas
 */

// Staff Education entity
export interface StaffEducation {
  id: number;
  service_no: string;
  institution: string;
  course: string | null;
  type: string;
  start_date: string;
  end_date: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
  staff?: {
    service_no: string;
    surname: string;
    first_name: string;
    other_names: string | null;
    photo: string | null;
    present_rank: string;
  };
}

// Stats from the API
export interface StaffEducationStats {
  with_certificate: number;
  without_certificate: number;
}

// Filter options
export interface StaffEducationFilters {
  service_no?: string;
  institution?: string;
  course?: string;
  type?: string;
  start_date_from?: string;
  start_date_to?: string;
  end_date_from?: string;
  end_date_to?: string;
  search?: string;
  sort_by?: string;
  sort_direction?: "asc" | "desc";
}

// Create DTO
export interface CreateStaffEducationDTO {
  service_no: string;
  institution: string;
  course?: string;
  type: string;
  start_date: string;
  end_date?: string;
  url?: File;
}

// Update DTO
export interface UpdateStaffEducationDTO {
  service_no?: string;
  institution?: string;
  course?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  url?: File;
}

// Form data types
export type CreateStaffEducationFormData = Omit<CreateStaffEducationDTO, "url"> & {
  url?: File;
};

export type UpdateStaffEducationFormData = Omit<UpdateStaffEducationDTO, "url"> & {
  url?: File;
};

// Helper for required string fields
const requiredString = (fieldName: string) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be text`,
    })
    .min(1, `${fieldName} is required`);

// Helper for optional string fields (allows empty strings)
const optionalString = () =>
  z.union([z.string(), z.literal(""), z.undefined()]).optional();

// File validation helper
const fileValidation = z
  .instanceof(File, { message: "Please upload a valid file" })
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    "File size must be less than 5MB",
  )
  .refine(
    (file) =>
      ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(
        file.type,
      ),
    "File must be PDF, JPG, JPEG, or PNG format",
  )
  .optional();

// Zod validation schemas
export const createStaffEducationSchema = z.object({
  service_no: requiredString("Service number"),
  institution: requiredString("Institution name"),
  course: optionalString(),
  type: requiredString("Education type"),
  start_date: requiredString("Start date"),
  end_date: optionalString(),
  url: fileValidation,
});

export const updateStaffEducationSchema = z.object({
  service_no: optionalString(),
  institution: requiredString("Institution name"),
  course: optionalString(),
  type: requiredString("Education type"),
  start_date: requiredString("Start date"),
  end_date: optionalString(),
  url: fileValidation,
});

// Helper functions
export const getEducationTypeColor = (): string => {
  return "bg-violet-100 text-violet-700";
};

export const formatDateRange = (
  startDate: string,
  endDate: string | null,
): string => {
  const start = new Date(startDate).getFullYear();
  const end = endDate ? new Date(endDate).getFullYear() : "Present";
  return `${start} - ${end}`;
};
