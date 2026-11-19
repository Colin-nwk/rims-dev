import React from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  STAFF_POSTING_STATUS_OPTIONS,
  STAFF_POSTING_TYPE_OPTIONS,
  type StaffPostingFilters,
} from "@/lib/api/staff-postings";

interface StaffPostingFiltersProps {
  filters: StaffPostingFilters;
  onFiltersChange: (filters: StaffPostingFilters) => void;
  onClear: () => void;
}

function hasValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "";
}

export function StaffPostingFilters({
  filters,
  onFiltersChange,
  onClear,
}: StaffPostingFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const hasActiveFilters = Object.values(filters).some(hasValue);
  const activeFilterCount = Object.values(filters).filter(hasValue).length;

  function handleSearchChange(value: string) {
    onFiltersChange({ ...filters, search: value });
  }

  function handleFilterChange(
    key: keyof StaffPostingFilters,
    value: string,
  ) {
    onFiltersChange({ ...filters, [key]: value || undefined });
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search postings..."
            value={filters.search || ""}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {isExpanded ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && !isExpanded ? (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-ncos-green-600 text-white rounded-full">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>
          {hasActiveFilters ? (
            <Button
              variant="outline"
              onClick={onClear}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {isExpanded ? (
        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Service Number
              </label>
              <input
                type="text"
                placeholder="Enter service number"
                value={filters.service_no || ""}
                onChange={(event) =>
                  handleFilterChange("service_no", event.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Station Name
              </label>
              <input
                type="text"
                placeholder="Filter by station"
                value={filters.station_name || ""}
                onChange={(event) =>
                  handleFilterChange("station_name", event.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Posting Type
              </label>
              <select
                value={filters.type || ""}
                onChange={(event) =>
                  handleFilterChange("type", event.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              >
                <option value="">All Types</option>
                {STAFF_POSTING_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(event) =>
                  handleFilterChange("status", event.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              >
                <option value="">All Statuses</option>
                {STAFF_POSTING_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Active Filters:
                </span>
                {filters.service_no ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-ncos-green-100 text-ncos-green-800">
                    Service: {filters.service_no}
                  </span>
                ) : null}
                {filters.station_name ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Station: {filters.station_name}
                  </span>
                ) : null}
                {filters.type ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                    Type: {filters.type}
                  </span>
                ) : null}
                {filters.status ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Status: {filters.status}
                  </span>
                ) : null}
                {filters.search ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    Search: {filters.search}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
