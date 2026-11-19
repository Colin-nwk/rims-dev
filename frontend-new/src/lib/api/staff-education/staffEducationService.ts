import { apiClient } from "../apiClient";
import type { ApiResponse, PaginatedResponse, QueryOptions } from "../types";
import type {
  CreateStaffEducationDTO,
  StaffEducation,
  StaffEducationFilters,
  StaffEducationStats,
  UpdateStaffEducationDTO,
} from "./types";

// Extended paginated response with stats
export interface StaffEducationPaginatedResponse extends PaginatedResponse<StaffEducation> {
  stats: StaffEducationStats;
}

/**
 * Staff Education Service
 * Handles all staff education-related API calls
 */
class StaffEducationService {
  private readonly baseUrl = "/staff-education";

  /**
   * Get paginated list of staff education records with filters
   */
  async getAll(
    options?: QueryOptions,
    filters?: StaffEducationFilters,
  ): Promise<StaffEducationPaginatedResponse> {
    const params = { ...options, ...filters };
    const response = await apiClient.get<{
      data: StaffEducationPaginatedResponse;
    }>(this.baseUrl, { params });
    return response.data.data;
  }

  /**
   * Get single education record by ID
   */
  async getById(id: number): Promise<ApiResponse<StaffEducation>> {
    const response = await apiClient.get<ApiResponse<StaffEducation>>(
      `${this.baseUrl}/${id}`,
    );
    return response.data;
  }

  /**
   * Create new education record
   */
  async create(
    data: CreateStaffEducationDTO,
  ): Promise<ApiResponse<StaffEducation>> {
    const formData = this.toFormData(data);
    const response = await apiClient.post<ApiResponse<StaffEducation>>(
      this.baseUrl,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  }

  /**
   * Update education record
   */
  async update(
    id: number,
    data: UpdateStaffEducationDTO,
  ): Promise<ApiResponse<StaffEducation>> {
    const formData = this.toFormData(data);
    // Laravel doesn't support PUT with multipart, so we use POST with _method
    formData.append("_method", "PUT");
    const response = await apiClient.post<ApiResponse<StaffEducation>>(
      `${this.baseUrl}/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  }

  /**
   * Delete education record
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Convert DTO to FormData for file uploads
   */
  private toFormData(
    data: CreateStaffEducationDTO | UpdateStaffEducationDTO,
  ): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === "string" || typeof value === "number") {
          formData.append(key, value.toString());
        }
      }
    });

    return formData;
  }

  /**
   * Get certificate viewing URL (full API URL)
   */
  getCertificateUrl(id: number): string {
    const baseUrl = import.meta.env.VITE_API_URL;
    return `${baseUrl}${this.baseUrl}/${id}/certificate`;
  }
}

export const staffEducationService = new StaffEducationService();
