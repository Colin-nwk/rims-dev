import React, { useState } from "react";
import { Search, X, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type UserFilters as IUserFilters,
  USER_STATUS_OPTIONS,
} from "@/lib/api/users";

interface UserFiltersProps {
  filters: IUserFilters;
  onFiltersChange: (filters: IUserFilters) => void;
  onClear: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchValue });
  };

  const handleSearchClear = () => {
    setSearchValue("");
    onFiltersChange({ ...filters, search: undefined });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : (status as IUserFilters["status"]),
    });
  };

  const activeFilterCount = [filters.status].filter(Boolean).length;

  const handleClearAll = () => {
    setSearchValue("");
    setShowFilters(false);
    onClear();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Filter toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters || activeFilterCount > 0 ? "outline" : "ghost"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`relative ${
              activeFilterCount > 0
                ? "border-ncos-green-500 text-ncos-green-700"
                : ""
            }`}
          >
            <Filter className="w-4 h-4 mr-1.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-ncos-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {(activeFilterCount > 0 || filters.search) && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={filters.status || "all"}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors bg-white"
                >
                  <option value="all">All Statuses</option>
                  {USER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
