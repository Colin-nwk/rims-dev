/**
 * API Types - Shared type definitions for API layer
 */

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Paginated response structure
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// API Error structure
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

// Query options for list endpoints
export interface QueryOptions {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  [key: string]: string | number | boolean | undefined;
}

// Filter configuration
export interface FilterConfig {
  [key: string]: string | number | boolean | string[] | undefined;
}

// Upload progress callback
export type UploadProgressCallback = (progress: number) => void;

// File upload options
export interface UploadOptions {
  onProgress?: UploadProgressCallback;
  additionalData?: Record<string, string | Blob>;
}
