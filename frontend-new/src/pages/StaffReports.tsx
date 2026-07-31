import { StaffReportDetailModal, StaffReportExportModal, StaffReportFilters, StaffReportSummaryView, StaffReportTable } from "@/components/staff-reports";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStaffReport, useStaffReportOptions, type StaffReportCriteria, type StaffReportRequest, type StaffReportRow } from "@/lib/api/staff-reports";
import { BarChart3, Download, FileBarChart, List, PanelLeftOpen, RefreshCw, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";

type ReportView = "summary" | "details";
const initialCriteria: StaffReportCriteria = {};

function describeFilters(criteria: StaffReportCriteria, options: ReturnType<typeof useStaffReportOptions>["data"]) {
  if (!options) return [];
  const filters: Array<{ key: keyof StaffReportCriteria; label: string }> = [];
  const optionFilters: Array<[keyof StaffReportCriteria, string, typeof options.statuses]> = [
    ["statuses", "Account status", options.statuses], ["staff_status_ids", "Staff status", options.staff_statuses],
    ["sex", "Sex", options.sex], ["directorate_ids", "Directorate", options.directorates],
    ["work_distribution_ids", "Work distribution", options.work_distributions], ["training_institute_ids", "Training institute", options.training_institutes],
    ["rank_ids", "Rank", options.rankings], ["levels", "Level", options.levels], ["zone_ids", "Zone", options.zones],
    ["prison_ids", "Custodial centre", options.prisons], ["departments", "Department", options.departments],
    ["blood_groups", "Blood group", options.blood_groups], ["genotypes", "Genotype", options.genotypes],
    ["marital_statuses", "Marital status", options.marital_statuses], ["missing_fields", "Missing", options.missing_fields],
  ];

  if (criteria.search) filters.push({ key: "search", label: `Search: ${criteria.search}` });
  optionFilters.forEach(([key, label, choices]) => {
    const value = (criteria[key] as Array<number | string> | undefined)?.[0];
    if (value !== undefined) filters.push({ key, label: `${label}: ${choices.find((choice) => String(choice.id) === String(value))?.name ?? value}` });
  });
  if (criteria.age?.min !== undefined || criteria.age?.max !== undefined) filters.push({ key: "age", label: `Age: ${criteria.age.min ?? "any"}–${criteria.age.max ?? "any"}` });

  const dates: Array<[keyof StaffReportCriteria, string, { from?: string; to?: string } | undefined]> = [
    ["appointment_date", "First appointment", criteria.appointment_date], ["date_of_birth", "Date of birth", criteria.date_of_birth],
    ["last_login", "Last login", criteria.last_login], ["record_created", "Record created", criteria.record_created],
  ];
  dates.forEach(([key, label, value]) => {
    if (value?.from || value?.to) filters.push({ key, label: `${label}: ${value.from ?? "any"} to ${value.to ?? "any"}` });
  });

  const booleans: Array<[keyof StaffReportCriteria, string, boolean | undefined]> = [
    ["verified", "Verified", criteria.verified], ["has_email", "Has email", criteria.has_email],
    ["has_photo", "Has photo", criteria.has_photo], ["has_education", "Has education", criteria.has_education],
  ];
  booleans.forEach(([key, label, value]) => {
    if (value !== undefined) filters.push({ key, label: `${label}: ${value ? "Yes" : "No"}` });
  });
  if (criteria.never_logged_in) filters.push({ key: "never_logged_in", label: "Never logged in" });

  return filters;
}

export default function StaffReports() {
  const [draft, setDraft] = useState<StaffReportCriteria>(initialCriteria);
  const [applied, setApplied] = useState<StaffReportCriteria>(initialCriteria);
  const [activeView, setActiveView] = useState<ReportView>("summary");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ field: "service_no", direction: "asc" as "asc" | "desc" });
  const [selected, setSelected] = useState<StaffReportRow>();
  const [showExport, setShowExport] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const { data: options, isLoading: loadingOptions, isError: optionsError, refetch: refetchOptions } = useStaffReportOptions();
  const request = useMemo<StaffReportRequest>(() => ({ criteria: applied, include: [activeView], page: { number: page, size: 25 }, sort: [sort] }), [activeView, applied, page, sort]);
  const { data: report, isLoading, isFetching, isError, refetch } = useStaffReport(request, Boolean(options));
  const resultCount = report?.data.summary?.total_staff ?? report?.data.details?.pagination.total ?? 0;
  const appliedFilters = useMemo(() => describeFilters(applied, options), [applied, options]);

  const apply = () => { setApplied(draft); setPage(1); };
  const reset = () => { setDraft({}); setApplied({}); setPage(1); };
  const removeFilter = (key: keyof StaffReportCriteria) => {
    setApplied((current) => { const next = { ...current }; delete next[key]; return next; });
    setDraft((current) => { const next = { ...current }; delete next[key]; return next; });
    setPage(1);
  };
  const changeSort = (field: string) => { setSort((current) => ({ field, direction: current.field === field && current.direction === "asc" ? "desc" : "asc" })); setPage(1); };

  if (loadingOptions) return <div className="space-y-5"><div className="h-24 animate-pulse rounded-2xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div>;
  if (optionsError || !options) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><h1 className="text-lg font-semibold text-red-800">Staff reports are unavailable</h1><p className="mt-1 text-sm text-red-600">You may not have report access, or the options could not be loaded.</p><Button className="mt-4" size="sm" onClick={() => refetchOptions()}>Try again</Button></div>;

  return <div className="space-y-5 pb-8">
    <header className="flex flex-col gap-4 rounded-2xl bg-linear-to-r from-ncos-green-950 to-ncos-green-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-white/10 p-3"><FileBarChart className="h-7 w-7" /></div><div><h1 className="text-2xl font-bold sm:text-3xl">Staff reports</h1><p className="mt-1 text-sm text-white/70">Scoped workforce statistics, details and documents</p>{report?.meta ? <p className="mt-2 text-xs text-white/55">{report.meta.scope} · Generated {new Date(report.meta.generated_at).toLocaleString()}</p> : null}</div></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" className="border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={() => setFiltersOpen((visible) => !visible)}><PanelLeftOpen className="mr-2 h-4 w-4" />{filtersOpen ? "Hide filters" : "Show filters"}{appliedFilters.length > 0 ? <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">{appliedFilters.length}</span> : null}</Button><Button variant="outline" size="sm" className="border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={() => refetch()}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Refresh</Button><Button variant="secondary" size="sm" onClick={() => setShowExport(true)} disabled={!resultCount}><Download className="mr-2 h-4 w-4" />Export</Button></div>
    </header>
    <div className={`grid items-start gap-5 ${filtersOpen ? "lg:grid-cols-[20rem_minmax(0,1fr)]" : "grid-cols-1"}`}>
      {filtersOpen ? <StaffReportFilters draft={draft} applied={applied} options={options} onChange={setDraft} onApply={apply} onReset={reset} onClose={() => setFiltersOpen(false)} /> : null}
      <main className="min-w-0 space-y-4">
        {appliedFilters.length > 0 ? <section className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="Applied filters"><span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Applied</span>{appliedFilters.map((filter) => <button key={filter.key} type="button" onClick={() => removeFilter(filter.key)} className="inline-flex items-center gap-1.5 rounded-full border border-ncos-green-200 bg-ncos-green-50 px-3 py-1.5 text-xs font-medium text-ncos-green-900 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ncos-green-300" aria-label={`Remove ${filter.label} filter`}>{filter.label}<X className="h-3.5 w-3.5" /></button>)}<button type="button" onClick={reset} className="ml-auto px-2 py-1 text-xs font-semibold text-slate-500 hover:text-red-700">Clear all</button></section> : null}
        <Tabs value={activeView} onValueChange={(value) => { setActiveView(value as ReportView); setPage(1); }}>
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:justify-between"><TabsList ariaLabel="Report view" className="w-full sm:w-auto"><TabsTrigger value="summary" className="flex-1 sm:flex-none"><BarChart3 className="mr-2 h-4 w-4" />Statistics</TabsTrigger><TabsTrigger value="details" className="flex-1 sm:flex-none"><List className="mr-2 h-4 w-4" />Details</TabsTrigger></TabsList><p className="px-2 text-xs text-slate-500">{resultCount.toLocaleString()} matching staff</p></div>
          {isError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p className="font-semibold">The report could not be generated.</p><button className="mt-2 underline" onClick={() => refetch()}>Retry this request</button></div> : null}
          <div ref={captureRef} className="mt-4 bg-slate-50/50">
            <TabsContent value="summary">{isLoading || !report?.data.summary ? <div className="grid gap-3 sm:grid-cols-3"><div className="h-28 animate-pulse rounded-xl bg-slate-100" /><div className="h-28 animate-pulse rounded-xl bg-slate-100" /><div className="h-28 animate-pulse rounded-xl bg-slate-100" /></div> : <StaffReportSummaryView summary={report.data.summary} />}</TabsContent>
            <TabsContent value="details">{report?.data.details ? <section className="space-y-3"><div><h2 className="text-lg font-bold text-slate-900">Staff details</h2><p className="text-sm text-slate-500">{report.data.details.pagination.total.toLocaleString()} matching records</p></div><StaffReportTable details={report.data.details} isFetching={isFetching} sortField={sort.field} sortDirection={sort.direction} onSort={changeSort} onPageChange={setPage} onView={setSelected} /></section> : <div className="h-64 animate-pulse rounded-xl bg-slate-100" />}</TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
    <StaffReportDetailModal serviceNo={selected?.id} onClose={() => setSelected(undefined)} />
    <StaffReportExportModal isOpen={showExport} onClose={() => setShowExport(false)} columns={options.columns} formats={options.formats} request={request} captureTarget={captureRef} activeView={activeView} />
  </div>;
}
