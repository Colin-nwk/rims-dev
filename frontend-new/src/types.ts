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
