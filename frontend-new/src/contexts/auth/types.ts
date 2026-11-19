import type { User } from "@/lib/api/auth/types";

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  permissions: string[];
  roles: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  logout: () => Promise<void>;
}
