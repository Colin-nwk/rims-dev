import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import type { ApiResponse } from "../types";
import type {
  Role,
  Permission,
  CreateRoleDTO,
  UpdateRoleDTO,
  SyncPermissionsDTO,
  PermissionActionDTO,
} from "./types";

/**
 * Roles Service
 * Handles all role and permission-related API calls
 */
class RolesService {
  private readonly rolesUrl = "/roles";
  private readonly permissionsUrl = "/permissions";

  /**
   * Get all roles with relations
   */
  async getAll(): Promise<Role[]> {
    const response = await apiClient.get<ApiResponse<Role[]>>(this.rolesUrl);
    return response.data.data;
  }

  /**
   * Get single role by ID
   */
  async getById(id: number): Promise<Role> {
    const response = await apiClient.get<ApiResponse<Role>>(
      `${this.rolesUrl}/${id}`,
    );
    return response.data.data;
  }

  /**
   * Create a new role
   */
  async create(data: CreateRoleDTO): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>(
      this.rolesUrl,
      data,
    );
    return response.data.data;
  }

  /**
   * Update an existing role
   */
  async update(id: number, data: UpdateRoleDTO): Promise<Role> {
    const response = await apiClient.put<ApiResponse<Role>>(
      `${this.rolesUrl}/${id}`,
      data,
    );
    return response.data.data;
  }

  /**
   * Delete a role
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.rolesUrl}/${id}`);
  }

  /**
   * Sync all permissions for a role (replace)
   */
  async syncPermissions(
    roleId: number,
    data: SyncPermissionsDTO,
  ): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>(
      `${this.rolesUrl}/${roleId}/permissions/sync`,
      data,
    );
    return response.data.data;
  }

  /**
   * Attach a single permission to a role
   */
  async attachPermission(
    roleId: number,
    data: PermissionActionDTO,
  ): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>(
      `${this.rolesUrl}/${roleId}/permissions/attach`,
      data,
    );
    return response.data.data;
  }

  /**
   * Detach a single permission from a role
   */
  async detachPermission(
    roleId: number,
    data: PermissionActionDTO,
  ): Promise<Role> {
    const response = await apiClient.post<ApiResponse<Role>>(
      `${this.rolesUrl}/${roleId}/permissions/detach`,
      data,
    );
    return response.data.data;
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    const response = await apiClient.get<ApiResponse<Permission[]>>(
      this.permissionsUrl,
    );
    return response.data.data;
  }
}

// Export singleton instance
export const rolesService = new RolesService();

/**
 * React Query Hooks
 */

// Query keys
export const rolesQueryKeys = {
  all: ["roles"] as const,
  lists: () => [...rolesQueryKeys.all, "list"] as const,
  list: () => [...rolesQueryKeys.lists()] as const,
  details: () => [...rolesQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...rolesQueryKeys.details(), id] as const,
  permissions: () => ["permissions"] as const,
};

/**
 * Hook to fetch all roles
 */
export const useRoles = (enabled: boolean = true) => {
  return useQuery({
    queryKey: rolesQueryKeys.list(),
    queryFn: () => rolesService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

/**
 * Hook to fetch single role by ID
 */
export const useRole = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: rolesQueryKeys.detail(id),
    queryFn: () => rolesService.getById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch all permissions
 */
export const usePermissions = (enabled: boolean = true) => {
  return useQuery({
    queryKey: rolesQueryKeys.permissions(),
    queryFn: () => rolesService.getAllPermissions(),
    staleTime: 1000 * 60 * 30, // 30 minutes - permissions don't change often
    enabled,
  });
};

/**
 * Hook to create a role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDTO) => rolesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
};

/**
 * Hook to update a role
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleDTO }) =>
      rolesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolesQueryKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to delete a role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rolesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
};

/**
 * Hook to sync permissions for a role
 */
export const useSyncPermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: number;
      data: SyncPermissionsDTO;
    }) => rolesService.syncPermissions(roleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolesQueryKeys.detail(variables.roleId),
      });
    },
  });
};

/**
 * Hook to attach a permission to a role
 */
export const useAttachPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: number;
      data: PermissionActionDTO;
    }) => rolesService.attachPermission(roleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolesQueryKeys.detail(variables.roleId),
      });
    },
  });
};

/**
 * Hook to detach a permission from a role
 */
export const useDetachPermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: number;
      data: PermissionActionDTO;
    }) => rolesService.detachPermission(roleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolesQueryKeys.detail(variables.roleId),
      });
    },
  });
};
