import { ReactNode } from "react";

export type NavItem = {
  name: string;
  icon: ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  isButton?: boolean;
  onClick?: () => void;
  className?: string;
  mobileOnly?: boolean;
  adminOnly?: boolean;
  staffOnly?: boolean;
  badge?: number | string;
};

// Staff Career History Types
export type CareerFieldChanged = "present_rank" | "present_command";

export interface StaffCareerHistory {
  id: number;
  service_no: string;
  field_changed: CareerFieldChanged;
  old_value: string | null;
  new_value: string;
  effective_date: string | null;
  reason: string | null;
  changed_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCareerHistoryDTO {
  field_changed: CareerFieldChanged;
  old_value?: string | null;
  new_value: string;
  effective_date?: string | null;
  reason?: string | null;
}