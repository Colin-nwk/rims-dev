import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffFilters as IStaffFilters } from "@/lib/api/staff";
import { useGenericData } from "@/lib/api/statistics";

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
  const { data: genericData, isLoading: isLoadingGeneric } = useGenericData();

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleFilterChange = (
    key: keyof IStaffFilters,
    value: string | number,
  ) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  // Cascading filter handlers
  const handleZoneChange = (value: string | number) => {
    const zoneId = value ? Number(value) : undefined;
    const newFilters = { ...filters, zone_id: zoneId };
    // Reset state and prison if zone changes
    if (filters.zone_id !== zoneId) {
      newFilters.assigned_state = undefined;
      newFilters.prison = undefined;
    }
    onFiltersChange(newFilters);
  };

  const handleStateChange = (value: string) => {
    const newFilters = { ...filters, assigned_state: value || undefined };
    // Reset prison if state changes
    if (filters.assigned_state !== value) {
      newFilters.prison = undefined;
    }
    onFiltersChange(newFilters);
  };

  // Filter states based on selected zone
  const filteredStates = React.useMemo(() => {
    const states = genericData?.states;
    if (!states) return [];
    if (!filters.zone_id) return states;
    return states.filter((state) => state.zone_id === Number(filters.zone_id));
  }, [genericData, filters.zone_id]);

  // Filter prisons based on selected zone and state
  const filteredPrisons = React.useMemo(() => {
    const prisons = genericData?.prisons;
    const states = genericData?.states;

    if (!prisons) return [];

    let filtered = prisons;

    // If zone is selected, filter by states in that zone
    if (filters.zone_id && states) {
      const statesInZone = states.filter(
        (state) => state.zone_id === Number(filters.zone_id),
      );
      const stateIdsInZone = statesInZone.map((s) => s.id);
      filtered = filtered.filter((prison) =>
        stateIdsInZone.includes(prison.state_id),
      );
    }

    // If state is selected, further filter by that state
    if (filters.assigned_state && states) {
      const selectedState = states.find(
        (state) => state.state === filters.assigned_state,
      );
      if (selectedState) {
        filtered = filtered.filter(
          (prison) => prison.state_id === selectedState.id,
        );
      }
    }

    return filtered;
  }, [genericData, filters.zone_id, filters.assigned_state]);

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
              placeholder="Search by name, service no, email, file no, ippis..."
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

        {/* Zone */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Zone
          </label>
          <select
            value={filters.zone_id || ""}
            onChange={(e) =>
              handleZoneChange(e.target.value ? Number(e.target.value) : "")
            }
            disabled={isLoadingGeneric}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 disabled:opacity-50"
          >
            <option value="">All Zones</option>
            {genericData?.zones?.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.zone}
              </option>
            ))}
          </select>
        </div>

        {/* Assigned State */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Assigned State
            {filters.zone_id && (
              <span className="ml-1 text-xs text-slate-500">
                (filtered by zone)
              </span>
            )}
          </label>
          <select
            value={filters.assigned_state || ""}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={isLoadingGeneric}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 disabled:opacity-50"
          >
            <option value="">
              {filters.zone_id ? `All States in Selected Zone` : "All States"}
            </option>
            {filteredStates.map((state) => (
              <option key={state.id} value={state.state}>
                {state.state}
              </option>
            ))}
          </select>
        </div>

        {/* Prison */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Custodial Center
            {(filters.zone_id || filters.assigned_state) && (
              <span className="ml-1 text-xs text-slate-500">(filtered)</span>
            )}
          </label>
          <select
            value={filters.prison || ""}
            onChange={(e) => handleFilterChange("prison", e.target.value)}
            disabled={isLoadingGeneric || !filters.assigned_state}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 disabled:opacity-50"
          >
            <option value="">
              {filters.assigned_state
                ? `All Centers in State`
                : "Select State First"}
            </option>
            {filteredPrisons.map((prison) => (
              <option key={prison.id} value={prison.prison_name}>
                {prison.prison_name}
              </option>
            ))}
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
          <select
            value={filters.present_rank || ""}
            onChange={(e) => handleFilterChange("present_rank", e.target.value)}
            disabled={isLoadingGeneric}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 disabled:opacity-50"
          >
            <option value="">All Ranks</option>
            {genericData?.rankings?.map((rank) => (
              <option key={rank.id} value={rank.title}>
                {rank.title}
              </option>
            ))}
          </select>
        </div>

        {/* Initial Rank */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Initial Rank
          </label>
          <select
            value={filters.initial_rank || ""}
            onChange={(e) => handleFilterChange("initial_rank", e.target.value)}
            disabled={isLoadingGeneric}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 disabled:opacity-50"
          >
            <option value="">All Ranks</option>
            {genericData?.rankings?.map((rank) => (
              <option key={rank.id} value={rank.title}>
                {rank.title}
              </option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Level
          </label>
          <select
            value={filters.level || ""}
            onChange={(e) =>
              handleFilterChange(
                "level",
                e.target.value ? Number(e.target.value) : "",
              )
            }
            disabled={isLoadingGeneric}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500 disabled:opacity-50"
          >
            <option value="">All Levels</option>
            {genericData?.levels?.map((level) => (
              <option key={level.id} value={level.level_number}>
                {level.level}
              </option>
            ))}
          </select>
        </div>

        {/* Age Range */}
        <div>
          <label className="block mb-1 text-sm font-medium text-slate-700">
            Age Range
          </label>
          <select
            value={filters.age_range || ""}
            onChange={(e) => handleFilterChange("age_range", e.target.value)}
            className="w-full px-3 py-2 text-sm transition-colors border rounded-lg border-slate-300 focus:ring-2 focus:ring-ncos-green-500 focus:border-ncos-green-500"
          >
            <option value="">All Ages</option>
            <option value="18-25">18 - 25 years</option>
            <option value="26-35">26 - 35 years</option>
            <option value="36-45">36 - 45 years</option>
            <option value="46-55">46 - 55 years</option>
            <option value="56-60">56 - 60 years</option>
            <option value="60+">60+ years</option>
          </select>
        </div>
      </div>
    </div>
  );
};
