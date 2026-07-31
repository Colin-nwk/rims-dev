import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "../apiClient";
import type {
  StaffReportOptions,
  StaffReportRequest,
  StaffReportResponse,
  StaffReportRow,
} from "./types";

type DataEnvelope<T> = { data: T };

export const staffReportKeys = {
  all: ["staff-reports"] as const,
  options: () => [...staffReportKeys.all, "options"] as const,
  query: (request: StaffReportRequest) =>
    [...staffReportKeys.all, "query", request] as const,
  detail: (serviceNo: string) =>
    [...staffReportKeys.all, "detail", serviceNo] as const,
};

export function useStaffReportOptions() {
  return useQuery({
    queryKey: staffReportKeys.options(),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<DataEnvelope<StaffReportOptions>>(
        "/staff-report-options",
        { signal },
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useStaffReport(request: StaffReportRequest, enabled = true) {
  return useQuery({
    queryKey: staffReportKeys.query(request),
    queryFn: async ({ signal }) => {
      const response = await apiClient.post<StaffReportResponse>(
        "/staff-reports/query",
        request,
        { signal },
      );
      return response.data;
    },
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30 * 1000,
  });
}

export function useStaffReportDetail(serviceNo?: string) {
  return useQuery({
    queryKey: staffReportKeys.detail(serviceNo ?? ""),
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<DataEnvelope<StaffReportRow>>(
        `/staff-reports/${serviceNo}`,
        { signal },
      );
      return response.data.data;
    },
    enabled: Boolean(serviceNo),
    staleTime: 30 * 1000,
  });
}

export function useExportStaffReport() {
  return useMutation({
    mutationFn: async ({
      request,
      columns,
    }: {
      request: StaffReportRequest;
      columns: string[];
    }) => {
      const response = await apiClient.post<Blob>(
        "/staff-reports/export",
        { ...request, format: "csv", columns, file_name: "staff-report" },
        { responseType: "blob" },
      );
      return response.data;
    },
  });
}
