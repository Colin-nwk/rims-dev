import { z } from "zod";

const staffDocumentTypes = [
  "birth_certificate",
  "confirmation_certificate",
  "national_id",
  "passport",
  "appointment_letter",
  "promotion_letter",
  "transfer_letter",
  "other",
] as const;

export type StaffDocumentStatus = "pending" | "verified" | "rejected";
export type StaffDocumentType = (typeof staffDocumentTypes)[number];

export interface StaffDocumentStaff {
  service_no: string;
  surname: string;
  first_name: string;
  other_names: string | null;
  photo: string | null;
  present_rank: number | string | null;
  initial_rank: number | string | null;
  present_rank_name: string | null;
  initial_rank_name: string | null;
}

export interface StaffDocumentVerifier {
  id: number;
  name?: string | null;
  email?: string | null;
  surname?: string | null;
  first_name?: string | null;
  other_names?: string | null;
  service_no?: string | null;
}

export interface StaffDocument {
  id: number;
  service_no: string;
  document_type: StaffDocumentType;
  document_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  verification_status: StaffDocumentStatus;
  verifier_id: number | null;
  verifier_type: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  staff?: StaffDocumentStaff;
  verifier?: StaffDocumentVerifier | null;
}

export interface StaffDocumentFilters {
  service_no?: string;
  document_type?: StaffDocumentType;
  verification_status?: StaffDocumentStatus;
  search?: string;
  expires_at_from?: string;
  expires_at_to?: string;
}

export interface CreateStaffDocumentDTO {
  service_no: string;
  document_type: StaffDocumentType;
  document_name: string;
  file: File;
  notes?: string;
  expires_at?: string;
}

export interface UpdateStaffDocumentDTO {
  service_no?: string;
  document_type?: StaffDocumentType;
  document_name?: string;
  file?: File;
  notes?: string;
  expires_at?: string;
}

export interface StaffDocumentBulkItemDTO {
  document_type: StaffDocumentType;
  document_name: string;
  file: File;
  notes?: string;
  expires_at?: string;
}

export interface CreateBulkStaffDocumentsDTO {
  service_no: string;
  documents: StaffDocumentBulkItemDTO[];
}

export interface RejectStaffDocumentDTO {
  reason: string;
}

export interface StaffDocumentStatusOption {
  value: StaffDocumentStatus;
  label: string;
}

export interface StaffDocumentTypeOption {
  value: StaffDocumentType;
  label: string;
}

export interface StaffDocumentFileResponse {
  blob: Blob;
  filename?: string;
  mimeType?: string;
}

export interface CreateStaffDocumentFormData {
  service_no: string;
  document_type: StaffDocumentType | "";
  document_name: string;
  file?: File;
  notes?: string;
  expires_at?: string;
}

export interface UpdateStaffDocumentFormData {
  service_no?: string;
  document_type?: StaffDocumentType | "";
  document_name?: string;
  file?: File;
  notes?: string;
  expires_at?: string;
}

export interface BulkStaffDocumentFormItem {
  document_type: StaffDocumentType | "";
  document_name: string;
  notes?: string;
  expires_at?: string;
  file?: File;
}

export const STAFF_DOCUMENT_STATUS_LABELS: Record<StaffDocumentStatus, string> =
  {
    pending: "Pending",
    verified: "Verified",
    rejected: "Rejected",
  };

export const STAFF_DOCUMENT_STATUS_STYLES: Record<StaffDocumentStatus, string> =
  {
    pending: "bg-amber-100 text-amber-800",
    verified: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

export const STAFF_DOCUMENT_TYPE_LABELS: Record<StaffDocumentType, string> = {
  birth_certificate: "Birth Certificate",
  confirmation_certificate: "Confirmation Certificate",
  national_id: "National ID",
  passport: "Passport",
  appointment_letter: "Appointment Letter",
  promotion_letter: "Promotion Letter",
  transfer_letter: "Transfer Letter",
  other: "Other",
};

export const STAFF_DOCUMENT_STATUS_OPTIONS: StaffDocumentStatusOption[] = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

export const STAFF_DOCUMENT_TYPE_OPTIONS: StaffDocumentTypeOption[] = [
  { value: "birth_certificate", label: "Birth Certificate" },
  { value: "confirmation_certificate", label: "Confirmation Certificate" },
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "appointment_letter", label: "Appointment Letter" },
  { value: "promotion_letter", label: "Promotion Letter" },
  { value: "transfer_letter", label: "Transfer Letter" },
  { value: "other", label: "Other" },
];

export interface StaffDocumentTypeSelectEntry {
  key: string;
  value: string;
  label: string;
}

/**
 * Dropdown options from {@link STAFF_DOCUMENT_TYPE_OPTIONS}, plus `initialDocumentType`
 * when it is missing from that list (older records/API values).
 */
export function getStaffDocumentTypeSelectEntries(
  initialDocumentType?: string | null,
): StaffDocumentTypeSelectEntry[] {
  const entries: StaffDocumentTypeSelectEntry[] =
    STAFF_DOCUMENT_TYPE_OPTIONS.map((o) => ({
      key: o.value,
      value: o.value,
      label: o.label,
    }));
  const valueSet = new Set(
    STAFF_DOCUMENT_TYPE_OPTIONS.map((o) => o.value.trim()),
  );
  const raw = initialDocumentType ?? "";
  const initialTrimmed = raw.trim();
  if (initialTrimmed.length > 0 && !valueSet.has(initialTrimmed)) {
    entries.push({
      key: `legacy-document-type-${raw}`,
      value: raw,
      label: raw,
    });
  }
  return entries;
}

function requiredString(fieldName: string) {
  return z
    .string({
      error: `${fieldName} is required`,
    })
    .min(1, `${fieldName} is required`);
}

function optionalString() {
  return z.union([z.string(), z.literal(""), z.undefined()]).optional();
}

function createFileValidation(maxSizeMb: number) {
  const maxSize = maxSizeMb * 1024 * 1024;
  return z
    .instanceof(File, { message: "Please upload a valid file" })
    .refine(
      (file) => file.size <= maxSize,
      `File size must be less than ${maxSizeMb}MB`,
    )
    .refine(
      (file) =>
        ["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(
          file.type,
        ),
      "File must be PDF, JPG, JPEG, or PNG format",
    );
}

const createFileSchema = createFileValidation(5);
const updateFileSchema = createFileValidation(10).optional();

export const createStaffDocumentSchema = z.object({
  service_no: requiredString("Service number"),
  document_type: z.enum(staffDocumentTypes, {
    message: "Document type is required",
  }),
  document_name: requiredString("Document name"),
  file: createFileSchema,
  notes: optionalString(),
  expires_at: optionalString(),
});

export const updateStaffDocumentSchema = z.object({
  service_no: optionalString(),
  document_type: z.enum(staffDocumentTypes).optional(),
  document_name: optionalString(),
  file: updateFileSchema,
  notes: optionalString(),
  expires_at: optionalString(),
});

export const bulkStaffDocumentSchema = z.object({
  service_no: requiredString("Service number"),
  documents: z
    .array(
      z.object({
        document_type: z.enum(staffDocumentTypes, {
          message: "Document type is required",
        }),
        document_name: requiredString("Document name"),
        file: createFileSchema,
        notes: optionalString(),
        expires_at: optionalString(),
      }),
    )
    .min(1, "At least one document is required")
    .max(10, "Maximum of 10 documents allowed"),
});

export const rejectStaffDocumentSchema = z.object({
  reason: requiredString("Rejection reason")
    .min(3, "Rejection reason must be at least 3 characters")
    .max(1000),
});

export function getStaffDocumentStatusLabel(
  status: StaffDocumentStatus,
): string {
  return STAFF_DOCUMENT_STATUS_LABELS[status];
}

export function getStaffDocumentStatusStyle(
  status: StaffDocumentStatus,
): string {
  return STAFF_DOCUMENT_STATUS_STYLES[status];
}

export function getStaffDocumentTypeLabel(type: StaffDocumentType): string {
  return STAFF_DOCUMENT_TYPE_LABELS[type];
}
