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
  /** If true, this menu item is only visible to admin users */
  adminOnly?: boolean;
};
