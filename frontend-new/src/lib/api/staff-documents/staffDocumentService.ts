import { apiClient } from "../apiClient";
import type { ApiResponse, PaginatedResponse, QueryOptions } from "../types";
import type {
  CreateBulkStaffDocumentsDTO,
  CreateStaffDocumentDTO,
  RejectStaffDocumentDTO,
  StaffDocument,
  StaffDocumentFileResponse,
  StaffDocumentFilters,
  UpdateStaffDocumentDTO,
} from "./types";

const baseUrl = "/staff-documents";

function toFormData(data: object): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      formData.append(key, value.toString());
    }
  });

  return formData;
}

function buildBulkFormData(data: CreateBulkStaffDocumentsDTO): FormData {
  const formData = new FormData();
  formData.append("service_no", data.service_no);

  data.documents.forEach((doc, index) => {
    formData.append(`documents[${index}][document_type]`, doc.document_type);
    formData.append(`documents[${index}][document_name]`, doc.document_name);
    formData.append(`documents[${index}][file]`, doc.file);

    if (doc.notes !== undefined) {
      formData.append(`documents[${index}][notes]`, doc.notes);
    }

    if (doc.expires_at !== undefined) {
      formData.append(`documents[${index}][expires_at]`, doc.expires_at);
    }
  });

  return formData;
}

function getFilenameFromDisposition(
  contentDisposition: string | undefined,
): string | undefined {
  if (!contentDisposition) return undefined;

  const match = contentDisposition.match(
    /filename\*?=(?:UTF-8''|")?([^;"\n]+)/i,
  );
  if (!match?.[1]) return undefined;

  return decodeURIComponent(match[1].replace(/"/g, "").trim());
}

export const staffDocumentService = {
  async getAll(
    options?: QueryOptions,
    filters?: StaffDocumentFilters,
  ): Promise<PaginatedResponse<StaffDocument>> {
    const params = { ...options, ...filters };
    const response = await apiClient.get<{
      data: PaginatedResponse<StaffDocument>;
    }>(baseUrl, { params });
    return response.data.data;
  },

  async getById(id: number): Promise<ApiResponse<StaffDocument>> {
    const response = await apiClient.get<ApiResponse<StaffDocument>>(
      `${baseUrl}/${id}`,
    );
    return response.data;
  },

  async create(
    data: CreateStaffDocumentDTO,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const formData = toFormData(data);
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      baseUrl,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async update(
    id: number,
    data: UpdateStaffDocumentDTO,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const formData = toFormData(data);
    formData.append("_method", "PUT");
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      `${baseUrl}/${id}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${baseUrl}/${id}`);
  },

  async bulkCreate(
    data: CreateBulkStaffDocumentsDTO,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const formData = buildBulkFormData(data);
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      `${baseUrl}/bulk`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  async verify(id: number): Promise<ApiResponse<StaffDocument>> {
    const response = await apiClient.post<ApiResponse<StaffDocument>>(
      `${baseUrl}/${id}/verify`,
    );
    return response.data;
  },

  async reject(
    id: number,
    data: RejectStaffDocumentDTO,
  ): Promise<ApiResponse<StaffDocument>> {
    const response = await apiClient.post<ApiResponse<StaffDocument>>(
      `${baseUrl}/${id}/reject`,
      data,
    );
    return response.data;
  },

  async view(id: number): Promise<StaffDocumentFileResponse> {
    const response = await apiClient.get<Blob>(`${baseUrl}/${id}/view`, {
      responseType: "blob",
    });
    return {
      blob: response.data,
      filename: getFilenameFromDisposition(
        response.headers["content-disposition"],
      ),
      mimeType: response.headers["content-type"],
    };
  },

  async download(id: number): Promise<StaffDocumentFileResponse> {
    const response = await apiClient.get<Blob>(`${baseUrl}/${id}/download`, {
      responseType: "blob",
    });
    return {
      blob: response.data,
      filename: getFilenameFromDisposition(
        response.headers["content-disposition"],
      ),
      mimeType: response.headers["content-type"],
    };
  },
};
