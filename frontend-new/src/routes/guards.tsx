import { useAuth } from "@/hooks/useAuthContext";
import MainLayout from "@/layouts/MainLayout";
import { isAdminUser, isStaffUser } from "@/lib/api/auth/types";
import { NavItem } from "@/types";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "./constants";
import { useMainNavItems, useOthersNavItems } from "./navigation";

/**
 * Loading spinner component for auth state transitions
 */
function AuthLoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 rounded-full border-ncos-green-200 animate-spin border-t-ncos-green-900" />
        <p className="text-sm text-slate-600">Verifying authentication...</p>
      </div>
    </div>
  );
}

/**
 * Unauthorized access component
 */
function UnauthorizedAccess() {
  const { logout } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          Access Denied
        </h2>
        <p className="mb-6 text-slate-600">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is an error.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm font-medium transition-colors rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200"
          >
            Go Back
          </button>
          <button
            onClick={() => logout()}
            className="px-4 py-2 text-sm font-medium text-white transition-colors rounded-md bg-ncos-green-900 hover:bg-ncos-green-800"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  /** Path to redirect to if not authenticated */
  redirectTo?: string;
  /** Roles that are allowed to access this route */
  allowedRoles?: string[];
  /** Permissions required to access this route (user needs ANY of these) */
  requiredPermissions?: string[];
  /** If true, user needs ALL permissions instead of ANY */
  requireAllPermissions?: boolean;
  /** Custom children instead of Outlet */
  children?: React.ReactNode;
}

/**
 * Protected Route Guard
 * Redirects to login if not authenticated
 * Supports role and permission-based access control
 */
export function ProtectedRoute({
  redirectTo = "/staff-login",
  allowedRoles,
  requiredPermissions,
  requireAllPermissions = false,
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const {
    user,
    isAuthenticated,
    isLoading,
    hasAnyRole,
    hasAnyPermission,
    hasAllPermissions,
  } = useAuth();

  // Get navigation items with dynamic badges (must be called before any returns)
  const mainNavItems = useMainNavItems();
  const othersNavItems = useOthersNavItems();

  // Filter navigation items based on user type
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    if (!user) return items;
    if (isStaffUser(user)) {
      // Staff users only see non-admin items
      return items.filter((item) => !item.adminOnly);
    }
    // Admin users see all items except staff only
    return items.filter((item) => !item.staffOnly);
  };

  const filteredMainNav = filterNavItems(mainNavItems);
  const filteredOthersNav = filterNavItems(othersNavItems);

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasAnyRole(allowedRoles)) {
      return <UnauthorizedAccess />;
    }
  }

  // Check permission-based access
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasAccess = requireAllPermissions
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return <UnauthorizedAccess />;
    }
  }

  // Render children or Outlet wrapped with MainLayout
  return (
    <MainLayout navItems={filteredMainNav} othersItems={filteredOthersNav}>
      {children ? children : <Outlet />}
    </MainLayout>
  );
}

interface GuestRouteProps {
  /** Path to redirect to if already authenticated */
  redirectTo?: string;
  /** Custom children instead of Outlet */
  children?: React.ReactNode;
}

/**
 * Guest Route Guard
 * Redirects authenticated users away from guest-only pages (login, register, etc.)
 */
export function GuestRoute({
  redirectTo = "/dashboard",
  children,
}: GuestRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // Redirect authenticated users to dashboard or their intended destination
  if (isAuthenticated) {
    // Check if there's a saved location to return to
    const from = (location.state as { from?: Location })?.from?.pathname;
    return <Navigate to={from || redirectTo} replace />;
  }

  // Render children or Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}

interface AdminOnlyRouteProps {
  /** Path to redirect staff users to */
  redirectTo?: string;
  /** Custom children instead of Outlet */
  children?: React.ReactNode;
}

/**
 * Admin Only Route Guard
 * Redirects staff users to dashboard - admin pages only
 */
export function AdminOnlyRoute({
  redirectTo = ROUTES.DASHBOARD,
  children,
}: AdminOnlyRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // If user is staff, redirect to dashboard
  if (user && isStaffUser(user)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children or Outlet for admin users
  return children ? <>{children}</> : <Outlet />;
}

interface StaffOnlyRouteProps {
  /** Path to redirect admin users to */
  redirectTo?: string;
  /** Custom children instead of Outlet */
  children?: React.ReactNode;
}

/**
 * Staff Only Route Guard
 * Redirects admin users to admin dashboard - staff pages only
 */
export function StaffOnlyRoute({
  redirectTo = ROUTES.DASHBOARD,
  children,
}: StaffOnlyRouteProps) {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <AuthLoadingSpinner />;
  }

  // If user is admin, redirect to admin dashboard
  if (user && isAdminUser(user)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children or Outlet for staff users
  return children ? <>{children}</> : <Outlet />;
}
