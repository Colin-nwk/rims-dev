import { Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute, AdminOnlyRoute } from "./guards";
import { ROUTES } from "./constants";

// Auth pages
import AdminLogin from "@/pages/auth/AdminLogin";
import StaffLogin from "@/pages/auth/StaffLogin";
import Register from "@/pages/auth/Register";
import PublicComplaint from "@/pages/auth/Complaint";

// Protected pages
import DashboardRouter from "@/pages/Dashboard/DashboardRouter";
import QualificationsRouter from "@/pages/Qualifications/QualificationsRouter";
import Complaints from "@/pages/Complaints";
import StaffDirectory from "@/pages/staff/StaffDirectory";
import CreateStaffFormPage from "@/pages/staff/CreateStaffFormPage";
import EditStaffFormPage from "@/pages/staff/EditStaffFormPage";
import AdminUsers from "@/pages/AdminUsers";
import Approvals from "@/pages/Approvals";
import Statistics from "@/pages/Statistics";
import RolesPermissions from "@/pages/RolesPermissions";
import Profile from "@/pages/Profile";

// Public pages
import StaffProfile from "@/pages/staff/StaffProfile";
import HealthCheck from "@/pages/HealthCheck";
import NotFound from "@/pages/NotFound";

export const routes = [
  // Public routes - (no auth or redirection required)
  {
    path: "/health",
    element: <HealthCheck />,
  },
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
        path: ROUTES.QUALIFICATIONS,
        element: <QualificationsRouter />,
      },
      {
        path: ROUTES.HELP_DESK,
        element: <Complaints />,
      },
      {
        path: ROUTES.PROFILE,
        element: <Profile />,
      },
      {
        path: ROUTES.PROFILE_EDIT,
        element: <EditStaffFormPage />,
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
            path: ROUTES.STAFF_ADD,
            element: <CreateStaffFormPage />,
          },
          {
            path: ROUTES.STAFF_EDIT,
            element: <EditStaffFormPage />,
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
