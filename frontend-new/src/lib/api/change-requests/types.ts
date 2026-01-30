/**
 * Change Request API Types
 * Matching backend ChangeRequest model structure
 */

// Request type enum values
export const REQUEST_TYPES = ["CREATE", "UPDATE"] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

// Request status enum values
export const REQUEST_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

// Requester info (polymorphic - can be User or Staff)
export interface Requester {
  id: number;
  name?: string;
  email?: string;
  service_no?: string;
  surname?: string;
  first_name?: string;
}

// Approver info
export interface Approver {
  id: number;
  name: string;
  email?: string;
}

// Main ChangeRequest Model
export interface ChangeRequest {
  id: number;
  model_type: string; // e.g., "App\\Models\\Staff"
  model_id: number | null; // Null for CREATE requests
  service_no: string | null; // Reference identifier
  type: RequestType; // CREATE or UPDATE
  data: Record<string, unknown>; // JSON data with proposed changes
  status: RequestStatus; // PENDING, APPROVED, REJECTED
  requested_by_id: number | null;
  requested_by_type: string | null; // e.g., "App\\Models\\User" or "App\\Models\\Staff"
  requested_by?: Requester | null; // Eager loaded relationship
  approved_by: number | null;
  approver?: Approver | null; // Eager loaded relationship
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

// Filters for querying change requests
export interface ChangeRequestFilters {
  status?: RequestStatus | string;
  type?: RequestType | string;
  model_type?: string;
  service_no?: string;
}

// DTO for rejecting a request
export interface RejectRequestDTO {
  reason: string;
}

// Response type for approve/reject actions
export interface ChangeRequestActionResponse {
  id: number;
  status: RequestStatus;
  message?: string;
}

// Helper to get friendly model name from model_type
export function getModelName(modelType: string): string {
  const parts = modelType.split("\\");
  return parts[parts.length - 1] || modelType;
}

// Helper to get status color class
export function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-800";
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

// Helper to get type color class
export function getTypeColor(type: RequestType): string {
  switch (type) {
    case "CREATE":
      return "bg-blue-100 text-blue-800";
    case "UPDATE":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}
