import { useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  StaffPostingCompleteModal,
  StaffPostingDeleteModal,
  StaffPostingFilters as Filters,
  StaffPostingFormModal,
  StaffPostingsTable,
} from "@/components/staff-postings";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  type CompleteStaffPostingDTO,
  type CreateStaffPostingDTO,
  type StaffPosting,
  type StaffPostingFilters,
  type UpdateStaffPostingDTO,
  useCompleteStaffPosting,
  useCreateStaffPosting,
  useDeleteStaffPosting,
  useStaffPostings,
  useUpdateStaffPosting,
} from "@/lib/api/staff-postings";
import { formatNumberWithCommas } from "@/lib/utils";

export function StaffPostingsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filters, setFilters] = useState<StaffPostingFilters>({});
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedPosting, setSelectedPosting] = useState<StaffPosting | null>(
    null,
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useStaffPostings(
    { page, per_page: perPage },
    filters,
  );

  const createPosting = useCreateStaffPosting();
  const updatePosting = useUpdateStaffPosting();
  const completePosting = useCompleteStaffPosting();
  const deletePosting = useDeleteStaffPosting();

  const postings = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;
  const totalPostings = data?.total ?? 0;

  function handleFiltersChange(nextFilters: StaffPostingFilters) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleClearFilters() {
    setFilters({});
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
  }

  function handleCreate() {
    setSelectedPosting(null);
    setIsFormModalOpen(true);
  }

  function handleEdit(posting: StaffPosting) {
    setSelectedPosting(posting);
    setIsFormModalOpen(true);
  }

  function handleComplete(posting: StaffPosting) {
    setSelectedPosting(posting);
    setIsCompleteModalOpen(true);
  }

  function handleDelete(posting: StaffPosting) {
    setSelectedPosting(posting);
    setIsDeleteModalOpen(true);
  }

  function handleFormSubmit(
    formData: CreateStaffPostingDTO | UpdateStaffPostingDTO,
    postingId?: number,
  ) {
    if (postingId) {
      updatePosting.mutate(
        {
          id: postingId,
          data: formData as UpdateStaffPostingDTO,
        },
        {
          onSuccess: () => {
            toast.success("Posting update submitted for approval");
            setIsFormModalOpen(false);
            setSelectedPosting(null);
          },
          onError: (error) => {
            toast.error(error?.message || "Failed to submit posting update");
          },
        },
      );
      return;
    }

    createPosting.mutate(formData as CreateStaffPostingDTO, {
      onSuccess: () => {
        toast.success("Posting submitted for approval");
        setIsFormModalOpen(false);
        setSelectedPosting(null);
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to submit posting");
      },
    });
  }

  function handleCompleteSubmit(data: CompleteStaffPostingDTO) {
    if (!selectedPosting) return;
    completePosting.mutate(
      { id: selectedPosting.id, data },
      {
        onSuccess: () => {
          toast.success("Posting marked as completed");
          setIsCompleteModalOpen(false);
          setSelectedPosting(null);
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to complete posting");
        },
      },
    );
  }

  function handleConfirmDelete() {
    if (!selectedPosting) return;
    deletePosting.mutate(selectedPosting.id, {
      onSuccess: () => {
        toast.success("Posting deleted successfully");
        setIsDeleteModalOpen(false);
        setSelectedPosting(null);
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to delete posting");
      },
    });
  }

  function handleBulkDelete() {
    if (selectedRows.length === 0) {
      toast.warning("Please select postings to delete");
      return;
    }
    toast.info(
      `Bulk delete for ${selectedRows.length} posting(s) is not yet implemented`,
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Staff Postings</h1>
          <p className="mt-1 text-slate-600">
            Manage postings, completions, and staff movement history.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-max">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Posting
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
        <div>
          Total:{" "}
          <span className="font-semibold text-slate-900">
            {formatNumberWithCommas(totalPostings as number)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="perPage" className="text-sm text-slate-600">
            Show:
          </label>
          <select
            id="perPage"
            value={perPage}
            onChange={(event) => {
              setPerPage(Number(event.target.value));
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

      <Filters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClear={handleClearFilters}
      />

      {selectedRows.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border rounded-xl bg-ncos-green-50 border-ncos-green-200">
          <span className="text-sm font-medium text-ncos-green-900">
            {selectedRows.length} posting(s) selected
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
      ) : null}

      <StaffPostingsTable
        data={postings}
        isLoading={isLoading}
        onEdit={handleEdit}
        onComplete={handleComplete}
        onDelete={handleDelete}
        selectedRows={selectedRows}
        onSelectRows={setSelectedRows}
      />

      {!isLoading && totalPages > 1 ? (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isFetching}
        />
      ) : null}

      <StaffPostingFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        posting={selectedPosting}
        isLoading={createPosting.isPending || updatePosting.isPending}
      />

      <StaffPostingCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onSubmit={handleCompleteSubmit}
        posting={selectedPosting}
        isLoading={completePosting.isPending}
      />

      <StaffPostingDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        posting={selectedPosting}
        onConfirm={handleConfirmDelete}
        isLoading={deletePosting.isPending}
      />
    </div>
  );
}

export default StaffPostingsPage;
