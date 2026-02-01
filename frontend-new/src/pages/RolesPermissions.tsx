import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  RolesTable,
  RoleFormModal,
  PermissionsModal,
  DeleteRoleModal,
} from "@/components/roles";
import {
  type Role,
  type CreateRoleFormData,
  useRoles,
  usePermissions,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useSyncPermissions,
} from "@/lib/api/roles";
import { RefreshCw, Plus, Shield, Search } from "lucide-react";

const RolesPermissions = () => {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected role state
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // API hooks
  const { data: roles = [], isLoading, isFetching, refetch } = useRoles();
  const { data: permissions = [] } = usePermissions();

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();
  const syncPermissions = useSyncPermissions();

  // Filter roles by search term
  const filteredRoles = roles.filter((role) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      role.name.toLowerCase().includes(term) ||
      role.slug.toLowerCase().includes(term)
    );
  });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedRole(null);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsModalOpen(true);
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedRole(null);
    setIsEditMode(false);
  };

  const handlePermissionsModalClose = () => {
    setIsPermissionsModalOpen(false);
    setSelectedRole(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  };

  // Form submit handler
  const handleFormSubmit = (data: CreateRoleFormData) => {
    if (isEditMode && selectedRole) {
      // Update existing role
      updateRole.mutate(
        { id: selectedRole.id, data },
        {
          onSuccess: () => {
            toast.success("Role updated successfully");
            handleFormModalClose();
          },
          onError: (error) => {
            toast.error(error?.message || "Failed to update role");
          },
        },
      );
    } else {
      // Create new role
      createRole.mutate(data, {
        onSuccess: () => {
          toast.success("Role created successfully");
          handleFormModalClose();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to create role");
        },
      });
    }
  };

  // Permissions save handler
  const handlePermissionsSave = (permissionIds: number[]) => {
    if (!selectedRole) return;

    syncPermissions.mutate(
      { roleId: selectedRole.id, data: { permissions: permissionIds } },
      {
        onSuccess: () => {
          toast.success("Permissions updated successfully");
          handlePermissionsModalClose();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to update permissions");
        },
      },
    );
  };

  // Delete confirm handler
  const handleDeleteConfirm = () => {
    if (!selectedRole) return;

    deleteRole.mutate(selectedRole.id, {
      onSuccess: () => {
        toast.success("Role deleted successfully");
        handleDeleteModalClose();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete role");
      },
    });
  };

  return (
    <div className="">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Access Control
              </h1>
              <p className="mt-1 text-slate-600">
                Configure system roles and granular security permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Role
              </Button>
            </div>
          </div>
        </div>

        {/* Stats & Search Bar */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-ncos-green-600" />
              <span>
                <span className="font-semibold text-slate-900">
                  {roles.length}
                </span>{" "}
                Role{roles.length !== 1 ? "s" : ""}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="font-semibold text-slate-900">
                {permissions.length}
              </span>{" "}
              Permission{permissions.length !== 1 ? "s" : ""} available
            </div>
          </div>

          {/* Search */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Table */}
        <div className="mb-4">
          <RolesTable
            data={filteredRoles}
            isLoading={isLoading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onManagePermissions={handleOpenPermissions}
          />
        </div>

        {/* Role Form Modal (Create/Edit) */}
        <RoleFormModal
          isOpen={isFormModalOpen}
          onClose={handleFormModalClose}
          role={isEditMode ? selectedRole : null}
          onSubmit={handleFormSubmit}
          isLoading={createRole.isPending || updateRole.isPending}
        />

        {/* Permissions Modal */}
        <PermissionsModal
          key={selectedRole?.id ?? "new"}
          isOpen={isPermissionsModalOpen}
          onClose={handlePermissionsModalClose}
          role={selectedRole}
          permissions={permissions}
          onSave={handlePermissionsSave}
          isLoading={syncPermissions.isPending}
        />

        {/* Delete Confirmation Modal */}
        <DeleteRoleModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          role={selectedRole}
          onConfirm={handleDeleteConfirm}
          isLoading={deleteRole.isPending}
        />
      </div>
    </div>
  );
};

export default RolesPermissions;
