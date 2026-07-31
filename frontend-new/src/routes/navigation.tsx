import { useAuth } from "@/hooks/useAuthContext";
import { isStaffUser } from "@/lib/api/auth/types";
import { useChangeRequests } from "@/lib/api/change-requests";
import { useDashboardStats } from "@/lib/api/dashboard";
import { NavItem } from "@/types";
import {
  ChartArea,
  FileBarChart,
  CheckSquare,
  FolderOpen,
  FolderOpenDot,
  HelpCircle,
  LayoutDashboard,
  MapPin,
  Shield,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { useMemo } from "react";
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
    name: "Personnel Documents",
    icon: <FolderOpenDot className="w-5 h-5" />,
    path: ROUTES.PERSONNEL_DOCUMENTS,
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
    name: "Staff Postings",
    icon: <MapPin className="w-5 h-5" />,
    path: ROUTES.STAFF_POSTINGS,
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
    name: "Change Requests",
    icon: <CheckSquare className="w-5 h-5" />,
    path: ROUTES.CHANGE_REQUESTS,
    staffOnly: true,
  },
  {
    name: "Statistics",
    icon: <ChartArea className="w-5 h-5" />,
    path: ROUTES.STATISTICS,
    adminOnly: true,
  },
  {
    name: "Staff Reports",
    icon: <FileBarChart className="w-5 h-5" />,
    path: ROUTES.STAFF_REPORTS,
    adminOnly: true,
    requiredPermission: "report.view",
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

/**
 * Hook that returns main navigation items with dynamic badge counts
 * - Admin users see total pending count on "Approvals"
 * - Staff users see their own pending count on "Change Requests"
 */
export function useMainNavItems(): NavItem[] {
  const { user } = useAuth();
  const isStaff = user && isStaffUser(user);
  const staffServiceNo = isStaff ? user.service_no : undefined;

  // Admin: fetch dashboard stats for total pending count
  const { data: stats } = useDashboardStats({
    refetchInterval: 60000, // 60 seconds
  });

  // Staff: fetch their own pending change requests
  const { data: staffRequests } = useChangeRequests(
    { per_page: 100 },
    { status: "PENDING", service_no: staffServiceNo },
    { enabled: !!staffServiceNo, refetchInterval: 60000 }, // 60 seconds
  );

  // Admin sees total pending count
  const adminPendingCount = stats?.data?.change_requests?.pending ?? 0;

  // Staff sees only their own pending count
  const staffPendingCount = staffRequests?.total ?? 0;

  return useMemo(() => {
    return mainNavItems.map((item) => {
      // Add badge to Approvals (admin) with total pending count
      if (item.name === "Approvals" && adminPendingCount > 0) {
        return { ...item, badge: adminPendingCount };
      }
      // Add badge to Change Requests (staff) with their own pending count
      if (item.name === "Change Requests" && staffPendingCount > 0) {
        return { ...item, badge: staffPendingCount };
      }
      return item;
    });
  }, [adminPendingCount, staffPendingCount]);
}

/**
 * Hook that returns other navigation items (currently no badges needed)
 */
export function useOthersNavItems(): NavItem[] {
  return othersNavItems;
}
