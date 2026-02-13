import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffDocumentService } from "./staffDocumentService";
import type { QueryOptions } from "../types";
import { changeRequestQueryKeys } from "../change-requests";
import { dashboardQueryKeys } from "../dashboard";
import type {
  CreateBulkStaffDocumentsDTO,
  CreateStaffDocumentDTO,
  RejectStaffDocumentDTO,
  StaffDocumentFilters,
  UpdateStaffDocumentDTO,
} from "./types";

export * from "./types";
export { staffDocumentService } from "./staffDocumentService";

export const staffDocumentKeys = {
  all: ["staff-documents"] as const,
  lists: () => [...staffDocumentKeys.all, "list"] as const,
  list: (filters?: StaffDocumentFilters & QueryOptions) =>
    [...staffDocumentKeys.lists(), filters] as const,
  details: () => [...staffDocumentKeys.all, "detail"] as const,
  detail: (id: number) => [...staffDocumentKeys.details(), id] as const,
};

export const useStaffDocuments = (
  options?: QueryOptions,
  filters?: StaffDocumentFilters,
) => {
  return useQuery({
    queryKey: staffDocumentKeys.list({ ...options, ...filters }),
    queryFn: () => staffDocumentService.getAll(options, filters),
  });
};

export const useStaffDocumentById = (id: number, enabled = true) => {
  return useQuery({
    queryKey: staffDocumentKeys.detail(id),
    queryFn: () => staffDocumentService.getById(id),
    enabled: enabled && !!id,
  });
};

export const useCreateStaffDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffDocumentDTO) =>
      staffDocumentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffDocumentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: changeRequestQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useUpdateStaffDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStaffDocumentDTO }) =>
      staffDocumentService.update(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: staffDocumentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffDocumentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: changeRequestQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useDeleteStaffDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => staffDocumentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffDocumentKeys.lists() });
    },
  });
};

export const useBulkCreateStaffDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBulkStaffDocumentsDTO) =>
      staffDocumentService.bulkCreate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffDocumentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: changeRequestQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all });
    },
  });
};

export const useVerifyStaffDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => staffDocumentService.verify(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: staffDocumentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffDocumentKeys.detail(id) });
    },
  });
};

export const useRejectStaffDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectStaffDocumentDTO }) =>
      staffDocumentService.reject(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: staffDocumentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: staffDocumentKeys.detail(variables.id),
      });
    },
  });
};

export const useViewStaffDocument = () => {
  return useMutation({
    mutationFn: (id: number) => staffDocumentService.view(id),
  });
};

export const useDownloadStaffDocument = () => {
  return useMutation({
    mutationFn: (id: number) => staffDocumentService.download(id),
  });
};
