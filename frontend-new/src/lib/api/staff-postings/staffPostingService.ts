import { apiClient } from "../apiClient";
import type { ApiResponse, PaginatedResponse, QueryOptions } from "../types";
import type { ChangeRequest } from "../change-requests";
import type {
  CompleteStaffPostingDTO,
  CreateStaffPostingDTO,
  StaffPosting,
  StaffPostingFilters,
  UpdateStaffPostingDTO,
} from "./types";

/**
 * Staff Posting Service
 * Handles staff posting API calls
 */
class StaffPostingService {
  private readonly baseUrl = "/staff-postings";

  /**
   * Get paginated list of staff postings with filters
   */
  async getAll(
    options?: QueryOptions,
    filters?: StaffPostingFilters,
  ): Promise<PaginatedResponse<StaffPosting>> {
    const params = { ...options, ...filters };
    const response = await apiClient.get<{
      data: PaginatedResponse<StaffPosting>;
    }>(this.baseUrl, { params });
    return response.data.data;
  }

  /**
   * Get a single staff posting by ID
   */
  async getById(id: number): Promise<ApiResponse<StaffPosting>> {
    const response = await apiClient.get<ApiResponse<StaffPosting>>(
      `${this.baseUrl}/${id}`,
    );
    return response.data;
  }

  /**
   * Create a staff posting (submits change request)
   */
  async create(
    data: CreateStaffPostingDTO,
  ): Promise<ApiResponse<ChangeRequest>> {
    const response = await apiClient.post<ApiResponse<ChangeRequest>>(
      this.baseUrl,
      data,
    );
    return response.data;
  }

  /**
   * Update a staff posting (submits change request)
   */
  async update(
    id: number,
    data: UpdateStaffPostingDTO,
  ): Promise<ApiResponse<ChangeRequest>> {
    const response = await apiClient.put<ApiResponse<ChangeRequest>>(
      `${this.baseUrl}/${id}`,
      data,
    );
    return response.data;
  }

  /**
   * Mark a posting as completed
   */
  async complete(
    id: number,
    data: CompleteStaffPostingDTO,
  ): Promise<ApiResponse<StaffPosting>> {
    const response = await apiClient.post<ApiResponse<StaffPosting>>(
      `${this.baseUrl}/${id}/complete`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a staff posting
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const staffPostingService = new StaffPostingService();
