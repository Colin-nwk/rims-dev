import { useState } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  RefreshCw,
  Download,
  Trash2,
  Users,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  UsersTable,
  UserFilters,
  UserFormModal,
  UserViewModal,
  UserDeleteModal,
  UserRoleModal,
} from "@/components/users";
import { useAuth } from "@/hooks/useAuthContext";

import {
  type AdminUser,
  type UserFilters as IUserFilters,
  type CreateUserFormData,
  type UpdateUserFormData,
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useAssignUserRole,
  useRemoveUserRole,
} from "@/lib/api/users";

const AdminUsers = () => {
  // Get current logged-in user
  const { user: currentUser } = useAuth();

  // State management
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<IUserFilters>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useUsers({
    ...filters,
    page,
    per_page: perPage,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const assignRole = useAssignUserRole();
  const removeRole = useRemoveUserRole();

  // Filter handlers
  const handleFiltersChange = (newFilters: IUserFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Create handler
  const handleCreate = () => {
    setSelectedUser(null);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  // View handler
  const handleView = (user: AdminUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Edit handler
  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  // Delete handler - opens confirmation modal
  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Manage roles handler
  const handleManageRoles = (user: AdminUser) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  // Form submission handler
  const handleFormSubmit = (
    formData: CreateUserFormData | UpdateUserFormData,
  ) => {
    if (isEditMode && selectedUser) {
      updateUser.mutate(
        { id: selectedUser.id, data: formData as UpdateUserFormData },
        {
          onSuccess: () => {
            toast.success(
              "Update request submitted. It will be processed after approval.",
            );
            setIsFormModalOpen(false);
            setSelectedUser(null);
            setIsEditMode(false);
          },
          onError: (error) => {
            toast.error(error?.message || "Failed to submit update request");
          },
        },
      );
    } else {
      createUser.mutate(formData as CreateUserFormData, {
        onSuccess: () => {
          toast.success(
            "User creation request submitted. It will be processed after approval.",
          );
          setIsFormModalOpen(false);
          setSelectedUser(null);
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to submit creation request");
        },
      });
    }
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedUser) return;

    deleteUser.mutate(selectedUser.id, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete user");
      },
    });
  };

  // Role assignment handler
  const handleAssignRole = (userId: number, roleId: number) => {
    assignRole.mutate(
      { userId, roleId },
      {
        onSuccess: (updatedUser) => {
          toast.success("Role assigned successfully");
          setSelectedUser(updatedUser);
          refetch();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to assign role");
        },
      },
    );
  };

  // Role removal handler
  const handleRemoveRole = (userId: number, roleId: number) => {
    removeRole.mutate(
      { userId, roleId },
      {
        onSuccess: (updatedUser) => {
          toast.success("Role removed successfully");
          setSelectedUser(updatedUser);
          refetch();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to remove role");
        },
      },
    );
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select users to delete");
      return;
    }
    toast.info(
      `Bulk delete for ${selectedRows.length} users is not yet implemented`,
    );
  };

  // Export handler
  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  // Modal close handlers
  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedUser(null);
    setIsEditMode(false);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const handleRoleModalClose = () => {
    setIsRoleModalOpen(false);
    setSelectedUser(null);
  };

  // Edit from view modal
  const handleEditFromView = (user: AdminUser) => {
    setIsViewModalOpen(false);
    setSelectedUser(user);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  // Manage roles from view modal
  const handleManageRolesFromView = (user: AdminUser) => {
    setIsViewModalOpen(false);
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  // Pagination data
  const usersData = data?.data || [];
  const totalPages = data?.last_page || 1;
  const currentPage = data?.current_page || 1;
  const total = data?.total || 0;

  // Calculate stats
  const activeCount = usersData.filter((u) => u.status === "active").length;
  const inactiveCount = usersData.filter((u) => u.status === "inactive").length;

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Admin Users</h1>
              <p className="mt-1 text-slate-600">
                Manage admin accounts and permissions
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
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={total === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100">
                <Users className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
                <p className="text-xs text-slate-500">Total Users</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {activeCount}
                </p>
                <p className="text-xs text-slate-500">Active</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100">
                <UserX className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-600">
                  {inactiveCount}
                </p>
                <p className="text-xs text-slate-500">Inactive</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-violet-100">
                <Shield className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600">
                  {selectedRows.length}
                </p>
                <p className="text-xs text-slate-500">Selected</p>
              </div>
            </div>
          </div>

          {/* Per page selector */}
          <div className="flex items-center justify-end gap-2">
            <label htmlFor="perPage" className="text-sm text-slate-600">
              Show:
            </label>
            <select
              id="perPage"
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="text-sm text-slate-600">per page</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <UserFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Bulk actions bar */}
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between p-4 mb-4 border rounded-xl bg-ncos-green-50 border-ncos-green-200">
            <span className="text-sm font-medium text-ncos-green-900">
              {selectedRows.length} user(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRows([])}
              >
                Clear Selection
              </Button>
              <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mb-4">
          <UsersTable
            data={usersData}
            isLoading={isLoading}
            currentUserId={currentUser?.id}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onManageRoles={handleManageRoles}
            selectedRows={selectedRows}
            onSelectRows={setSelectedRows}
          />
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        )}

        {/* User Form Modal (Create/Edit) */}
        <UserFormModal
          isOpen={isFormModalOpen}
          onClose={handleFormModalClose}
          onSubmit={handleFormSubmit}
          user={isEditMode ? selectedUser : null}
          isLoading={createUser.isPending || updateUser.isPending}
        />

        {/* User View Modal */}
        <UserViewModal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          user={selectedUser}
          onEdit={handleEditFromView}
          onManageRoles={handleManageRolesFromView}
        />

        {/* Delete Confirmation Modal */}
        <UserDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleConfirmDelete}
          user={selectedUser}
          isLoading={deleteUser.isPending}
        />

        {/* Role Management Modal */}
        <UserRoleModal
          isOpen={isRoleModalOpen}
          onClose={handleRoleModalClose}
          user={selectedUser}
          onAssignRole={handleAssignRole}
          onRemoveRole={handleRemoveRole}
          isAssigning={assignRole.isPending}
          isRemoving={removeRole.isPending}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
