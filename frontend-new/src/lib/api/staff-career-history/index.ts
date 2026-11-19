import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { staffCareerHistoryService } from "./staffCareerHistoryService";
import type { CreateCareerHistoryDTO } from "./types";

export * from "./types";

export const staffCareerHistoryKeys = {
  all: ["staff-career-history"] as const,
  lists: () => [...staffCareerHistoryKeys.all, "list"] as const,
  list: (serviceNo: string) =>
    [...staffCareerHistoryKeys.lists(), serviceNo] as const,
  details: () => [...staffCareerHistoryKeys.all, "detail"] as const,
  detail: (serviceNo: string, id: number) =>
    [...staffCareerHistoryKeys.details(), serviceNo, id] as const,
};

/**
 * Hook to fetch all career history records for a staff member
 */
export const useStaffCareerHistory = (
  serviceNo: string,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: staffCareerHistoryKeys.list(serviceNo),
    queryFn: () => staffCareerHistoryService.getAll(serviceNo),
    enabled: enabled && !!serviceNo,
    staleTime: 1000 * 60 * 1,
  });
};

/**
 * Hook to create a career history record
 */
export const useCreateCareerRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceNo,
      data,
    }: {
      serviceNo: string;
      data: CreateCareerHistoryDTO;
    }) => staffCareerHistoryService.create(serviceNo, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: staffCareerHistoryKeys.list(variables.serviceNo),
      });
    },
  });
};
