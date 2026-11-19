import {
  Download,
  FileCheck,
  FileText,
  FileX,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  QualificationDeleteModal,
  QualificationFilters,
  QualificationFormModal,
  QualificationsTable,
  QualificationViewModal,
} from "@/components/qualifications";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

import {
  type CreateStaffEducationFormData,
  type StaffEducationFilters as IStaffEducationFilters,
  type StaffEducation,
  type UpdateStaffEducationFormData,
  useCreateStaffEducation,
  useDeleteStaffEducation,
  useStaffEducation,
  useUpdateStaffEducation,
} from "@/lib/api/staff-education";
import {
  fetchAllDataAndExport,
  type ColumnMapping,
} from "@/lib/helpers/excel-export";

const Qualifications = () => {
  // URL search params for filtering by service_no from Staff Directory
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceNoFromUrl = searchParams.get("service_no");

  // State management
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<IStaffEducationFilters>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Combine URL service_no param with other filters for API call
  const effectiveFilters: IStaffEducationFilters = serviceNoFromUrl
    ? { ...filters, service_no: serviceNoFromUrl }
    : filters;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEducation, setSelectedEducation] =
    useState<StaffEducation | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // API hooks - use effectiveFilters to include URL service_no param
  const { data, isLoading, isFetching, refetch } = useStaffEducation(
    {
      page,
      per_page: perPage,
    },
    effectiveFilters,
  );

  const createEducation = useCreateStaffEducation();
  const updateEducation = useUpdateStaffEducation();
  const deleteEducation = useDeleteStaffEducation();

  // Filter handlers
  const handleFiltersChange = (newFilters: IStaffEducationFilters) => {
    // If service_no changed, update the URL params
    if (newFilters.service_no !== serviceNoFromUrl) {
      if (newFilters.service_no) {
        setSearchParams({ service_no: newFilters.service_no });
      } else {
        setSearchParams({});
      }
    }

    // Store other filters in state (excluding service_no which is managed via URL)
    const otherFilters = { ...newFilters };
    delete otherFilters.service_no;
    setFilters(otherFilters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
    // Clear URL params
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Create handler
  const handleCreate = () => {
    setSelectedEducation(null);
    setIsEditMode(false);
    setIsFormModalOpen(true);
  };

  // View handler
  const handleView = (education: StaffEducation) => {
    setSelectedEducation(education);
    setIsViewModalOpen(true);
  };

  // Edit handler
  const handleEdit = (education: StaffEducation) => {
    setSelectedEducation(education);
    setIsEditMode(true);
    setIsFormModalOpen(true);
  };

  // Delete handler - opens confirmation modal
  const handleDelete = (education: StaffEducation) => {
    setSelectedEducation(education);
    setIsDeleteModalOpen(true);
  };

  // Form submission handler
  const handleFormSubmit = (
    formData: CreateStaffEducationFormData | UpdateStaffEducationFormData,
    educationId?: number,
  ) => {
    // Use the passed educationId to determine update vs create
    if (educationId) {
      updateEducation.mutate(
        {
          id: educationId,
          data: formData as UpdateStaffEducationFormData,
        },
        {
          onSuccess: () => {
            toast.success("Qualification update submitted for approval");
            setIsFormModalOpen(false);
            setSelectedEducation(null);
            setIsEditMode(false);
            refetch();
          },
          onError: (error) => {
            toast.error(
              error?.message || "Failed to submit qualification update",
            );
          },
        },
      );
    } else {
      createEducation.mutate(formData as CreateStaffEducationFormData, {
        onSuccess: () => {
          toast.success("Qualification submitted for approval");
          setIsFormModalOpen(false);
          setSelectedEducation(null);
          refetch();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to submit qualification");
        },
      });
    }
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedEducation) return;

    deleteEducation.mutate(selectedEducation.id, {
      onSuccess: () => {
        toast.success("Qualification deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedEducation(null);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete qualification");
      },
    });
  };

  // Bulk delete handler
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select qualifications to delete");
      return;
    }
    toast.info(
      `Bulk delete for ${selectedRows.length} qualifications is not yet implemented`,
    );
  };

  // Export handler
  const handleExport = async () => {
    setIsExporting(true);

    // Column mappings for better Excel headers
    const columnMappings: ColumnMapping[] = [
      { key: "staff.service_no", columnName: "Service Number" },
      { key: "staff.surname", columnName: "Surname" },
      { key: "staff.first_name", columnName: "First Name" },
      { key: "staff.present_rank_name", columnName: "Rank" },
      { key: "institution", columnName: "Institution" },
      { key: "course", columnName: "Course" },
      { key: "type", columnName: "Type" },
      { key: "start_date", columnName: "Start Date" },
      { key: "end_date", columnName: "End Date" },
      { key: "created_at", columnName: "Created At" },
    ];

    // Only include these specific columns in the export
    const includeColumns = [
      "staff.service_no",
      "staff.surname",
      "staff.first_name",
      "staff.present_rank_name",
      "institution",
      "course",
      "type",
      "start_date",
      "end_date",
      "created_at",
    ];

    try {
      const result = await fetchAllDataAndExport(
        "/staff-education",
        "Staff_Qualifications",
        effectiveFilters as Record<string, string | undefined>,
        5000, // Fetch 5000 per page to minimize requests
        undefined,
        undefined,
        columnMappings,
        undefined,
        includeColumns,
      );

      if (result.status) {
        toast.success("Qualifications exported successfully");
      } else {
        toast.error("Failed to export qualifications");
      }
    } catch {
      toast.error("An error occurred while exporting");
    } finally {
      setIsExporting(false);
    }
  };

  // Modal close handlers
  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    setSelectedEducation(null);
    setIsEditMode(false);
  };

  const handleViewModalClose = () => {
    setIsViewModalOpen(false);
    setSelectedEducation(null);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedEducation(null);
  };

  // Pagination data
  const qualificationsData = data?.data || [];
  const totalPages = data?.last_page || 1;
  const currentPage = data?.current_page || 1;
  const total = data?.total || 0;

  // Certificate stats from backend (for all records, not just current page)
  const withCertificate = data?.stats?.with_certificate || 0;
  const withoutCertificate = data?.stats?.without_certificate || 0;

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Qualifications
              </h1>
              <p className="mt-1 text-slate-600">
                Manage staff education records and qualifications
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
                disabled={total === 0 || isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isExporting ? "Exporting..." : "Export"}
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Qualification
              </Button>
            </div>
          </div>

          {/* Staff filter indicator */}
          {serviceNoFromUrl && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-violet-50 border border-violet-200">
              <GraduationCap className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-violet-800">
                Showing qualifications for staff:{" "}
                <span className="font-semibold">{serviceNoFromUrl}</span>
              </span>
              <button
                onClick={handleClearFilters}
                className="ml-auto p-1 rounded-full hover:bg-violet-200 text-violet-600 transition-colors"
                title="Clear filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100">
                <GraduationCap className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{total}</p>
                <p className="text-xs text-slate-500">Total Records</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100">
                <FileCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {withCertificate}
                </p>
                <p className="text-xs text-slate-500">With Certificate</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-100">
                <FileX className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {withoutCertificate}
                </p>
                <p className="text-xs text-slate-500">No Certificate</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-ncos-green-100">
                <FileText className="w-5 h-5 text-ncos-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ncos-green-600">
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

        {/* Filters */}
        <div className="mb-6">
          <QualificationFilters
            filters={effectiveFilters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Bulk actions bar */}
        {selectedRows.length > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 mb-4 border rounded-xl bg-ncos-green-50 border-ncos-green-200">
            <span className="text-sm font-medium text-ncos-green-900">
              {selectedRows.length} qualification(s) selected
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
          <QualificationsTable
            data={qualificationsData}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
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

        {/* Qualification Form Modal (Create/Edit) */}
        <QualificationFormModal
          isOpen={isFormModalOpen}
          onClose={handleFormModalClose}
          onSubmit={handleFormSubmit}
          education={isEditMode ? selectedEducation : null}
          isLoading={createEducation.isPending || updateEducation.isPending}
        />

        {/* Qualification View Modal */}
        <QualificationViewModal
          isOpen={isViewModalOpen}
          onClose={handleViewModalClose}
          education={selectedEducation}
        />

        {/* Delete Confirmation Modal */}
        <QualificationDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          onConfirm={handleConfirmDelete}
          education={selectedEducation}
          isLoading={deleteEducation.isPending}
        />
      </div>
    </div>
  );
};

export default Qualifications;
