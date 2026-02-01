/**
 * Roles & Permissions API Types
 * Matching backend Role and Permission model structures
 */

// Prison reference (for scope)
export interface Prison {
  id: number;
  name: string;
  state_id?: number;
}

// State reference (for scope)
export interface State {
  id: number;
  name: string;
  zone_id?: number;
}

// Zone reference (for scope)
export interface Zone {
  id: number;
  name: string;
}

// Permission Model
export interface Permission {
  id: number;
  name: string;
  description: string | null;
  group: string | null;
  created_at?: string;
  updated_at?: string;
}

// Role Model with relations
export interface Role {
  id: number;
  name: string;
  slug: string;
  prison_id: number | null;
  state_id: number | null;
  zone_id: number | null;
  scopeless: boolean;
  permissions: Permission[];
  prison?: Prison | null;
  state?: State | null;
  zone?: Zone | null;
  created_at?: string;
  updated_at?: string;
}

// Create Role DTO
export interface CreateRoleDTO {
  name: string;
  slug: string;
  prison_id?: number | null;
  state_id?: number | null;
  zone_id?: number | null;
  scopeless?: boolean;
  permissions?: number[];
}

// Update Role DTO
export interface UpdateRoleDTO {
  name?: string;
  slug?: string;
  prison_id?: number | null;
  state_id?: number | null;
  zone_id?: number | null;
  scopeless?: boolean;
  permissions?: number[];
}

// Sync Permissions DTO
export interface SyncPermissionsDTO {
  permissions: number[];
}

// Attach/Detach Permission DTO
export interface PermissionActionDTO {
  permission_id: number;
}

// Grouped permissions for UI display
export interface PermissionGroup {
  group: string;
  permissions: Permission[];
}

// Helper to group permissions by their group field
export function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const grouped = permissions.reduce(
    (acc, perm) => {
      const groupName = perm.group || "Other";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  return Object.entries(grouped)
    .map(([group, perms]) => ({
      group,
      permissions: perms.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

// Helper to get scope description
export function getScopeDescription(role: Role): string {
  if (role.scopeless) {
    return "Full Access (Scopeless)";
  }
  const scopes: string[] = [];
  if (role.zone) scopes.push(`Zone: ${role.zone.name}`);
  if (role.state) scopes.push(`State: ${role.state.name}`);
  if (role.prison) scopes.push(`Custodial Center: ${role.prison.name}`);
  return scopes.length > 0 ? scopes.join(" • ") : "No scope defined";
}

// Helper to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
