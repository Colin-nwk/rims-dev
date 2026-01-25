import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffFilters as IStaffFilters } from "@/lib/api/staff";

interface StaffFiltersProps {
  filters: IStaffFilters & { search?: string };
  onFiltersChange: (filters: IStaffFilters & { search?: string }) => void;
  onClear: () => void;
}

export const StaffFilters: React.FC<StaffFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (
    key: keyof IStaffFilters,
    value: string | number,
  ) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters = Object.values(filters).some(
    (val) => val !== undefined && val !== "",
  );

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (val) => val !== undefined && val !== "",
  ).length;

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-600" />
          <h3 className="font-medium text-slate-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-ncos-green-100 text-ncos-green-800">
              {activeFilterCount} active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Search
          </label>
          <div className="relative">
            <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, service no, email..."
              value={filters.search || ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            value={filters.status ?? ""}
            onChange={(e) =>
              handleFilterChange(
                "status",
                e.target.value ? Number(e.target.value) : "",
              )
            }
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>

        {/* Gender */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Gender
          </label>
          <select
            value={filters.sex || ""}
            onChange={(e) => handleFilterChange("sex", e.target.value)}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Department */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Department
          </label>
          <input
            type="text"
            placeholder="e.g., Admin"
            value={filters.department || ""}
            onChange={(e) => handleFilterChange("department", e.target.value)}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
          />
        </div>

        {/* Present Rank */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Present Rank
          </label>
          <input
            type="text"
            placeholder="e.g., Assistant Superintendent"
            value={filters.present_rank || ""}
            onChange={(e) => handleFilterChange("present_rank", e.target.value)}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
          />
        </div>

        {/* Level */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Level
          </label>
          <input
            type="number"
            min="1"
            max="17"
            placeholder="1-17"
            value={filters.level || ""}
            onChange={(e) =>
              handleFilterChange(
                "level",
                e.target.value ? Number(e.target.value) : "",
              )
            }
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
          />
        </div>

        {/* Assigned State */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Assigned State
          </label>
          <input
            type="text"
            placeholder="e.g., Lagos"
            value={filters.assigned_state || ""}
            onChange={(e) =>
              handleFilterChange("assigned_state", e.target.value)
            }
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
          />
        </div>
      </div>
    </div>
  );
};
