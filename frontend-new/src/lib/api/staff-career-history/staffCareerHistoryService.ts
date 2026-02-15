import { apiClient } from "../apiClient";
import type { ApiResponse } from "../types";
import type {
  CreateCareerHistoryDTO,
  StaffCareerHistory,
} from "./types";

/**
 * Staff Career History Service
 * Handles staff career history API calls
 */
class StaffCareerHistoryService {
  private readonly baseUrl = "/staff";

  /**
   * Get all career history records for a staff member
   */
  async getAll(serviceNo: string): Promise<StaffCareerHistory[]> {
    const response = await apiClient.get<ApiResponse<StaffCareerHistory[]>>(
      `${this.baseUrl}/${serviceNo}/career-history`,
    );
    return response.data.data;
  }

  /**
   * Get a single career history record by ID
   */
  async getById(
    serviceNo: string,
    id: number,
  ): Promise<StaffCareerHistory> {
    const response = await apiClient.get<ApiResponse<StaffCareerHistory>>(
      `${this.baseUrl}/${serviceNo}/career-history/${id}`,
    );
    return response.data.data;
  }

  /**
   * Create a career history record
   */
  async create(
    serviceNo: string,
    data: CreateCareerHistoryDTO,
  ): Promise<StaffCareerHistory> {
    const response = await apiClient.post<ApiResponse<StaffCareerHistory>>(
      `${this.baseUrl}/${serviceNo}/career-history`,
      data,
    );
    return response.data.data;
  }
}

export const staffCareerHistoryService = new StaffCareerHistoryService();
