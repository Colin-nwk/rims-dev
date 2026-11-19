import { useCallback, useMemo, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/api/auth/authService";
import { useAuthUser } from "@/hooks/useAuth";
import { AuthContext } from "./context";
import type { AuthContextType } from "./types";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useAuthUser();

  // Re-fetch permissions and roles when user changes (login/logout)
  const permissions = useMemo(
    () => authService.getPermissions(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );
  const roles = useMemo(
    () => authService.getRoles(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user],
  );

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (perms: string[]) => perms.some((p) => permissions.includes(p)),
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (perms: string[]) => perms.every((p) => permissions.includes(p)),
    [permissions],
  );

  const hasRole = useCallback((role: string) => roles.includes(role), [roles]);

  const hasAnyRole = useCallback(
    (r: string[]) => r.some((role) => roles.includes(role)),
    [roles],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    queryClient.clear();
  }, [queryClient]);

  const isAuthenticated = authService.isAuthenticated();
  const isStaff = user ? "service_no" in user : false;
  const isAdmin = user ? "name" in user && !("service_no" in user) : false;

  const value = useMemo<AuthContextType>(
    () => ({
      user: user ?? null,
      isLoading,
      isAuthenticated,
      isStaff,
      isAdmin,
      permissions,
      roles,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      logout,
    }),
    [
      user,
      isLoading,
      isAuthenticated,
      isStaff,
      isAdmin,
      permissions,
      roles,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
