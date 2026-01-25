import { NavItem } from "@/types";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  HelpCircle,
  Users,
  CheckSquare,
  Shield,
  Settings as SettingsIcon
} from "lucide-react";
import { ROUTES } from "./constants";

export const mainNavItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: ROUTES.DASHBOARD,
  },
  {
    name: "Policies",
    icon: <FileText className="w-5 h-5" />,
    path: ROUTES.POLICIES,
  },
  {
    name: "Documents",
    icon: <FolderOpen className="w-5 h-5" />,
    path: ROUTES.DOCUMENTS,
  },
  {
    name: "Help Desk",
    icon: <HelpCircle className="w-5 h-5" />,
    path: ROUTES.HELP_DESK,
  },
  {
    name: "Staff Directory",
    icon: <Users className="w-5 h-5" />,
    path: ROUTES.STAFF_DIRECTORY,
  },
  {
    name: "Approvals",
    icon: <CheckSquare className="w-5 h-5" />,
    path: ROUTES.APPROVALS,
  },
];

export const othersNavItems: NavItem[] = [
  {
    name: "Roles & Permissions",
    icon: <Shield className="w-5 h-5" />,
    path: ROUTES.ROLES_PERMISSIONS,
  },
  {
    name: "Settings",
    icon: <SettingsIcon className="w-5 h-5" />,
    path: ROUTES.SETTINGS,
  },
];
