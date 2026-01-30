import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import type { ApiResponse, PaginatedResponse } from "../types";
import type {
  Complaint,
  CreateComplaintDTO,
  UpdateStatusDTO,
  AddMessageDTO,
  ComplaintFilters,
} from "./types";

/**
 * Complaints Service
 * Handles all complaint-related API calls
 */
class ComplaintsService {
  private readonly baseUrl = "/complaints";

  /**
   * Get all complaints with optional filters
   */
  async getAll(
    filters: ComplaintFilters = {},
    page: number = 1,
    perPage: number = 15,
  ): Promise<PaginatedResponse<Complaint>> {
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.category) params.append("category", filters.category);
    if (filters.priority) params.append("priority", filters.priority);
    if (filters.mine) params.append("mine", "1");
    if (filters.search) params.append("search", filters.search);
    params.append("page", String(page));
    params.append("per_page", String(perPage));

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Complaint>>
    >(`${this.baseUrl}?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Get single complaint by ID
   */
  async getById(id: number): Promise<Complaint> {
    const response = await apiClient.get<ApiResponse<Complaint>>(
      `${this.baseUrl}/${id}`,
    );
    return response.data.data;
  }

  /**
   * Create a new complaint
   */
  async create(data: CreateComplaintDTO): Promise<Complaint> {
    const response = await apiClient.post<ApiResponse<Complaint>>(
      this.baseUrl,
      data,
    );
    return response.data.data;
  }

  /**
   * Update complaint status
   */
  async updateStatus(id: number, data: UpdateStatusDTO): Promise<Complaint> {
    const response = await apiClient.patch<ApiResponse<Complaint>>(
      `${this.baseUrl}/${id}/status`,
      data,
    );
    return response.data.data;
  }

  /**
   * Add message to complaint
   */
  async addMessage(id: number, data: AddMessageDTO): Promise<Complaint> {
    const response = await apiClient.post<ApiResponse<Complaint>>(
      `${this.baseUrl}/${id}/messages`,
      data,
    );
    return response.data.data;
  }

  /**
   * Delete a complaint
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

// Export singleton instance
export const complaintsService = new ComplaintsService();

/**
 * React Query Hooks
 */

// Query keys
export const complaintsQueryKeys = {
  all: ["complaints"] as const,
  lists: () => [...complaintsQueryKeys.all, "list"] as const,
  list: (filters: ComplaintFilters, page: number) =>
    [...complaintsQueryKeys.lists(), filters, page] as const,
  details: () => [...complaintsQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...complaintsQueryKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated complaints
 */
export const useComplaints = (
  filters: ComplaintFilters = {},
  page: number = 1,
  perPage: number = 15,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: complaintsQueryKeys.list(filters, page),
    queryFn: () => complaintsService.getAll(filters, page, perPage),
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });
};

/**
 * Hook to fetch single complaint by ID
 */
export const useComplaint = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: complaintsQueryKeys.detail(id),
    queryFn: () => complaintsService.getById(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 30, // 30 seconds - messages might update frequently
  });
};

/**
 * Hook to create a complaint
 */
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateComplaintDTO) => complaintsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsQueryKeys.all });
    },
  });
};

/**
 * Hook to update complaint status
 */
export const useUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStatusDTO }) =>
      complaintsService.updateStatus(id, data),
    onSuccess: (updatedComplaint) => {
      queryClient.invalidateQueries({ queryKey: complaintsQueryKeys.all });
      queryClient.setQueryData(
        complaintsQueryKeys.detail(updatedComplaint.id),
        updatedComplaint,
      );
    },
  });
};

/**
 * Hook to add a message to a complaint
 */
export const useAddMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddMessageDTO }) =>
      complaintsService.addMessage(id, data),
    onSuccess: (updatedComplaint) => {
      queryClient.invalidateQueries({ queryKey: complaintsQueryKeys.lists() });
      queryClient.setQueryData(
        complaintsQueryKeys.detail(updatedComplaint.id),
        updatedComplaint,
      );
    },
  });
};

/**
 * Hook to delete a complaint
 */
export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => complaintsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintsQueryKeys.all });
    },
  });
};
