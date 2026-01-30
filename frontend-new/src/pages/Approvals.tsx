import { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  ApprovalsTable,
  ApprovalsFilters,
  RequestDetailModal,
  RejectModal,
} from "@/components/approvals";
import {
  type ChangeRequest,
  type ChangeRequestFilters,
  useChangeRequests,
  useApproveRequest,
  useRejectRequest,
  useBulkApprove,
  useBulkReject,
} from "@/lib/api/change-requests";
import { RefreshCw, CheckCircle, ClipboardList, Trash2 } from "lucide-react";

type TabType = "pending" | "history";

const Approvals = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<
    ChangeRequestFilters & { search?: string }
  >({});

  // Selection state
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(
    null,
  );

  // Build API filters based on active tab
  const apiFilters = useMemo((): ChangeRequestFilters => {
    const baseFilters: ChangeRequestFilters = {
      ...filters,
      service_no: filters.search || undefined,
    };

    // For pending tab, filter by PENDING status
    // For history tab, filter by APPROVED or REJECTED (or let all through if no status filter)
    if (activeTab === "pending") {
      baseFilters.status = "PENDING";
    } else if (!filters.status) {
      // In history tab without explicit status filter, don't filter by status
      // The backend will return all non-pending items
    }

    return baseFilters;
  }, [activeTab, filters]);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useChangeRequests(
    { page, per_page: perPage },
    apiFilters,
  );

  const approveRequest = useApproveRequest();
  const rejectRequest = useRejectRequest();
  const bulkApprove = useBulkApprove();
  const bulkReject = useBulkReject();

  // Filter data based on tab (client-side filtering for history)
  const filteredData = useMemo(() => {
    const allData = data?.data || [];
    if (activeTab === "pending") {
      return allData.filter((item) => item.status === "PENDING");
    }
    return allData.filter((item) => item.status !== "PENDING");
  }, [data?.data, activeTab]);

  // Count pending items
  const pendingCount = useMemo(() => {
    return (data?.data || []).filter((item) => item.status === "PENDING")
      .length;
  }, [data?.data]);

  // Handlers
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedRows([]);
    setPage(1);
    setFilters({}); // Reset filters when switching tabs
  };

  const handleFiltersChange = (
    newFilters: ChangeRequestFilters & { search?: string },
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
    setSelectedRows([]);
  };

  // View request details
  const handleView = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  // Approve single request
  const handleApprove = (request: ChangeRequest) => {
    approveRequest.mutate(request.id, {
      onSuccess: () => {
        toast.success("Request approved successfully");
        refetch();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to approve request");
      },
    });
  };

  // Open reject modal
  const handleReject = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setIsRejectModalOpen(true);
  };

  // Confirm rejection
  const handleConfirmReject = (reason: string) => {
    if (!selectedRequest) return;

    rejectRequest.mutate(
      { id: selectedRequest.id, data: { reason } },
      {
        onSuccess: () => {
          toast.success("Request rejected successfully");
          setIsRejectModalOpen(false);
          setSelectedRequest(null);
          refetch();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to reject request");
        },
      },
    );
  };

  // Bulk approve
  const handleBulkApprove = () => {
    if (selectedRows.length === 0) return;

    if (
      !window.confirm(
        `Are you sure you want to approve ${selectedRows.length} request(s)?`,
      )
    ) {
      return;
    }

    bulkApprove.mutate(selectedRows, {
      onSuccess: (result) => {
        toast.success(
          `${result.succeeded} of ${result.total} requests approved successfully`,
        );
        if (result.failed > 0) {
          toast.warning(`${result.failed} requests failed to approve`);
        }
        setSelectedRows([]);
        refetch();
      },
      onError: (error) => {
        toast.error(error?.message || "Failed to bulk approve requests");
      },
    });
  };

  // Bulk reject (with a common reason)
  const handleBulkReject = () => {
    if (selectedRows.length === 0) return;

    const reason = window.prompt(
      `Enter rejection reason for ${selectedRows.length} request(s):`,
    );
    if (!reason || reason.trim().length < 10) {
      toast.warning(
        "Please provide a valid rejection reason (at least 10 characters)",
      );
      return;
    }

    bulkReject.mutate(
      { ids: selectedRows, reason: reason.trim() },
      {
        onSuccess: (result) => {
          toast.success(
            `${result.succeeded} of ${result.total} requests rejected successfully`,
          );
          if (result.failed > 0) {
            toast.warning(`${result.failed} requests failed to reject`);
          }
          setSelectedRows([]);
          refetch();
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to bulk reject requests");
        },
      },
    );
  };

  // Pagination data
  const totalPages = data?.last_page || 1;
  const currentPage = data?.current_page || 1;
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Approval Center
              </h1>
              <p className="mt-1 text-slate-600">
                Review and process change requests
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
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-4">
              <div>
                Total:{" "}
                <span className="font-semibold text-slate-900">{total}</span>
              </div>
              {selectedRows.length > 0 && (
                <div>
                  Selected:{" "}
                  <span className="font-semibold text-ncos-green-900">
                    {selectedRows.length}
                  </span>
                </div>
              )}
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
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-slate-600">per page</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-1 p-1 bg-white border rounded-lg shadow-sm border-slate-200">
            <button
              onClick={() => handleTabChange("pending")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "pending"
                  ? "bg-ncos-green-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Pending Requests
              {pendingCount > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    activeTab === "pending"
                      ? "bg-white/20 text-white"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "history"
                  ? "bg-ncos-green-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ApprovalsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
            activeTab={activeTab}
          />
        </div>

        {/* Bulk actions bar */}
        {selectedRows.length > 0 && activeTab === "pending" && (
          <div className="flex items-center justify-between p-4 mb-4 border rounded-lg bg-ncos-green-50 border-ncos-green-200">
            <span className="text-sm font-medium text-ncos-green-900">
              {selectedRows.length} request(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRows([])}
              >
                Clear Selection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkReject}
                disabled={bulkReject.isPending}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Reject Selected
              </Button>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={bulkApprove.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve Selected
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="mb-4">
          <ApprovalsTable
            data={filteredData}
            isLoading={isLoading}
            onView={handleView}
            onApprove={handleApprove}
            onReject={handleReject}
            selectedRows={selectedRows}
            onSelectRows={setSelectedRows}
            showActions={activeTab === "pending"}
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

        {/* Request Detail Modal */}
        <RequestDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* Reject Modal */}
        <RejectModal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onConfirm={handleConfirmReject}
          isLoading={rejectRequest.isPending}
        />
      </div>
    </div>
  );
};

export default Approvals;
