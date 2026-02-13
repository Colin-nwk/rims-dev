import React from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type StaffDocumentFilters as StaffDocumentFiltersType,
  STAFF_DOCUMENT_TYPE_OPTIONS,
  getStaffDocumentStatusLabel,
  getStaffDocumentTypeLabel,
} from "@/lib/api/staff-documents";

interface StaffDocumentFiltersProps {
  filters: StaffDocumentFiltersType & { search?: string };
  onFiltersChange: (
    filters: StaffDocumentFiltersType & { search?: string },
  ) => void;
  onClear: () => void;
  showServiceNo?: boolean;
}

export function StaffDocumentFilters({
  filters,
  onFiltersChange,
  onClear,
  showServiceNo = true,
}: StaffDocumentFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  function handleSearchChange(value: string) {
    onFiltersChange({ ...filters, search: value });
  }

  function handleFilterChange(
    key: keyof StaffDocumentFiltersType,
    value: string,
  ) {
    onFiltersChange({ ...filters, [key]: value || undefined });
  }

  const hasActiveFilters =
    !!filters.search ||
    !!filters.document_type ||
    !!filters.expires_at_from ||
    !!filters.expires_at_to ||
    (!!filters.service_no && showServiceNo);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by document name, notes, or service number..."
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
            {hasActiveFilters && !isExpanded && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-ncos-green-600 text-white rounded-full">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={onClear}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {showServiceNo && (
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
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Document Type
              </label>
              <select
                value={filters.document_type || ""}
                onChange={(event) =>
                  handleFilterChange("document_type", event.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              >
                <option value="">All Types</option>
                {STAFF_DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Expiry Date From
              </label>
              <input
                type="date"
                value={filters.expires_at_from || ""}
                onChange={(event) =>
                  handleFilterChange("expires_at_from", event.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Expiry Date To
              </label>
              <input
                type="date"
                value={filters.expires_at_to || ""}
                onChange={(event) =>
                  handleFilterChange("expires_at_to", event.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>
          </div>

          {(hasActiveFilters || filters.verification_status) && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Active Filters:
                </span>
                {filters.verification_status && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Status:{" "}
                    {getStaffDocumentStatusLabel(filters.verification_status)}
                  </span>
                )}
                {filters.service_no && showServiceNo && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-ncos-green-100 text-ncos-green-800">
                    Service: {filters.service_no}
                  </span>
                )}
                {filters.document_type && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Type: {getStaffDocumentTypeLabel(filters.document_type)}
                  </span>
                )}
                {filters.expires_at_from && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Expiry from: {filters.expires_at_from}
                  </span>
                )}
                {filters.expires_at_to && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Expiry to: {filters.expires_at_to}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
