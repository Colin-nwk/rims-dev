// Roles & Permissions API exports
export {
  rolesService,
  rolesQueryKeys,
  useRoles,
  useRole,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useSyncPermissions,
  useAttachPermission,
  useDetachPermission,
} from "./rolesService";

export type {
  Role,
  Permission,
  Prison,
  State,
  Zone,
  CreateRoleDTO,
  UpdateRoleDTO,
  SyncPermissionsDTO,
  PermissionActionDTO,
  PermissionGroup,
} from "./types";

export { groupPermissions, getScopeDescription, generateSlug } from "./types";

export {
  createRoleSchema,
  editRoleFormSchema,
  updateRoleSchema,
  syncPermissionsSchema,
  permissionActionSchema,
} from "./schemas";

export type {
  CreateRoleFormData,
  EditRoleFormData,
  UpdateRoleFormData,
  SyncPermissionsFormData,
  PermissionActionFormData,
} from "./schemas";
