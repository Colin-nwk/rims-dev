import { apiClient } from './apiClient';
import { ApiResponse, PaginatedResponse, QueryOptions, FilterConfig, UploadOptions } from './types';

/**
 * Builds FormData from data object and files
 */
function buildFormData(
  data: Record<string, unknown>,
  files: File | File[],
  fileFieldName: string
): FormData {
  const formData = new FormData();

  // Append data fields
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}[${index}]`, item);
        } else if (typeof item === 'object') {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        } else {
          formData.append(`${key}[${index}]`, String(item));
        }
      });
    } else if (value instanceof File) {
      formData.append(key, value);
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  // Append files
  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      formData.append(`${fileFieldName}[${index}]`, file);
    });
  } else {
    formData.append(fileFieldName, files);
  }

  return formData;
}

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

    /**
     * Create new item with file(s) - sends as multipart/form-data
     */
    async createWithFiles(
      data: CreateDTO,
      files: File | File[],
      fileFieldName = 'file',
      options?: UploadOptions
    ): Promise<ApiResponse<T>> {
      const formData = buildFormData(data as Record<string, unknown>, files, fileFieldName);

      const response = await apiClient.post<ApiResponse<T>>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: options?.onProgress
          ? (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              options.onProgress!(progress);
            }
          : undefined,
      });
      return response.data;
    },

    /**
     * Update item with file(s) - sends as multipart/form-data
     */
    async updateWithFiles(
      id: string | number,
      data: UpdateDTO,
      files: File | File[],
      fileFieldName = 'file',
      options?: UploadOptions
    ): Promise<ApiResponse<T>> {
      const formData = buildFormData(data as Record<string, unknown>, files, fileFieldName);
      // Laravel/PHP needs _method for PUT with FormData
      formData.append('_method', 'PUT');

      const response = await apiClient.post<ApiResponse<T>>(`${endpoint}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: options?.onProgress
          ? (progressEvent) => {
              const progress = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              options.onProgress!(progress);
            }
          : undefined,
      });
      return response.data;
    },
  };
}

// Type helper for extracting service type
export type ServiceType<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> = ReturnType<
  typeof createService<T, CreateDTO, UpdateDTO>
>;
