import { Button } from "@/components/ui/button";
import { StaffReportDetailModal, StaffReportExportModal, StaffReportFilters, StaffReportSummaryView, StaffReportTable } from "@/components/staff-reports";
import { useStaffReport, useStaffReportOptions, type StaffReportCriteria, type StaffReportRequest, type StaffReportRow } from "@/lib/api/staff-reports";
import { Download, FileBarChart, RefreshCw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

const initialCriteria: StaffReportCriteria = {};

export default function StaffReports() {
  const [draft, setDraft] = useState<StaffReportCriteria>(initialCriteria);
  const [applied, setApplied] = useState<StaffReportCriteria>(initialCriteria);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ field: "service_no", direction: "asc" as "asc" | "desc" });
  const [selected, setSelected] = useState<StaffReportRow>();
  const [showExport, setShowExport] = useState(false);
  const { data: options, isLoading: loadingOptions, isError: optionsError, refetch: refetchOptions } = useStaffReportOptions();
  const request = useMemo<StaffReportRequest>(() => ({ criteria: applied, include: ["summary", "details"], page: { number: page, size: 25 }, sort: [sort] }), [applied, page, sort]);
  const { data: report, isLoading, isFetching, isError, refetch } = useStaffReport(request, Boolean(options));

  const apply = () => { setApplied(draft); setPage(1); };
  const reset = () => { setDraft({}); setApplied({}); setPage(1); };
  const changeSort = (field: string) => { setSort((current) => ({ field, direction: current.field === field && current.direction === "asc" ? "desc" : "asc" })); setPage(1); };

  if (loadingOptions) return <div className="space-y-5"><div className="h-24 animate-pulse rounded-2xl bg-slate-100" /><div className="h-64 animate-pulse rounded-2xl bg-slate-100" /></div>;
  if (optionsError || !options) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><h1 className="text-lg font-semibold text-red-800">Staff reports are unavailable</h1><p className="mt-1 text-sm text-red-600">You may not have report access, or the options could not be loaded.</p><Button className="mt-4" size="sm" onClick={() => refetchOptions()}>Try again</Button></div>;

  return <div className="space-y-6 pb-8">
    <header className="flex flex-col gap-4 rounded-2xl bg-linear-to-r from-ncos-green-950 to-ncos-green-800 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-white/10 p-3"><FileBarChart className="h-7 w-7" /></div><div><h1 className="text-2xl font-bold sm:text-3xl">Staff reports</h1><p className="mt-1 text-sm text-white/70">Scoped workforce totals, details and export</p>{report?.meta ? <p className="mt-2 text-xs text-white/55">{report.meta.scope} · Generated {new Date(report.meta.generated_at).toLocaleString()}</p> : null}</div></div>
      <div className="flex gap-2"><Button variant="outline" size="sm" className="border-white/25 bg-white/10 text-white hover:bg-white/20" onClick={() => refetch()}><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Refresh</Button><Button variant="secondary" size="sm" onClick={() => setShowExport(true)} disabled={!report?.data.details?.pagination.total}><Download className="mr-2 h-4 w-4" />Export</Button></div>
    </header>
    <StaffReportFilters draft={draft} options={options} onChange={setDraft} onApply={apply} onReset={reset} />
    {isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p className="font-semibold">The report could not be generated.</p><button className="mt-2 underline" onClick={() => refetch()}>Retry this request</button></div> : null}
    {isLoading ? <div className="grid gap-3 sm:grid-cols-3"><div className="h-28 animate-pulse rounded-xl bg-slate-100" /><div className="h-28 animate-pulse rounded-xl bg-slate-100" /><div className="h-28 animate-pulse rounded-xl bg-slate-100" /></div> : null}
    {report?.data.summary ? <StaffReportSummaryView summary={report.data.summary} /> : null}
    {report?.data.details ? <section className="space-y-3"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-slate-900">Staff details</h2><p className="text-sm text-slate-500">{report.data.details.pagination.total.toLocaleString()} matching records</p></div><SlidersHorizontal className="h-5 w-5 text-slate-400" /></div><StaffReportTable details={report.data.details} isFetching={isFetching} sortField={sort.field} sortDirection={sort.direction} onSort={changeSort} onPageChange={setPage} onView={setSelected} /></section> : null}
    <StaffReportDetailModal serviceNo={selected?.id} onClose={() => setSelected(undefined)} />
    <StaffReportExportModal isOpen={showExport} onClose={() => setShowExport(false)} columns={options.columns} request={request} />
  </div>;
}
