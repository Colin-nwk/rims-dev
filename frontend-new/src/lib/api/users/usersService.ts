import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import type { ApiResponse, PaginatedResponse } from "../types";
import type {
  AdminUser,
  CreateUserDTO,
  UpdateUserDTO,
  AssignRoleDTO,
  UserFilters,
} from "./types";

/**
 * Users Service
 * Handles all admin user management API calls
 */
class UsersService {
  private readonly baseUrl = "/user/users";

  /**
   * Get all users with pagination and filters
   */
  async getAll(filters: UserFilters = {}): Promise<PaginatedResponse<AdminUser>> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.per_page) params.append("per_page", String(filters.per_page));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>(
      `${this.baseUrl}?${params.toString()}`
    );
    return response.data.data;
  }

  /**
   * Get a single user by ID
   */
  async getById(id: number): Promise<AdminUser> {
    const response = await apiClient.get<AdminUser>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Create a new user (goes through change request)
   */
  async create(data: CreateUserDTO): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      this.baseUrl,
      data
    );
    return response.data.data;
  }

  /**
   * Update a user (goes through change request)
   */
  async update(id: number, data: UpdateUserDTO): Promise<{ message: string }> {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(
      `${this.baseUrl}/${id}`,
      data
    );
    return response.data.data;
  }

  /**
   * Delete a user
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Assign a role to a user
   */
  async assignRole(userId: number, data: AssignRoleDTO): Promise<AdminUser> {
    const response = await apiClient.post<ApiResponse<AdminUser>>(
      `${this.baseUrl}/${userId}/roles`,
      data
    );
    return response.data.data;
  }

  /**
   * Remove a role from a user
   */
  async removeRole(userId: number, roleId: number): Promise<AdminUser> {
    const response = await apiClient.delete<ApiResponse<AdminUser>>(
      `${this.baseUrl}/${userId}/roles/${roleId}`
    );
    return response.data.data;
  }
}

// Export singleton instance
export const usersService = new UsersService();

/**
 * React Query Keys
 */
export const usersQueryKeys = {
  all: ["users"] as const,
  lists: () => [...usersQueryKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...usersQueryKeys.lists(), filters] as const,
  details: () => [...usersQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...usersQueryKeys.details(), id] as const,
};

/**
 * React Query Hooks
 */

// Hook to fetch paginated users
export const useUsers = (filters: UserFilters = {}, enabled: boolean = true) => {
  return useQuery({
    queryKey: usersQueryKeys.list(filters),
    queryFn: () => usersService.getAll(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
};

// Hook to fetch a single user
export const useUser = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: usersQueryKeys.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: enabled && !!id,
  });
};

// Hook to create a user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDTO) => usersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDTO }) =>
      usersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};

// Hook to delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
};

// Hook to assign a role to a user
export const useAssignUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      usersService.assignRole(userId, { role_id: roleId }),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      queryClient.setQueryData(usersQueryKeys.detail(updatedUser.id), updatedUser);
    },
  });
};

// Hook to remove a role from a user
export const useRemoveUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      usersService.removeRole(userId, roleId),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
      queryClient.setQueryData(usersQueryKeys.detail(updatedUser.id), updatedUser);
    },
  });
};
