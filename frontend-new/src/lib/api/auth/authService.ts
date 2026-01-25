import { apiClient } from "../apiClient";
import type { ApiResponse } from "../types";
import type {
  AdminLoginRequest,
  StaffLoginRequest,
  LoginResponse,
  User,
} from "./types";
import { loginResponseSchema } from "./schemas";

/**
 * Enhanced Authentication Service
 * Handles login, logout, token management, and user state
 * Improved from legacy with better type safety and Zod validation
 */
class AuthService {
  private readonly STORAGE_KEYS = {
    TOKEN: "auth_token",
    USER: "user",
    ROLES: "roles",
    PERMISSIONS: "permissions",
  } as const;

  /**
   * Admin login - authenticates admin user with email/password
   */
  async adminLogin(
    credentials: AdminLoginRequest,
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/user/login",
      credentials,
    );

    // Validate response with Zod
    const validatedData = loginResponseSchema.parse(response.data.data);

    // Store auth data
    this.storeAuthData(validatedData);

    return response.data;
  }

  /**
   * Staff login - authenticates staff user with service number/password
   */
  async staffLogin(
    credentials: StaffLoginRequest,
  ): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/staff/login",
      credentials,
    );

    // Validate response with Zod
    const validatedData = loginResponseSchema.parse(response.data.data);

    // Store auth data
    this.storeAuthData(validatedData);

    return response.data;
  }

  /**
   * Logout - clear auth state and call logout endpoint
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/logout");
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current user from localStorage
   */
  getUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get user roles from localStorage
   */
  getRoles(): string[] {
    try {
      const rolesStr = localStorage.getItem(this.STORAGE_KEYS.ROLES);
      return rolesStr ? JSON.parse(rolesStr) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get user permissions from localStorage
   */
  getPermissions(): string[] {
    try {
      const permsStr = localStorage.getItem(this.STORAGE_KEYS.PERMISSIONS);
      return permsStr ? JSON.parse(permsStr) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get auth token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.every((p) => userPermissions.includes(p));
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some((r) => userRoles.includes(r));
  }

  /**
   * Check if current user is staff
   */
  isStaff(): boolean {
    const user = this.getUser();
    return user ? "service_no" in user : false;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    const user = this.getUser();
    return user ? "name" in user && !("service_no" in user) : false;
  }

  /**
   * Store authentication data in localStorage
   */
  private storeAuthData(data: LoginResponse): void {
    localStorage.setItem(this.STORAGE_KEYS.TOKEN, data.access_token);
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(this.STORAGE_KEYS.ROLES, JSON.stringify(data.roles));
    localStorage.setItem(
      this.STORAGE_KEYS.PERMISSIONS,
      JSON.stringify(data.permissions),
    );
  }

  /**
   * Clear all authentication data from localStorage
   */
  private clearAuthData(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
