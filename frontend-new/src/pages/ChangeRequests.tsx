import { useState, useMemo } from "react";
import { RefreshCw, User, LayoutGrid, List, Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuthContext";
import { isStaffUser } from "@/lib/api/auth/types";
import {
  type ChangeRequest,
  type RequestStatus,
  useChangeRequests,
  getModelName,
} from "@/lib/api/change-requests";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { RequestDetailModal } from "@/components/approvals";
import {
  EmptyState,
  RequestCard,
  RequestsFilter,
  RequestsSummary,
  StatusTabs,
} from "@/components/change-requests";
import { useSearchParams } from "react-router-dom";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type ViewMode = "cards" | "table";

const ChangeRequests = () => {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const paramStatus = searchParams.get("status");

  // Get staff-specific data
  const staffUser = user && isStaffUser(user) ? user : null;
  const serviceNo = staffUser?.service_no;

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  // Filter state
  const [activeStatus, setActiveStatus] = useState<StatusFilter>(
    (paramStatus as StatusFilter) || "all",
  );
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Build API filters
  const apiFilters = useMemo(() => {
    const filters: {
      service_no?: string;
      status?: RequestStatus;
      type?: string;
    } = {
      service_no: serviceNo || "",
    };

    if (activeStatus !== "all") {
      filters.status = activeStatus.toUpperCase() as RequestStatus;
    }

    if (typeFilter) {
      filters.type = typeFilter;
    }

    return filters;
  }, [serviceNo, activeStatus, typeFilter]);

  // Fetch change requests
  const { data, isLoading, isFetching, refetch } = useChangeRequests(
    { page, per_page: perPage },
    apiFilters,
    { enabled: !!serviceNo },
  );

  // Calculate stats from all data (need to fetch without status filter for accurate counts)
  const { data: allData } = useChangeRequests(
    { per_page: 1000 },
    { service_no: serviceNo || "" },
    { enabled: !!serviceNo },
  );

  const stats = useMemo(() => {
    const requests = allData?.data || [];
    return {
      all: requests.length,
      pending: requests.filter((r) => r.status === "PENDING").length,
      approved: requests.filter((r) => r.status === "APPROVED").length,
      rejected: requests.filter((r) => r.status === "REJECTED").length,
    };
  }, [allData?.data]);

  // Client-side search filtering
  const filteredData = useMemo(() => {
    const requests = data?.data || [];

    if (!searchQuery.trim()) return requests;

    const query = searchQuery.toLowerCase();
    return requests.filter((request) => {
      const modelName = getModelName(request.model_type).toLowerCase();
      const dataStr = JSON.stringify(request.data).toLowerCase();
      const serviceNoStr = (request.service_no || "").toLowerCase();
      return (
        modelName.includes(query) ||
        dataStr.includes(query) ||
        serviceNoStr.includes(query)
      );
    });
  }, [data?.data, searchQuery]);

  // Handlers
  const handleStatusChange = (status: StatusFilter) => {
    if (paramStatus) setSearchParams("");
    setActiveStatus(status);
    setPage(1);
  };

  const handleTypeFilterChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
  };

  const handleViewDetails = (request: ChangeRequest) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination data
  const totalPages = data?.last_page || 1;
  const currentPage = data?.current_page || 1;

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  // No staff user state
  if (!staffUser) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <User className="w-16 h-16 text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Staff Profile Required
          </h2>
          <p className="text-slate-500">
            Please log in with your staff account to view your change requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                My Change Requests
              </h1>
              <p className="mt-1 text-slate-600">
                Track the status of your submitted requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-white border rounded-lg border-slate-200">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "cards"
                      ? "bg-ncos-green-100 text-ncos-green-700"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="Card view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "table"
                      ? "bg-ncos-green-100 text-ncos-green-700"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Refresh Button */}
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
        </div>

        {/* Summary Stats */}
        <div className="mb-6">
          <RequestsSummary
            total={stats.all}
            pending={stats.pending}
            approved={stats.approved}
            rejected={stats.rejected}
            activeStatus={activeStatus}
            onStatusClick={handleStatusChange}
            isLoading={isLoading}
          />
        </div>

        {/* Status Tabs */}
        <div className="mb-4">
          <StatusTabs
            activeTab={activeStatus}
            onTabChange={handleStatusChange}
            counts={stats}
          />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <RequestsFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            typeFilter={typeFilter}
            onTypeFilterChange={handleTypeFilterChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Per Page Selector */}
        <div className="flex items-center justify-end gap-2 mb-4">
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
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
          >
            <option value="6">6</option>
            <option value="12">12</option>
            <option value="24">24</option>
            <option value="48">48</option>
          </select>
          <span className="text-sm text-slate-600">per page</span>
        </div>

        {/* Content */}
        {isLoading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-48 bg-slate-100 rounded-xl animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : filteredData.length === 0 ? (
          // Empty state
          <EmptyState status={activeStatus} />
        ) : viewMode === "cards" ? (
          // Card Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          // Table View - Reuse simpler table structure
          <div className="overflow-hidden bg-white border rounded-xl shadow-sm border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-slate-50 border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-slate-600 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-slate-600 uppercase">
                      Model
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-slate-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left text-slate-600 uppercase">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider text-right text-slate-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.type === "CREATE"
                              ? "bg-blue-100 text-blue-800"
                              : request.type === "UPDATE"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {request.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {getModelName(request.model_type)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            request.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : request.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isFetching}
            />
          </div>
        )}

        {/* Request Detail Modal */}
        <RequestDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      </div>
    </div>
  );
};

export default ChangeRequests;
