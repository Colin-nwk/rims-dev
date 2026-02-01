import { useAuth } from "@/hooks/useAuthContext";
import { isStaffUser } from "@/lib/api/auth/types";
import Dashboard from "./Dashboard";
import StaffDashboard from "./StaffDashboard";

/**
 * Dashboard Router Component
 * Renders the appropriate dashboard based on user type
 * - Admin users see the admin Dashboard
 * - Staff users see the StaffDashboard
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  // If user is staff, show staff dashboard
  if (user && isStaffUser(user)) {
    return <StaffDashboard />;
  }

  // Otherwise show admin dashboard
  return <Dashboard />;
}
