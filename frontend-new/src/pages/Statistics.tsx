import React, { useState, useMemo } from "react";
import {
  Users,
  UserCheck,
  GraduationCap,
  Building2,
  Filter,
  X,
  RefreshCw,
  ChevronDown,
  FilterX,
  Clock,
  FileCheck,
  MapPin,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  StatCard,
  PieChartCard,
  BarChartCard,
  TrendChart,
  LazyStatSection,
  StatisticsPageSkeleton,
} from "@/components/statistics";
import {
  useAllStatistics,
  useAppointmentTrends,
  useGenericData,
  useAgeGroupsStats,
  usePrisonStats,
  useLgaStats,
  useRetirementEligibilityStats,
  usePromotionEligibilityStats,
  useDocumentVerificationStats,
  useDocumentExpiryStats,
  usePresentCommandStats,
  useInitialCommandStats,
  useInitialRankStats,
  useZoneStats,
  CHART_COLORS,
  type StatisticsFilters,
} from "@/lib/api/statistics";

// Age range options for filter
const AGE_RANGES = [
  { value: "under-18", label: "Under 18" },
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55-59", label: "55-59" },
  { value: "60+", label: "60+" },
];

// Year range for filters
const currentYear = new Date().getFullYear();
const YEARS = Array.from(
  { length: currentYear - 1960 + 1 },
  (_, i) => 1960 + i,
);

const Statistics: React.FC = () => {
  // Filter state
  const [filters, setFilters] = useState<StatisticsFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Track which lazy sections have been triggered
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set(),
  );

  const markSectionVisible = (section: string) => {
    setVisibleSections((prev) => new Set([...prev, section]));
  };

  // Core API queries (always loaded)
  const {
    data: allStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useAllStatistics(filters);

  const { data: appointmentTrends, isLoading: isLoadingTrends } =
    useAppointmentTrends(filters);

  const { data: genericData, isLoading: isLoadingGenericData } =
    useGenericData();

  // Lazy-loaded queries - only fetch when section becomes visible
  const { data: ageGroupsData, isLoading: isLoadingAgeGroups } =
    useAgeGroupsStats(filters, visibleSections.has("demographics"));

  const { data: retirementData, isLoading: isLoadingRetirement } =
    useRetirementEligibilityStats(filters, visibleSections.has("eligibility"));

  const { data: promotionData, isLoading: isLoadingPromotion } =
    usePromotionEligibilityStats(filters, visibleSections.has("eligibility"));

  const { data: prisonData, isLoading: isLoadingPrison } = usePrisonStats(
    filters,
    visibleSections.has("locations"),
  );

  const { data: lgaData, isLoading: isLoadingLga } = useLgaStats(
    filters,
    visibleSections.has("locations"),
  );

  const { data: zoneData, isLoading: isLoadingZone } = useZoneStats(
    filters,
    visibleSections.has("locations"),
  );

  const { data: presentCommandData, isLoading: isLoadingPresentCommand } =
    usePresentCommandStats(filters, visibleSections.has("commands"));

  const { data: initialCommandData, isLoading: isLoadingInitialCommand } =
    useInitialCommandStats(filters, visibleSections.has("commands"));

  const { data: initialRankData, isLoading: isLoadingInitialRank } =
    useInitialRankStats(filters, visibleSections.has("ranks"));

  const {
    data: documentVerificationData,
    isLoading: isLoadingDocVerification,
  } = useDocumentVerificationStats(filters, visibleSections.has("documents"));

  const { data: documentExpiryData, isLoading: isLoadingDocExpiry } =
    useDocumentExpiryStats(filters, visibleSections.has("documents"));

  // Handle filter changes
  const handleFilterChange = (key: keyof StatisticsFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  // Cascading filter handlers
  const handleZoneChange = (value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, zone_id: value || undefined };
      if (prev.zone_id !== value) {
        newFilters.state_of_origin = undefined;
        newFilters.assigned_state = undefined;
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  // Filter states based on selected zone
  const filteredStates = useMemo(() => {
    const states = genericData?.states;
    if (!states) return [];
    if (!filters.zone_id) return states;
    return states.filter((state) => state.zone_id === Number(filters.zone_id));
  }, [genericData, filters.zone_id]);

  // Filter prisons based on selected state
  const filteredPrisons = useMemo(() => {
    const prisons = genericData?.prisons;
    if (!prisons) return [];
    if (!filters.assigned_state) return prisons;
    const selectedState = genericData?.states.find(
      (s) => s.state === filters.assigned_state,
    );
    if (!selectedState) return prisons;
    return prisons.filter((prison) => prison.state_id === selectedState.id);
  }, [genericData, filters.assigned_state]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => v !== undefined && v !== "")
      .length;
  }, [filters]);

  const isLoading = isLoadingStats || isLoadingTrends || isLoadingGenericData;
  const overview = allStats?.overview;

  if ((isLoading && !allStats) || !genericData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Statistics</h1>
            <p className="mt-1 text-slate-500">
              Loading workforce analytics...
            </p>
          </div>
          <StatisticsPageSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="border border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 rounded-2xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Workforce Statistics
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Comprehensive analytics and insights
                {overview?.filters_applied && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Filtered view
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={
                  showFilters || activeFilterCount > 0 ? "outline" : "ghost"
                }
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`relative ${
                  activeFilterCount > 0
                    ? "border-ncos-green-500 text-ncos-green-700"
                    : ""
                }`}
                title={showFilters ? "Hide Filters" : "Show Filters"}
              >
                {showFilters ? (
                  <FilterX className="mr-1.5 w-4 h-4 text-red-700" />
                ) : (
                  <Filter className="mr-1.5 h-4 w-4" />
                )}
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ncos-green-600 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetchStats()}
                disabled={isLoading}
              >
                <RefreshCw
                  className={`mr-1.5 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-700">
                  Filter Statistics
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {/* Zone */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Zone
                  </label>
                  <div className="relative">
                    <select
                      value={filters.zone_id || ""}
                      onChange={(e) => handleZoneChange(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Zones</option>
                      {genericData?.zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.zone}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* State of Origin */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    State of Origin
                  </label>
                  <div className="relative">
                    <select
                      value={filters.state_of_origin || ""}
                      onChange={(e) =>
                        handleFilterChange("state_of_origin", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">
                        {filters.zone_id ? "All States in Zone" : "All States"}
                      </option>
                      {filteredStates.map((state) => (
                        <option key={state.id} value={state.state}>
                          {state.state}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Assigned State */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Assigned State
                  </label>
                  <div className="relative">
                    <select
                      value={filters.assigned_state || ""}
                      onChange={(e) =>
                        handleFilterChange("assigned_state", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">
                        {filters.zone_id ? "All States in Zone" : "All States"}
                      </option>
                      {filteredStates.map((state) => (
                        <option key={state.id} value={state.state}>
                          {state.state}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      value={filters.sex || ""}
                      onChange={(e) =>
                        handleFilterChange("sex", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Marital Status */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Marital Status
                  </label>
                  <div className="relative">
                    <select
                      value={filters.marital_status || ""}
                      onChange={(e) =>
                        handleFilterChange("marital_status", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Statuses</option>
                      {genericData?.marital_statuses.map((status) => (
                        <option key={status.id} value={status.name}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Present Rank */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Present Rank
                  </label>
                  <div className="relative">
                    <select
                      value={filters.present_rank || ""}
                      onChange={(e) =>
                        handleFilterChange("present_rank", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Ranks</option>
                      {genericData?.rankings.map((rank) => (
                        <option key={rank.id} value={rank.id}>
                          {rank.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Initial Rank */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Initial Rank
                  </label>
                  <div className="relative">
                    <select
                      value={filters.initial_rank || ""}
                      onChange={(e) =>
                        handleFilterChange("initial_rank", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Initial Ranks</option>
                      {genericData?.rankings.map((rank) => (
                        <option key={rank.id} value={rank.id}>
                          {rank.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Level */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Level
                  </label>
                  <div className="relative">
                    <select
                      value={filters.level || ""}
                      onChange={(e) =>
                        handleFilterChange("level", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Levels</option>
                      {genericData?.levels.map((level) => (
                        <option key={level.id} value={level.level_number}>
                          {level.level}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Prison */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Prison
                  </label>
                  <div className="relative">
                    <select
                      value={filters.prison || ""}
                      onChange={(e) =>
                        handleFilterChange("prison", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Prisons</option>
                      {filteredPrisons.map((prison) => (
                        <option key={prison.id} value={prison.id}>
                          {prison.prison_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Age Range */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Age Range
                  </label>
                  <div className="relative">
                    <select
                      value={filters.age_range || ""}
                      onChange={(e) =>
                        handleFilterChange("age_range", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Ages</option>
                      {AGE_RANGES.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Department
                  </label>
                  <input
                    type="text"
                    value={filters.department || ""}
                    onChange={(e) =>
                      handleFilterChange("department", e.target.value)
                    }
                    placeholder="Enter department..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Account Status
                  </label>
                  <div className="relative">
                    <select
                      value={filters.status || ""}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">All Statuses</option>
                      {[
                        { name: "Active", value: 1 },
                        { name: "Inactive", value: 0 },
                      ].map((status) => (
                        <option key={status.name} value={status.value}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Year From */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Appointment Year From
                  </label>
                  <div className="relative">
                    <select
                      value={filters.year_from || ""}
                      onChange={(e) =>
                        handleFilterChange("year_from", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">Any Year</option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                {/* Year To */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">
                    Appointment Year To
                  </label>
                  <div className="relative">
                    <select
                      value={filters.year_to || ""}
                      onChange={(e) =>
                        handleFilterChange("year_to", e.target.value)
                      }
                      className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 pr-8 text-sm focus:border-ncos-green-500 focus:outline-none focus:ring-1 focus:ring-ncos-green-500"
                    >
                      <option value="">Any Year</option>
                      {YEARS.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content with Tabs */}
      <div className="mx-auto max-w-7xl mt-6">
        {/* Overview Stats Cards - Always visible */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Staff"
            value={overview?.total_staff || 0}
            subtitle="All registered personnel"
            icon={Users}
            color="emerald"
            isLoading={isLoadingStats}
          />
          <StatCard
            title="With Details"
            value={overview?.staff_with_details || 0}
            subtitle="Complete profiles"
            icon={UserCheck}
            color="blue"
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Education Records"
            value={overview?.education_records || 0}
            subtitle="Qualifications tracked"
            icon={GraduationCap}
            color="violet"
            isLoading={isLoadingStats}
          />
          <StatCard
            title="Departments"
            value={allStats?.department?.length || 0}
            subtitle="Unique departments"
            icon={Building2}
            color="amber"
            isLoading={isLoadingStats}
          />
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <BarChart3 className="mr-1.5 h-4 w-4 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="demographics" className="text-xs sm:text-sm">
              <Users className="mr-1.5 h-4 w-4 hidden sm:block" />
              Demographics
            </TabsTrigger>
            <TabsTrigger value="locations" className="text-xs sm:text-sm">
              <MapPin className="mr-1.5 h-4 w-4 hidden sm:block" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="ranks" className="text-xs sm:text-sm">
              <GraduationCap className="mr-1.5 h-4 w-4 hidden sm:block" />
              Ranks
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="text-xs sm:text-sm">
              <Clock className="mr-1.5 h-4 w-4 hidden sm:block" />
              Eligibility
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              <FileCheck className="mr-1.5 h-4 w-4 hidden sm:block" />
              Documents
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Gender & Marital Status Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <PieChartCard
                title="Gender Distribution"
                subtitle="Staff breakdown by gender"
                data={allStats?.gender || []}
                colors={CHART_COLORS.gender}
                isLoading={isLoadingStats}
              />
              <PieChartCard
                title="Marital Status"
                subtitle="Distribution by marital status"
                data={allStats?.marital_status || []}
                colors={CHART_COLORS.maritalStatus}
                isLoading={isLoadingStats}
              />
            </div>

            {/* Department & Status */}
            <div className="grid gap-6 lg:grid-cols-2">
              <BarChartCard
                title="Department Distribution"
                subtitle="Staff across departments"
                data={allStats?.department || []}
                colors={CHART_COLORS.rank}
                isLoading={isLoadingStats}
                maxItems={10}
                height={350}
              />
              <PieChartCard
                title="Staff Status"
                subtitle="Active, retired, and other statuses"
                data={allStats?.staff_status || []}
                colors={CHART_COLORS.primary}
                isLoading={isLoadingStats}
                innerRadius={50}
                outerRadius={85}
              />
            </div>

            {/* Appointment Trends */}
            <TrendChart
              title="Appointment Trends"
              subtitle="Staff appointments over time"
              yearlyData={
                appointmentTrends?.by_year ||
                allStats?.appointment_by_year ||
                []
              }
              monthlyData={
                appointmentTrends?.by_month ||
                allStats?.appointment_by_month ||
                []
              }
              isLoading={isLoadingTrends && isLoadingStats}
              height={380}
            />

            {/* Appointment Summary */}
            {appointmentTrends?.summary && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Appointment Summary
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">
                      With Appointment Date
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">
                      {appointmentTrends.summary.with_date.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">Without Date</p>
                    <p className="mt-1 text-2xl font-bold text-amber-600">
                      {appointmentTrends.summary.without_date.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">
                      Earliest Appointment
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {appointmentTrends.summary.earliest
                        ? new Date(
                            appointmentTrends.summary.earliest,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm text-slate-500">Latest Appointment</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {appointmentTrends.summary.latest
                        ? new Date(
                            appointmentTrends.summary.latest,
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Demographics Tab */}
          <TabsContent value="demographics" className="space-y-6">
            <LazyStatSection
              title="Age & Education Distribution"
              onVisible={() => markSectionVisible("demographics")}
              isLoading={isLoadingAgeGroups}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <PieChartCard
                  title="Age Distribution"
                  subtitle="Staff by age groups"
                  data={ageGroupsData || allStats?.age_groups || []}
                  colors={CHART_COLORS.ageGroups}
                  isLoading={isLoadingAgeGroups}
                />
                <BarChartCard
                  title="Education Type"
                  subtitle="Qualification distribution"
                  data={allStats?.education_type || []}
                  colors={CHART_COLORS.education}
                  isLoading={isLoadingStats}
                  layout="vertical"
                  maxItems={8}
                  height={300}
                />
              </div>
            </LazyStatSection>

            <div className="grid gap-6 lg:grid-cols-2">
              <BarChartCard
                title="Grade Level"
                subtitle="Staff by grade level"
                data={allStats?.level || []}
                colors={CHART_COLORS.primary}
                isLoading={isLoadingStats}
                layout="vertical"
                maxItems={12}
                height={300}
              />
              <PieChartCard
                title="Gender Distribution"
                subtitle="Staff breakdown by gender"
                data={allStats?.gender || []}
                colors={CHART_COLORS.gender}
                isLoading={isLoadingStats}
              />
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-6">
            <LazyStatSection
              title="Geographic Distribution"
              onVisible={() => markSectionVisible("locations")}
              isLoading={isLoadingPrison || isLoadingLga || isLoadingZone}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <BarChartCard
                  title="State of Origin"
                  subtitle="Where staff come from"
                  data={allStats?.state_of_origin || []}
                  colors={CHART_COLORS.states}
                  isLoading={isLoadingStats}
                  maxItems={10}
                  height={350}
                />
                <BarChartCard
                  title="Assigned State"
                  subtitle="Where staff are deployed"
                  data={allStats?.assigned_state || []}
                  colors={CHART_COLORS.states}
                  isLoading={isLoadingStats}
                  maxItems={10}
                  height={350}
                />
              </div>
            </LazyStatSection>

            <div className="grid gap-6 lg:grid-cols-2">
              <BarChartCard
                title="Zone Distribution"
                subtitle="Staff by geopolitical zone"
                data={zoneData || allStats?.zone || []}
                colors={CHART_COLORS.states}
                isLoading={isLoadingZone}
                maxItems={8}
                height={300}
              />
              <BarChartCard
                title="Prison Distribution"
                subtitle="Staff by prison assignment"
                data={prisonData || allStats?.prison || []}
                colors={CHART_COLORS.prison}
                isLoading={isLoadingPrison}
                maxItems={10}
                height={300}
              />
            </div>

            <BarChartCard
              title="LGA Distribution"
              subtitle="Staff by Local Government Area"
              data={lgaData || allStats?.lga || []}
              colors={CHART_COLORS.lga}
              isLoading={isLoadingLga}
              maxItems={15}
              height={400}
            />

            <LazyStatSection
              title="Command Distribution"
              onVisible={() => markSectionVisible("commands")}
              isLoading={isLoadingPresentCommand || isLoadingInitialCommand}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <BarChartCard
                  title="Present Command"
                  subtitle="Current command/unit assignments"
                  data={presentCommandData || []}
                  colors={CHART_COLORS.states}
                  isLoading={isLoadingPresentCommand}
                  maxItems={10}
                  height={350}
                />
                <BarChartCard
                  title="Initial Command"
                  subtitle="Original command/unit assignments"
                  data={initialCommandData || []}
                  colors={CHART_COLORS.states}
                  isLoading={isLoadingInitialCommand}
                  maxItems={10}
                  height={350}
                />
              </div>
            </LazyStatSection>
          </TabsContent>

          {/* Ranks Tab */}
          <TabsContent value="ranks" className="space-y-6">
            <BarChartCard
              title="Present Rank Distribution"
              subtitle="Staff count by current rank"
              data={allStats?.present_rank || []}
              colors={CHART_COLORS.rank}
              isLoading={isLoadingStats}
              maxItems={15}
              height={400}
            />

            <LazyStatSection
              title="Initial Rank Statistics"
              onVisible={() => markSectionVisible("ranks")}
              isLoading={isLoadingInitialRank}
            >
              <BarChartCard
                title="Initial Rank Distribution"
                subtitle="Staff by rank at appointment"
                data={initialRankData || allStats?.initial_rank || []}
                colors={CHART_COLORS.rank}
                isLoading={isLoadingInitialRank}
                maxItems={15}
                height={400}
              />
            </LazyStatSection>
          </TabsContent>

          {/* Eligibility Tab */}
          <TabsContent value="eligibility" className="space-y-6">
            <LazyStatSection
              title="Staff Eligibility Status"
              onVisible={() => markSectionVisible("eligibility")}
              isLoading={isLoadingRetirement || isLoadingPromotion}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <PieChartCard
                  title="Retirement Eligibility"
                  subtitle="Staff retirement status (57+ years eligible)"
                  data={
                    retirementData || allStats?.retirement_eligibility || []
                  }
                  colors={CHART_COLORS.eligibility}
                  isLoading={isLoadingRetirement}
                />
                <PieChartCard
                  title="Promotion Eligibility"
                  subtitle="Staff promotion status (3+ years in rank)"
                  data={promotionData || allStats?.promotion_eligibility || []}
                  colors={CHART_COLORS.eligibility}
                  isLoading={isLoadingPromotion}
                />
              </div>
            </LazyStatSection>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {retirementData?.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {item.count.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.percentage.toFixed(1)}% of staff
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <LazyStatSection
              title="Document Status"
              onVisible={() => markSectionVisible("documents")}
              isLoading={isLoadingDocVerification || isLoadingDocExpiry}
            >
              <div className="grid gap-6 lg:grid-cols-2">
                <PieChartCard
                  title="Document Verification"
                  subtitle="Verification status of staff documents"
                  data={documentVerificationData || []}
                  colors={CHART_COLORS.documents}
                  isLoading={isLoadingDocVerification}
                />
                <PieChartCard
                  title="Document Expiry"
                  subtitle="Expiry status of staff documents"
                  data={documentExpiryData || []}
                  colors={CHART_COLORS.documents}
                  isLoading={isLoadingDocExpiry}
                />
              </div>
            </LazyStatSection>

            {/* Document Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {documentVerificationData?.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {item.count.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.percentage.toFixed(1)}% of documents
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Statistics;
