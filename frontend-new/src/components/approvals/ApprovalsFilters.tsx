import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  REQUEST_TYPES,
  type ChangeRequestFilters,
} from "@/lib/api/change-requests";
import { Search, Filter, X } from "lucide-react";

// History tab statuses (excluding PENDING)
const HISTORY_STATUSES = ["APPROVED", "REJECTED"] as const;

interface ApprovalsFiltersProps {
  filters: ChangeRequestFilters & { search?: string };
  onFiltersChange: (
    filters: ChangeRequestFilters & { search?: string },
  ) => void;
  onClear: () => void;
  activeTab: "pending" | "history";
}

export const ApprovalsFilters: React.FC<ApprovalsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  activeTab,
}) => {
  const hasActiveFilters =
    filters.status || filters.type || filters.model_type || filters.search;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value || undefined });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      status: e.target.value || undefined,
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({
      ...filters,
      type: e.target.value || undefined,
    });
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        {/* Search */}
        <div className="flex-1 min-w-0 lg:max-w-xs">
          <Input
            placeholder="Search by service number..."
            value={filters.search || ""}
            onChange={handleSearchChange}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Status filter - only show on history tab */}
        {activeTab === "history" && (
          <div className="w-full lg:w-40">
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={filters.status || ""}
              onChange={handleStatusChange}
              className="w-full h-10 px-3 text-sm bg-white border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-ncos-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {HISTORY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Type filter - only show on pending tab */}
        {activeTab === "pending" && (
          <div className="w-full lg:w-40">
            <label className="block mb-1.5 text-sm font-medium text-slate-700">
              Type
            </label>
            <select
              value={filters.type || ""}
              onChange={handleTypeChange}
              className="w-full h-10 px-3 text-sm bg-white border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-ncos-green-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              {REQUEST_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clear filters button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filters pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-100">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">
            Active filters:
          </span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
              Search: {filters.search}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, search: undefined })
                }
                className="hover:text-slate-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
              Status: {filters.status}
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, status: undefined })
                }
                className="hover:text-amber-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              Type: {filters.type}
              <button
                onClick={() => onFiltersChange({ ...filters, type: undefined })}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
