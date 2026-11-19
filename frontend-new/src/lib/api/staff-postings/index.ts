import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffPostingService } from "./staffPostingService";
import type { QueryOptions } from "../types";
import type {
  CompleteStaffPostingDTO,
  CreateStaffPostingDTO,
  StaffPostingFilters,
  UpdateStaffPostingDTO,
} from "./types";

export * from "./types";

export const staffPostingKeys = {
  all: ["staff-postings"] as const,
  lists: () => [...staffPostingKeys.all, "list"] as const,
  list: (filters?: StaffPostingFilters & QueryOptions) =>
    [...staffPostingKeys.lists(), filters] as const,
  details: () => [...staffPostingKeys.all, "detail"] as const,
  detail: (id: number) => [...staffPostingKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated staff postings
 */
export const useStaffPostings = (
  options?: QueryOptions,
  filters?: StaffPostingFilters,
  queryOptions?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: staffPostingKeys.list({ ...options, ...filters }),
    queryFn: () => staffPostingService.getAll(options, filters),
    staleTime: 1000 * 60,
    ...queryOptions,
  });
};

/**
 * Hook to fetch a single staff posting
 */
export const useStaffPosting = (id: number, enabled = true) => {
  return useQuery({
    queryKey: staffPostingKeys.detail(id),
    queryFn: () => staffPostingService.getById(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook to create a staff posting
 */
export const useCreateStaffPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffPostingDTO) =>
      staffPostingService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffPostingKeys.lists() });
    },
  });
};

/**
 * Hook to update a staff posting
 */
export const useUpdateStaffPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStaffPostingDTO }) =>
      staffPostingService.update(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: staffPostingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffPostingKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to complete a staff posting
 */
export const useCompleteStaffPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteStaffPostingDTO }) =>
      staffPostingService.complete(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: staffPostingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffPostingKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to delete a staff posting
 */
export const useDeleteStaffPosting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => staffPostingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffPostingKeys.lists() });
    },
  });
};
