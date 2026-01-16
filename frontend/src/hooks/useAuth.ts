
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLoginRequest, authService, LoginRequest, LoginResponse, StaffUser, AdminUser } from '../services/authService';
import { ApiResponse, ApiError } from '../lib/api';

const AUTH_QUERY_KEY = 'auth';

/**
 * Hook for checking authentication status and getting current user
 */
export function useAuthUser() {
  return useQuery<(StaffUser | AdminUser) | null, ApiError>({
    queryKey: [AUTH_QUERY_KEY, 'user'],
    queryFn: () => authService.getUser(),
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for admin login mutation
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
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<LoginResponse>, ApiError, LoginRequest>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
    },
  });
}

/**
 * Hook for logout mutation
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
 * Hook for checking permissions
 */
export function usePermissions() {
  return useQuery<string[], never>({
    queryKey: [AUTH_QUERY_KEY, 'permissions'],
    queryFn: () => authService.getPermissions(),
    enabled: authService.isAuthenticated(),
    staleTime: Infinity, // Permissions don't change during session
  });
}

/**
 * Hook for checking roles
 */
export function useRoles() {
  return useQuery<string[], never>({
    queryKey: [AUTH_QUERY_KEY, 'roles'],
    queryFn: () => authService.getRoles(),
    enabled: authService.isAuthenticated(),
    staleTime: Infinity, // Roles don't change during session
  });
}

/**
 * Custom hook to check if user has a specific permission
 */
export function useHasPermission(permission: string) {
  const { data: permissions = [] } = usePermissions();
  return permissions.includes(permission);
}

/**
 * Custom hook to check if user has a specific role
 */
export function useHasRole(role: string) {
  const { data: roles = [] } = useRoles();
  return roles.includes(role);
}

/**
 * Custom hook to check if user is staff
 */
export function useIsStaff() {
  const { data: user } = useAuthUser();
  return user ? 'service_no' in user : false;
}

/**
 * Custom hook to check if user is admin
 */
export function useIsAdmin() {
  const { data: user } = useAuthUser();
  return user ? 'name' in user && !('service_no' in user) : false;
}

/**
 * Hook for getting formatted user profile information
 * abstracts away differences between StaffUser and AdminUser
 */
export function useUserProfile() {
  const { data: user, isLoading } = useAuthUser();

  const displayName = authService.getDisplayName(user);
  
  const initials = displayName
    ? displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  return {
    user,
    isLoading,
    displayName,
    initials,
    email: user?.email,
    isStaff: user ? 'service_no' in user : false,
    isAdmin: user ? !('service_no' in user) : false,
  };
}
/*
* ----- TODO: OLD ------*
 * 
*/

// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import { AdminLoginRequest, authService, AuthUser, LoginRequest, LoginResponse } from '../services/authService';
// import { ApiResponse, ApiError } from '../lib/api';

// const AUTH_QUERY_KEY = 'auth';

// /**
//  * Hook for checking authentication status and getting current user
//  */
// export function useAuthUser() {
//   return useQuery<ApiResponse<AuthUser>, ApiError>({
//     queryKey: [AUTH_QUERY_KEY, 'me'],
//     queryFn: () => authService.me(),
//     enabled: authService.isAuthenticated(),
//     retry: false,
//     staleTime: 1000 * 60 * 10, // 10 minutes
//   });
// }

// /**
//  * Hook for login mutation
//  */
// export function useAdminLogin() {
//   const queryClient = useQueryClient();

//   return useMutation<ApiResponse<LoginResponse>, ApiError, AdminLoginRequest>({
//     mutationFn: (credentials) => authService.adminLogin(credentials),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
//     },
//   });
// }

// export function useLogin() {
//   const queryClient = useQueryClient();

//   return useMutation<ApiResponse<LoginResponse>, ApiError, LoginRequest>({
//     mutationFn: (credentials) => authService.login(credentials),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });
//     },
//   });
// }


// /**
//  * Hook for logout mutation
//  */
// export function useLogout() {
//   const queryClient = useQueryClient();

//   return useMutation<void, ApiError>({
//     mutationFn: () => authService.logout(),
//     onSuccess: () => {
//       queryClient.clear();
//     },
//   });
// }