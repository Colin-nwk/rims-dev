/**
 * Staff module exports
 * Centralized export point for all staff-related code
 */

export {
  staffService,
  staffQueryKeys,
  useStaffList,
  useStaff,
  useStaffIDCard,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  useAssignRole,
  useRemoveRole,
  useRoles,
} from "./staffService";

export * from "./types";
export * from "./schemas";
