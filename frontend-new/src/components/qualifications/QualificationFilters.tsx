import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type StaffEducationFilters } from "@/lib/api/staff-education";
import { useGenericData } from "@/lib/api/statistics";

interface QualificationFiltersProps {
  filters: StaffEducationFilters & { search?: string };
  onFiltersChange: (
    filters: StaffEducationFilters & { search?: string },
  ) => void;
  onClear: () => void;
}

export const QualificationFilters: React.FC<QualificationFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { data: genericData, isLoading: isLoadingGeneric } = useGenericData();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (
    key: keyof StaffEducationFilters,
    value: string,
  ) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters =
    filters.service_no ||
    filters.institution ||
    filters.course ||
    filters.type ||
    filters.start_date_from ||
    filters.end_date_from ||
    filters.search;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      {/* Search and Toggle Row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by institution or course..."
            value={filters.search || ""}
            onChange={(e) => handleSearchChange(e.target.value)}
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

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Service Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Service Number
              </label>
              <input
                type="text"
                placeholder="Enter service number"
                value={filters.service_no || ""}
                onChange={(e) =>
                  handleFilterChange("service_no", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>

            {/* Institution */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Institution
              </label>
              <input
                type="text"
                placeholder="Filter by institution"
                value={filters.institution || ""}
                onChange={(e) =>
                  handleFilterChange("institution", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course
              </label>
              <input
                type="text"
                placeholder="Filter by course"
                value={filters.course || ""}
                onChange={(e) => handleFilterChange("course", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>

            {/* Education Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Education Type
              </label>
              <select
                value={filters.type || ""}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                disabled={isLoadingGeneric}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
              >
                <option value="">All Types</option>
                {genericData?.degree_types
                  ?.filter((dt) => dt.status)
                  .map((degreeType) => (
                    <option key={degreeType.id} value={degreeType.title}>
                      {degreeType.title}
                    </option>
                  ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={filters.start_date_from || ""}
                onChange={(e) =>
                  handleFilterChange("start_date_from", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={filters.end_date_from || ""}
                onChange={(e) =>
                  handleFilterChange("end_date_from", e.target.value)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors text-sm"
              />
            </div>
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Active Filters:
                </span>
                {filters.service_no && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-ncos-green-100 text-ncos-green-800">
                    Service: {filters.service_no}
                  </span>
                )}
                {filters.institution && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Institution: {filters.institution}
                  </span>
                )}
                {filters.course && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Course: {filters.course}
                  </span>
                )}
                {filters.type && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                    Type: {filters.type}
                  </span>
                )}
                {filters.start_date_from && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Start: {filters.start_date_from}
                  </span>
                )}
                {filters.end_date_from && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    End: {filters.end_date_from}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
