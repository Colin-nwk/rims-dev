import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import type { ApiResponse, PaginatedResponse, QueryOptions } from "../types";
import type {
  AssignRoleDTO,
  ChangeRequestResponse,
  CreateStaffDTO,
  Role,
  Staff,
  StaffFilters,
  StaffIDCardData,
  UpdateStaffDTO,
} from "./types";

/**
 * Staff Service
 * Handles all staff-related API calls
 */
class StaffService {
  private readonly baseUrl = "/staff";

  /**
   * Get paginated list of staff with filters
   */
  async getAll(
    options?: QueryOptions,
    filters?: StaffFilters,
  ): Promise<PaginatedResponse<Staff>> {
    const params = { ...options, ...filters };
    const response = await apiClient.get<{ data: PaginatedResponse<Staff> }>(
      this.baseUrl,
      { params },
    );
    return response.data.data;
  }

  /**
   * Get single staff by service number
   */
  async getByServiceNo(serviceNo: string): Promise<ApiResponse<Staff>> {
    const response = await apiClient.get<ApiResponse<Staff>>(
      `${this.baseUrl}/${serviceNo}`,
    );
    return response.data;
  }

  /**
   * Create new staff (submits change request)
   */
  async create(
    data: CreateStaffDTO,
  ): Promise<ApiResponse<ChangeRequestResponse>> {
    const formData = this.toFormData(data);
    const response = await apiClient.post<ApiResponse<ChangeRequestResponse>>(
      this.baseUrl,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  }

  /**
   * Update staff (submits change request)
   */
  async update(
    serviceNo: string,
    data: UpdateStaffDTO,
  ): Promise<ApiResponse<ChangeRequestResponse>> {
    const formData = this.toFormData(data);
    // Laravel doesn't support PUT with multipart, so we use POST with _method
    formData.append("_method", "PUT");
    const response = await apiClient.post<ApiResponse<ChangeRequestResponse>>(
      `${this.baseUrl}/${serviceNo}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  }

  /**
   * Delete staff
   */
  async delete(serviceNo: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${serviceNo}`);
  }

  /**
   * Get ID card data (public endpoint - no authentication required)
   */
  async getIDCard(serviceNo: string): Promise<ApiResponse<StaffIDCardData>> {
    const response = await apiClient.get<ApiResponse<StaffIDCardData>>(
      `/staff/id-card/${serviceNo}`,
      { withCredentials: false },
    );
    return response.data;
  }

  /**
   * Assign role to staff
   */
  async assignRole(
    serviceNo: string,
    data: AssignRoleDTO,
  ): Promise<ApiResponse<Staff>> {
    const response = await apiClient.post<ApiResponse<Staff>>(
      `${this.baseUrl}/${serviceNo}/roles`,
      data,
    );
    return response.data;
  }

  /**
   * Remove role from staff
   */
  async removeRole(
    serviceNo: string,
    roleId: number,
  ): Promise<ApiResponse<Staff>> {
    const response = await apiClient.delete<ApiResponse<Staff>>(
      `${this.baseUrl}/${serviceNo}/roles/${roleId}`,
    );
    return response.data;
  }

  /**
   * Get all available roles
   */
  async getRoles(): Promise<ApiResponse<Role[]>> {
    const response = await apiClient.get<ApiResponse<Role[]>>("/roles");
    return response.data;
  }

  /**
   * Convert DTO to FormData for file uploads
   */
  private toFormData(data: CreateStaffDTO | UpdateStaffDTO): FormData {
    const formData = new FormData();

    // Helper to convert value to FormData-compatible string
    const toFormValue = (value: unknown): string => {
      if (typeof value === "boolean") {
        // Laravel expects "1" or "0" for boolean fields in FormData
        return value ? "1" : "0";
      }
      return String(value);
    };

    // Handle nested objects and arrays
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "photo" && value instanceof File) {
        formData.append(key, value);
      } else if (key === "details" && typeof value === "object") {
        // Flatten details object
        Object.entries(value).forEach(([detailKey, detailValue]) => {
          if (detailValue !== undefined && detailValue !== null) {
            formData.append(`details[${detailKey}]`, toFormValue(detailValue));
          }
        });
      } else if (key === "education" && Array.isArray(value)) {
        // Flatten education array
        value.forEach((edu, index) => {
          Object.entries(edu).forEach(([eduKey, eduValue]) => {
            if (eduValue !== undefined && eduValue !== null) {
              if (eduKey === "url" && eduValue instanceof File) {
                formData.append(`education[${index}][${eduKey}]`, eduValue);
              } else {
                formData.append(
                  `education[${index}][${eduKey}]`,
                  toFormValue(eduValue),
                );
              }
            }
          });
        });
      } else {
        formData.append(key, toFormValue(value));
      }
    });

    return formData;
  }
}

// Export singleton instance
export const staffService = new StaffService();

/**
 * React Query Hooks
 */

// Query keys
export const staffQueryKeys = {
  all: ["staff"] as const,
  lists: () => [...staffQueryKeys.all, "list"] as const,
  list: (options?: QueryOptions, filters?: StaffFilters) =>
    [...staffQueryKeys.lists(), options, filters] as const,
  details: () => [...staffQueryKeys.all, "detail"] as const,
  detail: (serviceNo: string) =>
    [...staffQueryKeys.details(), serviceNo] as const,
  idCard: (serviceNo: string) =>
    [...staffQueryKeys.all, "idCard", serviceNo] as const,
  roles: () => ["roles"] as const,
};

/**
 * Hook to fetch paginated staff list
 */
export const useStaffList = (
  options?: QueryOptions,
  filters?: StaffFilters,
  queryOptions?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: staffQueryKeys.list(options, filters),
    queryFn: () => staffService.getAll(options, filters),
    staleTime: 1000 * 60 * 1, // 1 minute - reduced for fresher data
    refetchOnWindowFocus: true,
    ...queryOptions,
  });
};

/**
 * Hook to fetch single staff by service number
 */
export const useStaff = (serviceNo: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: staffQueryKeys.detail(serviceNo),
    queryFn: () => staffService.getByServiceNo(serviceNo),
    enabled: enabled && !!serviceNo,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to fetch staff ID card data (public endpoint)
 */
export const useStaffIDCard = (serviceNo: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: staffQueryKeys.idCard(serviceNo),
    queryFn: () => staffService.getIDCard(serviceNo),
    enabled: enabled && !!serviceNo,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};

/**
 * Hook to create staff
 */
export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffDTO) => staffService.create(data),
    onSuccess: () => {
      // Invalidate all staff-related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: staffQueryKeys.all,
        refetchType: "all",
      });
    },
  });
};

/**
 * Hook to update staff
 */
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceNo,
      data,
    }: {
      serviceNo: string;
      data: UpdateStaffDTO;
    }) => staffService.update(serviceNo, data),
    onSuccess: (_, variables) => {
      // Invalidate all staff-related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: staffQueryKeys.all,
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: staffQueryKeys.detail(variables.serviceNo),
      });
    },
  });
};

/**
 * Hook to delete staff
 */
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceNo: string) => staffService.delete(serviceNo),
    onSuccess: () => {
      // Invalidate all staff-related queries to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: staffQueryKeys.all,
        refetchType: "all",
      });
    },
  });
};

/**
 * Hook to assign role to staff
 */
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceNo,
      data,
    }: {
      serviceNo: string;
      data: AssignRoleDTO;
    }) => staffService.assignRole(serviceNo, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffQueryKeys.detail(variables.serviceNo),
      });
    },
  });
};

/**
 * Hook to remove role from staff
 */
export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceNo,
      roleId,
    }: {
      serviceNo: string;
      roleId: number;
    }) => staffService.removeRole(serviceNo, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffQueryKeys.detail(variables.serviceNo),
      });
    },
  });
};

/**
 * Hook to fetch all available roles
 */
export const useRoles = () => {
  return useQuery({
    queryKey: staffQueryKeys.roles(),
    queryFn: () => staffService.getRoles(),
    staleTime: 1000 * 60 * 30, // 30 minutes - roles don't change often
  });
};
