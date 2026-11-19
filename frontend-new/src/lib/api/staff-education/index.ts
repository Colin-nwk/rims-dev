import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffEducationService, type StaffEducationPaginatedResponse } from "./staffEducationService";
import type { QueryOptions } from "../types";
import type {
  CreateStaffEducationDTO,
  StaffEducationFilters,
  UpdateStaffEducationDTO,
} from "./types";

// Export types
export * from "./types";
export type { StaffEducationPaginatedResponse };

// Query keys
export const staffEducationKeys = {
  all: ["staff-education"] as const,
  lists: () => [...staffEducationKeys.all, "list"] as const,
  list: (filters?: StaffEducationFilters & QueryOptions) =>
    [...staffEducationKeys.lists(), filters] as const,
  details: () => [...staffEducationKeys.all, "detail"] as const,
  detail: (id: number) => [...staffEducationKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of staff education records
 */
export const useStaffEducation = (
  options?: QueryOptions,
  filters?: StaffEducationFilters,
) => {
  return useQuery({
    queryKey: staffEducationKeys.list({ ...options, ...filters }),
    queryFn: () => staffEducationService.getAll(options, filters),
  });
};

/**
 * Hook to fetch single education record by ID
 */
export const useStaffEducationById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: staffEducationKeys.detail(id),
    queryFn: () => staffEducationService.getById(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook to create new education record
 */
export const useCreateStaffEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffEducationDTO) =>
      staffEducationService.create(data),
    onSuccess: () => {
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: staffEducationKeys.lists() });
    },
  });
};

/**
 * Hook to update education record
 */
export const useUpdateStaffEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStaffEducationDTO }) =>
      staffEducationService.update(id, data),
    onSuccess: (_response, variables) => {
      // Invalidate lists and specific detail
      queryClient.invalidateQueries({ queryKey: staffEducationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffEducationKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to delete education record
 */
export const useDeleteStaffEducation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => staffEducationService.delete(id),
    onSuccess: () => {
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: staffEducationKeys.lists() });
    },
  });
};

/**
 * Helper to get certificate viewing URL with full API base URL
 */
export const getCertificateViewUrl = (id: number): string => {
  return staffEducationService.getCertificateUrl(id);
};
