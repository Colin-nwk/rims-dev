export interface StaffPostingStaff {
  service_no: string;
  surname: string;
  first_name: string;
  other_names?: string | null;
  photo?: string | null;
  present_rank_name?: string | null;
  initial_rank_name?: string | null;
}

export interface StaffPostingCreator {
  id: number;
  name?: string | null;
  email?: string | null;
  service_no?: string | null;
  surname?: string | null;
  first_name?: string | null;
}

export type StaffPostingStatus = "active" | "completed" | "terminated";

export interface StaffPosting {
  id: number;
  service_no: string;
  type: string;
  station_name: string;
  station_location?: string | null;
  start_date: string;
  end_date?: string | null;
  status: StaffPostingStatus;
  reason?: string | null;
  remarks?: string | null;
  created_by_type?: string | null;
  created_by_id?: number | null;
  created_at: string;
  updated_at: string;
  staff?: StaffPostingStaff | null;
  creator?: StaffPostingCreator | null;
}

export interface StaffPostingFilters {
  service_no?: string;
  type?: string;
  status?: StaffPostingStatus | string;
  station_name?: string;
  search?: string;
  sort?: string;
  sort_dir?: "asc" | "desc";
}

export interface CreateStaffPostingDTO {
  service_no: string;
  type: string;
  station_name: string;
  station_location?: string;
  start_date: string;
  end_date?: string;
  status: StaffPostingStatus;
  reason?: string;
  remarks?: string;
}

export interface UpdateStaffPostingDTO {
  type?: string;
  station_name?: string;
  station_location?: string;
  start_date?: string;
  end_date?: string;
  status?: StaffPostingStatus;
  reason?: string;
  remarks?: string;
}

export interface CompleteStaffPostingDTO {
  end_date?: string;
  remarks?: string;
}

export interface StaffPostingStatusOption {
  value: StaffPostingStatus;
  label: string;
}

export interface StaffPostingTypeOption {
  value: string;
  label: string;
}

export const STAFF_POSTING_STATUS_LABELS: Record<StaffPostingStatus, string> = {
  active: "Active",
  completed: "Completed",
  terminated: "Terminated",
};

export const STAFF_POSTING_STATUS_STYLES: Record<StaffPostingStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-100 text-slate-700",
  terminated: "bg-red-100 text-red-700",
};

export const STAFF_POSTING_STATUS_OPTIONS: StaffPostingStatusOption[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "terminated", label: "Terminated" },
];

export const STAFF_POSTING_TYPE_OPTIONS: StaffPostingTypeOption[] = [
  { value: "", label: "Select Posting Type" },
  { value: "training_school", label: "Training School" },
  { value: "farm_center", label: "Farm Center" },
  { value: "special_assignment", label: "Special Assignment" },
  { value: "other", label: "Other" },
];

export const STAFF_POSTING_TYPE_LABELS: Record<string, string> = {
  farm_center: "Farm Center",
  training_school: "Training School",
  special_assignment: "Special Assignment",
  other: "Other",
};
