import { DeleteConfirmModal } from "@/components/staff/DeleteConfirmModal";
import { RoleManageModal } from "@/components/staff/RoleManageModal";
import { StaffFilters } from "@/components/staff/StaffFilters";
import { StaffIDCard } from "@/components/staff/StaffIDCard";
import { StaffTable } from "@/components/staff/StaffTable";
import { StaffViewModal } from "@/components/staff/StaffViewModal";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  StaffFilters as IStaffFilters,
  Staff,
  useDeleteStaff,
  useStaffIDCard,
  useStaffList,
} from "@/lib/api/staff";
import { Download, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROUTES } from "@/routes/constants";

const StaffDirectory = () => {
  const navigate = useNavigate();

  // State management
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<IStaffFilters & { search?: string }>(
    {},
  );
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Modal states
  const [showIDCard, setShowIDCard] = useState(false);
  const [idCardServiceNo, setIdCardServiceNo] = useState<string>("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useStaffList(
    { page, per_page: perPage, search: filters.search },
    {
      status: filters.status,
      sex: filters.sex,
      department: filters.department,
      present_rank: filters.present_rank,
      initial_rank: filters.initial_rank,
      level: filters.level,
      assigned_state: filters.assigned_state,
      prison: filters.prison,
      zone_id: filters.zone_id,
    },
  );

  const { data: idCardData } = useStaffIDCard(
    idCardServiceNo,
    showIDCard && !!idCardServiceNo,
  );

  const deleteStaff = useDeleteStaff();

  // Filter handlers
  const handleFiltersChange = (
    newFilters: IStaffFilters & { search?: string },
  ) => {
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

  // ID Card handlers
  const handleViewIDCard = (staff: Staff) => {
    setIdCardServiceNo(staff.service_no);
    setShowIDCard(true);
  };

  const handleCloseIDCard = () => {
    setShowIDCard(false);
    setIdCardServiceNo("");
  };

  // Create handler - navigate to add page
  const handleCreate = () => {
    navigate(ROUTES.STAFF_ADD);
  };

  // View handler
  const handleView = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  // Edit handler - navigate to edit page
  const handleEdit = (staff: Staff) => {
    navigate(ROUTES.STAFF_EDIT.replace(":serviceNo", staff.service_no));
  };

  // Delete handler - opens confirmation modal
  const handleDelete = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedStaff) return;

    deleteStaff.mutate(selectedStaff.service_no, {
      onSuccess: () => {
        toast.success("Staff deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedStaff(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete staff");
      },
    });
  };

  // Manage roles handler
  const handleManageRoles = (staff: Staff) => {
    setSelectedStaff(staff);
    setIsRoleModalOpen(true);
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select staff members to delete");
      return;
    }
    // For now, show a message. Bulk delete would need a separate API endpoint
    toast.info(
      `Bulk delete for ${selectedRows.length} items is not yet implemented`,
    );
  };

  // Export handler
  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  // View modal close handler
  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedStaff(null);
  };

  // Edit from view modal - navigate to edit page
  const handleEditFromView = (staff: Staff) => {
    setIsViewModalOpen(false);
    navigate(ROUTES.STAFF_EDIT.replace(":serviceNo", staff.service_no));
  };

  // View ID card from view modal
  const handleViewIDCardFromView = (staff: Staff) => {
    setIsViewModalOpen(false);
    handleViewIDCard(staff);
  };

  // Delete modal close handler
  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
  };

  // Role modal close handler
  const handleRoleModalClose = () => {
    setIsRoleModalOpen(false);
    setSelectedStaff(null);
  };

  // Role success handler
  const handleRoleSuccess = () => {
    refetch();
  };

  // Pagination data is directly on the response (Laravel default pagination)
  const staffData = data?.data || [];
  const totalPages = data?.last_page || 1;
  const currentPage = data?.current_page || 1;
  const total = data?.total || 0;

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Staff Directory
              </h1>
              <p className="mt-1 text-slate-600">
                Manage and view all staff members
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3 w-full sm:w-max">
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
                Add Staff
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-4">
              <div>
                Total:{" "}
                <span className="font-semibold text-slate-900">{total}</span>
              </div>
            </div>

            {/* Per page selector */}
            <div className="flex items-center gap-2">
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
                className="bg-white px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
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
        </div>

        {/* Filters */}
        <div className="mb-6">
          <StaffFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Bulk actions bar */}
        {selectedRows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 mb-4 border rounded-lg bg-ncos-green-50 border-ncos-green-200">
            <span className="text-sm font-medium text-ncos-green-900">
              {selectedRows.length} item(s) selected
            </span>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRows([])}
                className="flex-1 sm:flex-none"
              >
                Clear Selection
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDelete}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mb-4">
          <StaffTable
            data={staffData}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewIDCard={handleViewIDCard}
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

        {/* ID Card Modal */}
        {showIDCard && (
          <StaffIDCard
            isOpen={showIDCard}
            onClose={handleCloseIDCard}
            staffData={idCardData?.data || null}
          />
        )}

        {/* Staff View Modal */}
        <StaffViewModal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          staff={selectedStaff}
          onEdit={handleEditFromView}
          onViewIDCard={handleViewIDCardFromView}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          staff={selectedStaff}
          onConfirm={handleConfirmDelete}
          isLoading={deleteStaff.isPending}
        />

        {/* Role Management Modal */}
        <RoleManageModal
          isOpen={isRoleModalOpen}
          onClose={handleRoleModalClose}
          staff={selectedStaff}
          onSuccess={handleRoleSuccess}
          onStaffUpdate={setSelectedStaff}
        />
      </div>
    </div>
  );
};

export default StaffDirectory;
