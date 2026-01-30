/**
 * Complaints API Types
 * Matching backend Complaint and ComplaintMessage model structures
 */

// Category enum values
export const COMPLAINT_CATEGORIES = [
  "Payroll",
  "Leave",
  "Workplace",
  "IT",
  "Other",
] as const;
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

// Priority enum values
export const COMPLAINT_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;
export type ComplaintPriority = (typeof COMPLAINT_PRIORITIES)[number];

// Status enum values
export const COMPLAINT_STATUSES = [
  "open",
  "in-progress",
  "resolved",
  "escalated",
] as const;
export type ComplaintStatus = (typeof COMPLAINT_STATUSES)[number];

// Complaint Message Model
export interface ComplaintMessage {
  id: number;
  complaint_id: number;
  sender_id: number;
  sender_type: string;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  // Appended attributes
  sender_name: string;
  sender_role: string;
  timestamp: string;
}

// Creator info (Staff who created the complaint)
export interface ComplaintCreator {
  id: number;
  service_no: string;
  surname: string;
  first_name: string;
  other_names?: string;
  email?: string;
  photo?: string;
}

// Main Complaint Model
export interface Complaint {
  id: number;
  subject: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  created_by: number;
  created_by_name: string;
  creator?: ComplaintCreator;
  messages: ComplaintMessage[];
  created_at: string;
  updated_at: string;
}

// DTO for creating a complaint
export interface CreateComplaintDTO {
  subject: string;
  category: ComplaintCategory;
  priority?: ComplaintPriority;
}

// DTO for updating complaint status
export interface UpdateStatusDTO {
  status: ComplaintStatus;
}

// DTO for adding a message
export interface AddMessageDTO {
  content: string;
  is_internal?: boolean;
}

// Filters for querying complaints
export interface ComplaintFilters {
  status?: ComplaintStatus | string;
  category?: ComplaintCategory | string;
  priority?: ComplaintPriority | string;
  mine?: boolean;
  search?: string;
}

// Helper to get priority color class
export function getComplaintPriorityColor(priority: ComplaintPriority): string {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-700 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "medium":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "low":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

// Helper to get status color class
export function getComplaintStatusColor(status: ComplaintStatus): string {
  switch (status) {
    case "open":
      return "bg-emerald-100 text-emerald-700";
    case "in-progress":
      return "bg-blue-100 text-blue-700";
    case "resolved":
      return "bg-slate-100 text-slate-500";
    case "escalated":
      return "bg-red-100 text-red-700 font-semibold";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// Helper to get category icon/color
export function getComplaintCategoryColor(category: ComplaintCategory): string {
  switch (category) {
    case "Payroll":
      return "bg-green-100 text-green-700";
    case "Leave":
      return "bg-purple-100 text-purple-700";
    case "Workplace":
      return "bg-amber-100 text-amber-700";
    case "IT":
      return "bg-cyan-100 text-cyan-700";
    case "Other":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// Helper to format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
