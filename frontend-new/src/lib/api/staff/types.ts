/**
 * Staff API Types
 * Matching backend Staff model structure
 */

// Staff Detail (nested relationship)
export interface StaffDetail {
  nin?: string;
  bvn?: string;
  place_of_birth?: string;
  contact_address?: string;
  permanent_home_address?: string;
  height?: string;
  blood_group?: string;
  genotype?: string;
  complexion?: string;
  hair_colour?: string;
  is_deformed?: boolean;
  deformity?: string;
  is_convicted?: boolean;
  previous_convictions?: string;
  pfa_name?: string;
  pension_pin?: string;
  ippis?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  next_of_kin_relationship?: string;
  next_of_kin_address?: string;
  marital_status?: string;
  spouse_name?: string;
  spouse_phone?: string;
  number_of_children?: number;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

// Staff Education (nested relationship)
export interface StaffEducation {
  id?: number;
  service_no?: string;
  institution: string;
  course?: string;
  type: string; // Primary, Secondary, Tertiary, Professional, Other
  start_date: string;
  end_date?: string;
  url?: string; // Certificate URL
}

// Main Staff Model
export interface Staff {
  id: number;
  service_no: string;
  surname: string;
  first_name: string;
  other_names?: string;
  email?: string;
  phone_number?: string;
  sex?: string;
  photo?: string;

  // Work Information
  department?: string;
  duty?: string;
  present_rank?: string;
  initial_rank?: string;
  level?: number;
  step?: string;
  assigned_state?: string;
  prison?: string;
  zone_id?: number;

  // Dates
  dob?: string;
  date_of_first_appointment?: string;
  present_appointment_date?: string;
  command_post_date?: string;

  // Location
  state_of_origin?: string;
  lga?: string;
  initial_command?: string;
  present_command?: string;

  // Administrative
  file_no?: string;
  ippis?: string;
  description?: string;
  status: number; // 1 = active, 0 = inactive
  is_verified?: boolean;
  last_login?: string;

  // Nested relationships
  details?: StaffDetail;
  education?: StaffEducation[];
  roles?: Role[];

  // Computed fields
  retirement_date_formatted?: string;
  is_retired?: boolean;
  retirement_time_remaining?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// Create Staff DTO
export interface CreateStaffDTO {
  service_no: string;
  surname: string;
  first_name: string;
  other_names?: string;
  email?: string;
  phone_number?: string;
  sex?: string;
  status: number;

  // Work
  department?: string;
  duty?: string;
  present_rank?: string;
  initial_rank?: string;
  level?: number;
  step?: string;
  assigned_state?: string;
  prison?: string;

  // Dates
  dob?: string;
  date_of_first_appointment?: string;
  present_appointment_date?: string;
  command_post_date?: string;

  // Location
  state_of_origin?: string;
  lga?: string;
  initial_command?: string;
  present_command?: string;

  // Administrative
  file_no?: string;
  ippis?: string;
  description?: string;
  is_verified?: boolean;

  // Nested
  details?: Partial<StaffDetail>;
  education?: Partial<StaffEducation>[];

  // File upload
  photo?: File;
}

// Update Staff DTO
export interface UpdateStaffDTO {
  service_no?: string;
  surname?: string;
  first_name?: string;
  other_names?: string;
  email?: string;
  phone_number?: string;
  sex?: string;
  status?: number;

  department?: string;
  duty?: string;
  present_rank?: string;
  initial_rank?: string;
  level?: number;
  step?: string;
  assigned_state?: string;
  prison?: string;

  dob?: string;
  date_of_first_appointment?: string;
  present_appointment_date?: string;
  command_post_date?: string;

  state_of_origin?: string;
  lga?: string;
  initial_command?: string;
  present_command?: string;

  file_no?: string;
  ippis?: string;
  description?: string;
  is_verified?: boolean;

  details?: Partial<StaffDetail>;
  education?: Partial<StaffEducation>[];

  photo?: File;
}

// ID Card Data
export interface StaffIDCardData {
  service_no: string;
  ippis?: string;
  surname: string;
  first_name: string;
  other_names?: string;
  present_rank?: string;
  dob?: string;
  photo?: string;
  status: number;
  sex?: string;
  assigned_state_name?: string;
}

// Role type
export interface Role {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

// Role Assignment
export interface AssignRoleDTO {
  role_id: number;
}

// Staff filters for list query
export interface StaffFilters {
  status?: number | string;
  assigned_state?: string;
  prison?: string;
  sex?: string;
  initial_rank?: string;
  present_rank?: string;
  level?: number;
  department?: string;
  zone_id?: number;
}

// Change Request Response (returned when creating/updating staff)
export interface ChangeRequestResponse {
  id: number;
  request_type: "create" | "update" | "delete";
  status: "pending" | "approved" | "rejected";
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}