import { Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute, AdminOnlyRoute } from "./guards";
import { ROUTES } from "./constants";

// Auth pages
import AdminLogin from "@/pages/auth/AdminLogin";
import StaffLogin from "@/pages/auth/StaffLogin";
import Register from "@/pages/auth/Register";
import PublicComplaint from "@/pages/auth/Complaint";

// Protected pages
import DashboardRouter from "@/pages/DashboardRouter";
import NotFound from "@/pages/NotFound";
import StaffDirectory from "@/pages/StaffDirectory";
import AdminUsers from "@/pages/AdminUsers";
import Approvals from "@/pages/Approvals";
import RolesPermissions from "@/pages/RolesPermissions";
import Complaints from "@/pages/Complaints";
import Statistics from "@/pages/Statistics";
import Profile from "@/pages/Profile";

// Public pages
import StaffProfile from "@/pages/StaffProfile";

export const routes = [
  // Public routes - (no auth or redirection required)
  {
    path: ROUTES.STAFF_PROFILE,
    element: <StaffProfile />,
  },
  {
    path: ROUTES.PUBLIC_COMPLAINT,
    element: <PublicComplaint />,
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
      {
        path: ROUTES.CONFIRM_SERVICE_NUMBER,
        element: <Register />,
      },
    ],
  },

  // Protected routes - require authentication
  {
    element: <ProtectedRoute />,
    children: [
      // Dashboard - renders appropriate dashboard based on user type
      {
        path: ROUTES.DASHBOARD,
        element: <DashboardRouter />,
      },
      // Routes accessible to all authenticated users
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
        path: ROUTES.PROFILE,
        element: <Profile />,
      },
      // Admin-only routes - staff users will be redirected to dashboard
      {
        element: <AdminOnlyRoute />,
        children: [
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
        ],
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
