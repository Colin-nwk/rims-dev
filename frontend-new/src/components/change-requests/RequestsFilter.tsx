import { Search, X, Filter } from "lucide-react";
import { REQUEST_TYPES } from "@/lib/api/change-requests/types";

interface RequestsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  onClear: () => void;
}

export const RequestsFilter = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onClear,
}: RequestsFilterProps) => {
  const hasFilters = searchQuery || typeFilter;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white border rounded-lg border-slate-200">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
        />
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 transition-colors"
        >
          <option value="">All Types</option>
          {REQUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Button */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
          <span>Clear</span>
        </button>
      )}
    </div>
  );
};

export default RequestsFilter;
