import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, AuthUser, LoginRequest, LoginResponse } from '../services/authService';
import { ApiResponse, ApiError } from '../lib/api';

const AUTH_QUERY_KEY = 'auth';

/**
 * Hook for checking authentication status and getting current user
 */
export function useAuthUser() {
  return useQuery<ApiResponse<AuthUser>, ApiError>({
    queryKey: [AUTH_QUERY_KEY, 'me'],
    queryFn: () => authService.me(),
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for login mutation
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
