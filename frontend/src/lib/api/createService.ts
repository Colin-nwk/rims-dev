import { apiClient } from './apiClient';
import { ApiResponse, PaginatedResponse, QueryOptions, FilterConfig, UploadOptions } from './types';

/**
 * Creates a reusable service with CRUD operations for a given endpoint
 */
export function createService<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>>(endpoint: string) {
  const buildQueryString = (options?: QueryOptions, filters?: FilterConfig): string => {
    const params = new URLSearchParams();

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(`${key}[]`, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  return {
    /**
     * Get paginated list with optional filters
     */
    async getAll(options?: QueryOptions, filters?: FilterConfig): Promise<PaginatedResponse<T>> {
      const queryString = buildQueryString(options, filters);
      const response = await apiClient.get<PaginatedResponse<T>>(`${endpoint}${queryString}`);
      return response.data;
    },

    /**
     * Get single item by ID
     */
    async getById(id: string | number): Promise<ApiResponse<T>> {
      const response = await apiClient.get<ApiResponse<T>>(`${endpoint}/${id}`);
      return response.data;
    },

    /**
     * Create new item
     */
    async create(data: CreateDTO): Promise<ApiResponse<T>> {
      const response = await apiClient.post<ApiResponse<T>>(endpoint, data);
      return response.data;
    },

    /**
     * Update existing item
     */
    async update(id: string | number, data: UpdateDTO): Promise<ApiResponse<T>> {
      const response = await apiClient.put<ApiResponse<T>>(`${endpoint}/${id}`, data);
      return response.data;
    },

    /**
     * Patch existing item (partial update)
     */
    async patch(id: string | number, data: Partial<UpdateDTO>): Promise<ApiResponse<T>> {
      const response = await apiClient.patch<ApiResponse<T>>(`${endpoint}/${id}`, data);
      return response.data;
    },

    /**
     * Delete item
     */
    async delete(id: string | number): Promise<ApiResponse<void>> {
      const response = await apiClient.delete<ApiResponse<void>>(`${endpoint}/${id}`);
      return response.data;
    },

    /**
     * Upload file(s) with optional additional data
     */
    async upload(
      files: File | File[],
      options?: UploadOptions,
      customEndpoint?: string
    ): Promise<ApiResponse<T>> {
      const formData = new FormData();

      if (Array.isArray(files)) {
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
      } else {
        formData.append('file', files);
      }

      if (options?.additionalData) {
        Object.entries(options.additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await apiClient.post<ApiResponse<T>>(
        customEndpoint || `${endpoint}/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: options?.onProgress
            ? (progressEvent) => {
                const progress = progressEvent.total
                  ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                  : 0;
                options.onProgress!(progress);
              }
            : undefined,
        }
      );
      return response.data;
    },

    /**
     * Upload file(s) for a specific item
     */
    async uploadForItem(
      id: string | number,
      files: File | File[],
      options?: UploadOptions
    ): Promise<ApiResponse<T>> {
      return this.upload(files, options, `${endpoint}/${id}/upload`);
    },
  };
}

// Type helper for extracting service type
export type ServiceType<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> = ReturnType<
  typeof createService<T, CreateDTO, UpdateDTO>
>;
