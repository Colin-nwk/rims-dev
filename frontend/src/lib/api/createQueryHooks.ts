import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
  keepPreviousData,
} from '@tanstack/react-query';
import { ServiceType } from './createService';
import { ApiResponse, PaginatedResponse, QueryOptions, FilterConfig, ApiError, UploadOptions } from './types';

/**
 * Creates React Query hooks from a service
 */
export function createQueryHooks<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(
  service: ServiceType<T, CreateDTO, UpdateDTO>,
  queryKey: string
) {
  return {
    /**
     * Hook for fetching paginated list with filters
     * Uses keepPreviousData for smooth pagination
     */
    useList: (
      options?: QueryOptions,
      filters?: FilterConfig,
      queryOptions?: Omit<UseQueryOptions<PaginatedResponse<T>, ApiError>, 'queryKey' | 'queryFn'>
    ) => {
      return useQuery<PaginatedResponse<T>, ApiError>({
        queryKey: [queryKey, 'list', options, filters],
        queryFn: () => service.getAll(options, filters),
        placeholderData: keepPreviousData,
        ...queryOptions,
      });
    },

    /**
     * Hook for fetching single item by ID
     */
    useById: (
      id: string | number | undefined,
      queryOptions?: Omit<UseQueryOptions<ApiResponse<T>, ApiError>, 'queryKey' | 'queryFn'>
    ) => {
      return useQuery<ApiResponse<T>, ApiError>({
        queryKey: [queryKey, 'detail', id],
        queryFn: () => service.getById(id!),
        enabled: !!id,
        ...queryOptions,
      });
    },

    /**
     * Hook for creating new item
     */
    useCreate: (
      mutationOptions?: UseMutationOptions<ApiResponse<T>, ApiError, CreateDTO>
    ) => {
      const queryClient = useQueryClient();

      return useMutation<ApiResponse<T>, ApiError, CreateDTO>({
        mutationFn: (data) => service.create(data),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Hook for updating item
     */
    useUpdate: (
      mutationOptions?: UseMutationOptions<ApiResponse<T>, ApiError, { id: string | number; data: UpdateDTO }>
    ) => {
      const queryClient = useQueryClient();

      return useMutation<ApiResponse<T>, ApiError, { id: string | number; data: UpdateDTO }>({
        mutationFn: ({ id, data }) => service.update(id, data),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          queryClient.invalidateQueries({ queryKey: [queryKey, 'detail', variables.id] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Hook for patching item (partial update)
     */
    usePatch: (
      mutationOptions?: UseMutationOptions<ApiResponse<T>, ApiError, { id: string | number; data: Partial<UpdateDTO> }>
    ) => {
      const queryClient = useQueryClient();

      return useMutation<ApiResponse<T>, ApiError, { id: string | number; data: Partial<UpdateDTO> }>({
        mutationFn: ({ id, data }) => service.patch(id, data),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          queryClient.invalidateQueries({ queryKey: [queryKey, 'detail', variables.id] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Hook for deleting item
     */
    useDelete: (
      mutationOptions?: UseMutationOptions<ApiResponse<void>, ApiError, string | number>
    ) => {
      const queryClient = useQueryClient();

      return useMutation<ApiResponse<void>, ApiError, string | number>({
        mutationFn: (id) => service.delete(id),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Hook for uploading file(s)
     */
    useUpload: (
      mutationOptions?: UseMutationOptions<ApiResponse<T>, ApiError, { files: File | File[]; options?: UploadOptions }>
    ) => {
      const queryClient = useQueryClient();

      return useMutation<ApiResponse<T>, ApiError, { files: File | File[]; options?: UploadOptions }>({
        mutationFn: ({ files, options }) => service.upload(files, options),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Hook for uploading file(s) for a specific item
     */
    useUploadForItem: (
      mutationOptions?: UseMutationOptions<
        ApiResponse<T>,
        ApiError,
        { id: string | number; files: File | File[]; options?: UploadOptions }
      >
    ) => {
      const queryClient = useQueryClient();

      return useMutation<
        ApiResponse<T>,
        ApiError,
        { id: string | number; files: File | File[]; options?: UploadOptions }
      >({
        mutationFn: ({ id, files, options }) => service.uploadForItem(id, files, options),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          queryClient.invalidateQueries({ queryKey: [queryKey, 'detail', variables.id] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Hook for creating item with file(s)
     */
    useCreateWithFiles: (
      mutationOptions?: UseMutationOptions<
        ApiResponse<T>,
        ApiError,
        { data: CreateDTO; files: File | File[]; fileFieldName?: string; options?: UploadOptions }
      >
    ) => {
      const queryClient = useQueryClient();

      return useMutation<
        ApiResponse<T>,
        ApiError,
        { data: CreateDTO; files: File | File[]; fileFieldName?: string; options?: UploadOptions }
      >({
        mutationFn: ({ data, files, fileFieldName = 'file', options }) =>
          service.createWithFiles(data, files, fileFieldName, options),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Hook for updating item with file(s)
     */
    useUpdateWithFiles: (
      mutationOptions?: UseMutationOptions<
        ApiResponse<T>,
        ApiError,
        { id: string | number; data: UpdateDTO; files: File | File[]; fileFieldName?: string; options?: UploadOptions }
      >
    ) => {
      const queryClient = useQueryClient();

      return useMutation<
        ApiResponse<T>,
        ApiError,
        { id: string | number; data: UpdateDTO; files: File | File[]; fileFieldName?: string; options?: UploadOptions }
      >({
        mutationFn: ({ id, data, files, fileFieldName = 'file', options }) =>
          service.updateWithFiles(id, data, files, fileFieldName, options),
        onSuccess: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          queryClient.invalidateQueries({ queryKey: [queryKey, 'detail', variables.id] });
        },
        ...mutationOptions,
      });
    },

    /**
     * Get the query key for manual invalidation
     */
    queryKey,
  };
}
