import React, { useMemo, useState } from "react";
import {
  MessageSquare,
  Plus,
  AlertTriangle,
  Loader2,
  Filter,
  X,
  Calendar,
  Flag,
  FilterX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Complaint,
  type ComplaintStatus,
  type ComplaintPriority,
  getComplaintPriorityColor,
  getComplaintStatusColor,
  formatRelativeTime,
} from "@/lib/api/complaints";
import { useIsAdmin } from "@/hooks/useAuth";

// Date filter options
export type DateFilter = "all" | "today" | "week" | "month";

interface ComplaintsListProps {
  complaints: Complaint[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNewTicket: () => void;
  statusFilter: "all" | ComplaintStatus;
  onFilterChange: (filter: "all" | ComplaintStatus) => void;
  priorityFilter: "all" | ComplaintPriority;
  onPriorityFilterChange: (filter: "all" | ComplaintPriority) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  isLoading?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

interface StatusCount {
  all: number;
  open: number;
  "in-progress": number;
  escalated: number;
  resolved: number;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in-progress", label: "In Progress" },
  { key: "escalated", label: "Escalated" },
  { key: "resolved", label: "Resolved" },
] as const;

const DATE_FILTERS = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
] as const;

const PRIORITY_FILTERS = [
  { key: "all", label: "All Priorities" },
  { key: "critical", label: "Critical" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
] as const;

// Helper to check if date is within range
function isWithinDateRange(dateStr: string, range: DateFilter): boolean {
  if (range === "all") return true;

  const date = new Date(dateStr);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (range) {
    case "today":
      return date >= startOfDay;
    case "week": {
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return date >= startOfWeek;
    }
    case "month": {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    default:
      return true;
  }
}

export const ComplaintsList: React.FC<ComplaintsListProps> = ({
  complaints,
  selectedId,
  onSelect,
  onNewTicket,
  statusFilter,
  onFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dateFilter,
  onDateFilterChange,
  isLoading = false,
  isCollapsed = false,
  onToggleCollapse,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // Calculate status counts (from all complaints, not filtered)
  const statusCounts = useMemo<StatusCount>(() => {
    const counts: StatusCount = {
      all: complaints.length,
      open: 0,
      "in-progress": 0,
      escalated: 0,
      resolved: 0,
    };

    complaints.forEach((c) => {
      if (c.status in counts) {
        counts[c.status as keyof Omit<StatusCount, "all">]++;
      }
    });

    return counts;
  }, [complaints]);

  // Filter complaints - only date filter is client-side (status/priority are server-side)
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Date filter (client-side only)
      if (!isWithinDateRange(c.created_at, dateFilter)) return false;
      return true;
    });
  }, [complaints, dateFilter]);

  // Count active filters (excluding "all")
  const activeFilterCount =
    (priorityFilter !== "all" ? 1 : 0) + (dateFilter !== "all" ? 1 : 0);

  // Clear all extra filters
  const clearFilters = () => {
    onPriorityFilterChange("all");
    onDateFilterChange("all");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Help Desk</h2>
          <div className="flex items-center gap-2">
            {onToggleCollapse && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleCollapse}
                className="hidden md:flex"
                title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant={
                showFilters || activeFilterCount > 0 ? "outline" : "ghost"
              }
              onClick={() => setShowFilters(!showFilters)}
              className={`relative ${
                activeFilterCount > 0
                  ? "border-ncos-green-500 text-ncos-green-700"
                  : ""
              }`}
              title={showFilters ? "Hide Filters" : "Show Filters"}
            >
              {showFilters ? (
                <FilterX className="w-4 h-4 text-red-700" />
              ) : (
                <Filter className="w-4 h-4" />
              )}
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-ncos-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            {useIsAdmin() ? null : (
              <Button size="sm" onClick={onNewTicket}>
                <Plus className="w-4 h-4 mr-1" />
                New
              </Button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
          {STATUS_FILTERS.map((filter) => {
            const count = statusCounts[filter.key as keyof StatusCount];
            const isActive = statusFilter === filter.key;
            const isEscalated = filter.key === "escalated";

            return (
              <button
                key={filter.key}
                onClick={() =>
                  onFilterChange(filter.key as "all" | ComplaintStatus)
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-ncos-green-600 text-white"
                    : isEscalated && count > 0
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {filter.label}
                {count > 0 && (
                  <span
                    className={`min-w-4.5 h-4.5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : isEscalated
                          ? "bg-red-600 text-white"
                          : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Expandable Filters Panel */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            {/* Priority Filter */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Flag className="w-3 h-3" />
                Priority
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITY_FILTERS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() =>
                      onPriorityFilterChange(p.key as "all" | ComplaintPriority)
                    }
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      priorityFilter === p.key
                        ? "bg-ncos-green-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
                <Calendar className="w-3 h-3" />
                Date Created
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DATE_FILTERS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => onDateFilterChange(d.key as DateFilter)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      dateFilter === d.key
                        ? "bg-ncos-green-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tickets List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm">Loading tickets...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No tickets found</p>
            <p className="text-xs mt-1">
              {statusFilter !== "all"
                ? "Try changing the filter"
                : "Create a new ticket to get started"}
            </p>
          </div>
        ) : (
          filteredComplaints.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelect(ticket.id)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedId === ticket.id
                  ? "bg-ncos-green-50 border-l-4 border-l-ncos-green-600!"
                  : "border-l-4 border-l-transparent"
              }`}
            >
              {/* Priority & Time */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getComplaintPriorityColor(
                    ticket.priority,
                  )}`}
                >
                  {ticket.priority}
                </span>
                <span className="text-[10px] text-slate-400">
                  {formatRelativeTime(ticket.updated_at)}
                </span>
              </div>

              {/* Subject */}
              <h4
                className="font-medium text-ncos-green-900 truncate mb-1.5 text-sm"
                title={ticket.subject}
              >
                {ticket.subject}
              </h4>

              {/* Creator & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-35">
                  {ticket.created_by_name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getComplaintStatusColor(
                    ticket.status,
                  )}`}
                >
                  {ticket.status === "in-progress"
                    ? "In Progress"
                    : ticket.status}
                </span>
              </div>

              {/* Escalated Warning */}
              {ticket.status === "escalated" && (
                <div className="flex items-center gap-1 mt-2 text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-[10px] font-semibold uppercase">
                    Escalated
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && (
        <div className="border-t border-slate-200 bg-slate-50/50 px-3 py-2">
          {/* Mobile: Simplified pagination */}
          <div className="flex md:hidden items-center justify-between">
            <span className="text-xs text-slate-500">
              {totalItems} ticket{totalItems !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop: Full pagination */}
          <div className="hidden md:flex gap-2 flex-col items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {currentPage} of {totalPages} ({totalItems} total)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded text-xs font-medium border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                      pageNum === currentPage
                        ? "bg-ncos-green-600 text-white"
                        : "border border-slate-300 hover:bg-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded text-xs font-medium border border-slate-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
