import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth/authService";
import type {
  AdminLoginRequest,
  StaffLoginRequest,
  LoginResponse,
  User,
} from "@/lib/api/auth/types";
import { getDisplayName, getUserInitials } from "@/lib/api/auth/types";
import type { ApiResponse, ApiError } from "@/lib/api/types";

/**
 * React Query Hooks for Authentication
 * Enhanced from legacy with better type inference and error handling
 */

const AUTH_QUERY_KEY = "auth";

/**
 * Hook for getting current authenticated user
 * Only runs if user is authenticated
 */
export function useAuthUser() {
  return useQuery<User | null, ApiError>({
    queryKey: [AUTH_QUERY_KEY, "user"],
    queryFn: () => authService.getUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for admin login mutation
 * Invalidates auth queries on success
 */
export function useAdminLogin() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<LoginResponse>, ApiError, AdminLoginRequest>({
    mutationFn: (credentials) => authService.adminLogin(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
    },
  });
}

/**
 * Hook for staff login mutation
 * Invalidates auth queries on success
 */
export function useStaffLogin() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<LoginResponse>, ApiError, StaffLoginRequest>({
    mutationFn: (credentials) => authService.staffLogin(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
    },
  });
}

/**
 * Hook for logout mutation
 * Clears all query cache on success
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError>({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

/**
 * Hook for getting user permissions
 * Only runs if user is authenticated
 */
export function usePermissions() {
  return useQuery<string[], never>({
    queryKey: [AUTH_QUERY_KEY, "permissions"],
    queryFn: () => authService.getPermissions(),
    enabled: authService.isAuthenticated(),
    staleTime: Infinity, // Permissions don't change during session
  });
}

/**
 * Hook for getting user roles
 * Only runs if user is authenticated
 */
export function useRoles() {
  return useQuery<string[], never>({
    queryKey: [AUTH_QUERY_KEY, "roles"],
    queryFn: () => authService.getRoles(),
    enabled: authService.isAuthenticated(),
    staleTime: Infinity, // Roles don't change during session
  });
}

/**
 * Hook to check if user has specific permission
 */
export function useHasPermission(permission: string): boolean {
  const { data: permissions = [] } = usePermissions();
  return permissions.includes(permission);
}

/**
 * Hook to check if user has any of the specified permissions
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const { data: userPermissions = [] } = usePermissions();
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(role: string): boolean {
  const { data: roles = [] } = useRoles();
  return roles.includes(role);
}

/**
 * Hook to check if user has any of the specified roles
 */
export function useHasAnyRole(roles: string[]): boolean {
  const { data: userRoles = [] } = useRoles();
  return roles.some((r) => userRoles.includes(r));
}

/**
 * Hook to check if current user is staff
 */
export function useIsStaff(): boolean {
  const { data: user } = useAuthUser();
  return user ? "service_no" in user : false;
}

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
  const { data: user } = useAuthUser();
  return user ? "name" in user && !("service_no" in user) : false;
}

/**
 * Enhanced hook for user profile with computed values
 * Returns formatted display name, initials, and role information
 */
export function useUserProfile() {
  const { data: user, isLoading } = useAuthUser();

  const displayName = getDisplayName(user);
  const initials = getUserInitials(user);

  return {
    user,
    isLoading,
    displayName,
    initials,
    email: user?.email,
    isStaff: user ? "service_no" in user : false,
    isAdmin: user ? "name" in user && !("service_no" in user) : false,
  };
}
