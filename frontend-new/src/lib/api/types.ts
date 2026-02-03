/**
 * API Types - Shared type definitions for API layer
 */

// Standard API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Paginated response structure (Laravel default pagination)
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
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
