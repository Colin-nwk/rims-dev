export type ReportOption = {
  id: number | string;
  name: string;
  state_id?: number;
  zone_id?: number;
};

export type StaffReportCriteria = {
  search?: string;
  statuses?: number[];
  staff_status_ids?: number[];
  sex?: string[];
  directorate_ids?: number[];
  work_distribution_ids?: number[];
  training_institute_ids?: number[];
  rank_ids?: number[];
  levels?: number[];
  zone_ids?: number[];
  state_ids?: number[];
  prison_ids?: number[];
  departments?: string[];
  appointment_date?: { from?: string; to?: string };
  has_email?: boolean;
  has_photo?: boolean;
  never_logged_in?: boolean;
};

export type StaffReportRequest = {
  criteria: StaffReportCriteria;
  include: ("summary" | "details")[];
  page: { number: number; size: number };
  sort: { field: string; direction: "asc" | "desc" }[];
};

export type Breakdown = { label: string; count: number }[];

export type StaffReportSummary = {
  total_staff: number;
  active_staff: number;
  inactive_staff: number;
  verified_staff: number;
  with_roles: number;
  never_logged_in: number;
  by_status: Breakdown;
  by_gender: Breakdown;
  by_department: Breakdown;
  by_level: Breakdown;
  by_staff_status: Breakdown;
  by_rank: Breakdown;
  by_directorate: Breakdown;
  by_state: Breakdown;
  data_completeness: Record<string, number>;
};

export type StaffReportRow = {
  id: string;
  identity: {
    service_no: string;
    full_name: string;
    surname: string;
    first_name: string;
    other_names?: string;
    sex?: string;
    work_email?: string;
    phone_number?: string;
    photo?: string;
    date_of_birth?: string;
    state_of_origin?: string;
    lga?: string;
  };
  employment: {
    account_status: "active" | "inactive" | "suspended";
    staff_status?: string;
    first_appointment_date?: string;
    present_rank?: string;
    initial_rank?: string;
    level?: number;
    step?: string;
    duty?: string;
    present_appointment_date?: string;
    verified: boolean;
  };
  organization: {
    department?: string;
    directorate?: string;
    work_distribution?: string;
    training_institute?: string;
  };
  location: { state?: string; prison?: string; station?: string };
  account: { last_login?: string; roles: string[] };
  education?: Array<{
    id: number;
    institution: string;
    course?: string;
    type: string;
    start_date?: string;
    end_date?: string;
  }>;
  active_posting?: {
    type: string;
    station_name: string;
    station_location?: string;
    start_date: string;
  };
};

export type StaffReportResponse = {
  data: {
    summary?: StaffReportSummary;
    details?: {
      rows: StaffReportRow[];
      pagination: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
        from: number | null;
        to: number | null;
      };
    };
  };
  meta: {
    scope: string;
    generated_at: string;
    contract_version: string;
  };
};

export type StaffReportColumn = {
  key: string;
  label: string;
  category: string;
  default: boolean;
};

export type StaffReportOptions = {
  statuses: ReportOption[];
  sex: ReportOption[];
  departments: ReportOption[];
  levels: ReportOption[];
  staff_statuses: ReportOption[];
  directorates: ReportOption[];
  work_distributions: ReportOption[];
  training_institutes: ReportOption[];
  rankings: ReportOption[];
  zones: ReportOption[];
  states: ReportOption[];
  prisons: ReportOption[];
  columns: StaffReportColumn[];
  formats: ReportOption[];
};
