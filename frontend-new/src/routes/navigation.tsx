import { NavItem } from "@/types";
import {
  ChartArea,
  CheckSquare,
  FolderOpen,
  HelpCircle,
  LayoutDashboard,
  Shield,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { ROUTES } from "./constants";

export const mainNavItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: ROUTES.DASHBOARD,
  },
  {
    name: "Qualifications",
    icon: <FolderOpen className="w-5 h-5" />,
    path: ROUTES.QUALIFICATIONS,
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
    adminOnly: true,
  },
  {
    name: "Admin Users Directory",
    icon: <UserCog className="w-5 h-5" />,
    path: ROUTES.ADMIN_USERS_DIRECTORY,
    adminOnly: true,
  },
  {
    name: "Approvals",
    icon: <CheckSquare className="w-5 h-5" />,
    path: ROUTES.APPROVALS,
    adminOnly: true,
  },
  {
    name: "Statistics",
    icon: <ChartArea className="w-5 h-5" />,
    path: ROUTES.STATISTICS,
    adminOnly: true,
  },
];

export const othersNavItems: NavItem[] = [
  {
    name: "Roles & Permissions",
    icon: <Shield className="w-5 h-5" />,
    path: ROUTES.ROLES_PERMISSIONS,
    adminOnly: true,
  },
  {
    name: "Profile",
    icon: <User className="w-5 h-5" />,
    path: ROUTES.PROFILE,
  },
];
