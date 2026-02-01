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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  StatCard,
  PieChartCard,
  BarChartCard,
  TrendChart,
  StatisticsPageSkeleton,
} from "@/components/statistics";
import {
  useAllStatistics,
  useAppointmentTrends,
  useGenericData,
  CHART_COLORS,
  type StatisticsFilters,
} from "@/lib/api/statistics";

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

  // API queries
  const {
    data: allStats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useAllStatistics(filters);

  const { data: appointmentTrends, isLoading: isLoadingTrends } =
    useAppointmentTrends(filters);

  const { data: genericData, isLoading: isLoadingGenericData } =
    useGenericData();

  // Handle filter changes
  const handleFilterChange = (key: keyof StatisticsFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => v !== undefined && v !== "")
      .length;
  }, [filters]);

  const isLoading = isLoadingStats || isLoadingTrends || isLoadingGenericData;

  // Overview stats
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
              >
                <Filter className="mr-1.5 h-4 w-4" />
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
                      onChange={(e) =>
                        handleFilterChange("zone_id", e.target.value)
                      }
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
                      <option value="">All States</option>
                      {genericData?.states.map((state) => (
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
                      <option value="">All States</option>
                      {genericData?.states.map((state) => (
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
                        <option key={rank.id} value={rank.title}>
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

      {/* Main Content */}
      <div className="mx-auto max-w-7xl mt-6">
        {/* Overview Stats Cards */}
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

        {/* Gender & Marital Status Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
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

        {/* Rank Distribution - Full Width */}
        <div className="mb-8">
          <BarChartCard
            title="Rank Distribution"
            subtitle="Staff count by current rank"
            data={allStats?.present_rank || []}
            colors={CHART_COLORS.rank}
            isLoading={isLoadingStats}
            maxItems={15}
            height={400}
          />
        </div>

        {/* State Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
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

        {/* Appointment Trends */}
        <div className="mb-8">
          <TrendChart
            title="Appointment Trends"
            subtitle="Staff appointments over time"
            yearlyData={
              appointmentTrends?.by_year || allStats?.appointment_by_year || []
            }
            monthlyData={
              appointmentTrends?.by_month ||
              allStats?.appointment_by_month ||
              []
            }
            isLoading={isLoadingTrends && isLoadingStats}
            height={380}
          />
        </div>

        {/* Education & Level Distribution */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
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

        {/* Appointment Trends Summary */}
        {appointmentTrends?.summary && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Appointment Summary
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">With Appointment Date</p>
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
                <p className="text-sm text-slate-500">Earliest Appointment</p>
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
      </div>
    </div>
  );
};

export default Statistics;
