import { Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./guards";
import { ROUTES } from "./constants";

// Auth pages
import AdminLogin from "@/pages/auth/AdminLogin";
import StaffLogin from "@/pages/auth/StaffLogin";

// Protected pages
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import StaffDirectory from "@/pages/StaffDirectory";
import AdminUsers from "@/pages/AdminUsers";
import Approvals from "@/pages/Approvals";
import RolesPermissions from "@/pages/RolesPermissions";
import Complaints from "@/pages/Complaints";
import Statistics from "@/pages/Statistics";

// Public pages
import StaffProfile from "@/pages/StaffProfile";

export const routes = [
  // Public route - (no auth or redirection required)
  {
    path: ROUTES.STAFF_PROFILE,
    element: <StaffProfile />,
  },

  // Guest routes - redirect to dashboard if already authenticated
  {
    element: <GuestRoute />,
    children: [
      {
        path: ROUTES.ADMIN_LOGIN,
        element: <AdminLogin />,
      },
      {
        path: ROUTES.STAFF_LOGIN,
        element: <StaffLogin />,
      },
    ],
  },

  // Protected routes - require authentication
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },
      {
        path: ROUTES.DOCUMENTS,
        element: (
          <div className="text-slate-600">Documents page coming soon...</div>
        ),
      },
      {
        path: ROUTES.HELP_DESK,
        element: <Complaints />,
      },
      {
        path: ROUTES.STAFF_DIRECTORY,
        element: <StaffDirectory />,
      },
      {
        path: ROUTES.ADMIN_USERS_DIRECTORY,
        element: <AdminUsers />,
      },
      {
        path: ROUTES.APPROVALS,
        element: <Approvals />,
      },
      {
        path: ROUTES.STATISTICS,
        element: <Statistics />,
      },
      {
        path: ROUTES.ROLES_PERMISSIONS,
        element: <RolesPermissions />,
      },
      {
        path: ROUTES.SETTINGS,
        element: (
          <div className="text-slate-600">Settings page coming soon...</div>
        ),
      },
    ],
  },

  // Default redirect - send to dashboard
  {
    path: "/",
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },

  // 404 Not Found - public route
  {
    path: "*",
    element: <NotFound />,
  },
];
