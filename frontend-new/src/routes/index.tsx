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
        path: ROUTES.POLICIES,
        element: (
          <div className="text-slate-600">Policies page coming soon...</div>
        ),
      },
      {
        path: ROUTES.DOCUMENTS,
        element: (
          <div className="text-slate-600">Documents page coming soon...</div>
        ),
      },
      {
        path: ROUTES.HELP_DESK,
        element: (
          <div className="text-slate-600">Help Desk page coming soon...</div>
        ),
      },
      {
        path: ROUTES.STAFF_DIRECTORY,
        element: <StaffDirectory />,
      },
      {
        path: ROUTES.APPROVALS,
        element: (
          <div className="text-slate-600">Approvals page coming soon...</div>
        ),
      },
      {
        path: ROUTES.ROLES_PERMISSIONS,
        element: (
          <div className="text-slate-600">
            Roles & Permissions page coming soon...
          </div>
        ),
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
