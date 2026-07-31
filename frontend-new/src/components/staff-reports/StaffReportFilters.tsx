import { Button } from "@/components/ui/button";
import type { ReportOption, StaffReportCriteria, StaffReportOptions } from "@/lib/api/staff-reports";
import { ChevronDown, Filter, RotateCcw, Search, X } from "lucide-react";

type Props = {
  draft: StaffReportCriteria;
  applied: StaffReportCriteria;
  options: StaffReportOptions;
  onChange: (criteria: StaffReportCriteria) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const controlClass = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-ncos-green-600 focus:ring-2 focus:ring-ncos-green-100";
const selectValue = (value?: Array<number | string>) => value?.[0] === undefined ? "" : String(value[0]);

function ReportSelect({ label, value, options, onChange }: { label: string; value: string; options: ReportOption[]; onChange: (value: string) => void }) {
  const hasOptions = options.length > 0;
  return <label className="block space-y-1.5 text-sm text-slate-700"><span className="font-medium">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={`${controlClass} disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`} disabled={!hasOptions}><option value="">{hasOptions ? "All" : "No values available"}</option>{options.map((option) => <option key={String(option.id)} value={String(option.id)}>{option.name}</option>)}</select></label>;
}

function BooleanSelect({ label, value, onChange }: { label: string; value?: boolean; onChange: (value?: boolean) => void }) {
  return <label className="block space-y-1.5 text-sm text-slate-700"><span className="font-medium">{label}</span><select value={value === undefined ? "" : String(value)} onChange={(event) => onChange(event.target.value === "" ? undefined : event.target.value === "true")} className={controlClass}><option value="">Any</option><option value="true">Yes</option><option value="false">No</option></select></label>;
}

function DateRange({ label, value, onChange }: { label: string; value?: { from?: string; to?: string }; onChange: (value?: { from?: string; to?: string }) => void }) {
  const update = (key: "from" | "to", next: string) => {
    const range = { ...value, [key]: next || undefined };
    onChange(range.from || range.to ? range : undefined);
  };
  return <fieldset className="space-y-2"><legend className="text-sm font-semibold text-slate-800">{label}</legend><div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-xs text-slate-500"><span>From</span><input type="date" value={value?.from ?? ""} onChange={(event) => update("from", event.target.value)} className={controlClass} /></label><label className="space-y-1 text-xs text-slate-500"><span>To</span><input type="date" value={value?.to ?? ""} onChange={(event) => update("to", event.target.value)} className={controlClass} /></label></div></fieldset>;
}

function AgeRange({ value, onChange }: { value?: { min?: number; max?: number }; onChange: (value?: { min?: number; max?: number }) => void }) {
  const update = (key: "min" | "max", next: string) => {
    const range = { ...value, [key]: next === "" ? undefined : Number(next) };
    onChange(range.min !== undefined || range.max !== undefined ? range : undefined);
  };
  return <fieldset className="space-y-2"><legend className="text-sm font-semibold text-slate-800">Age</legend><div className="grid grid-cols-2 gap-2"><label className="space-y-1 text-xs text-slate-500"><span>Minimum</span><input type="number" min={15} max={100} value={value?.min ?? ""} onChange={(event) => update("min", event.target.value)} placeholder="e.g. 25" className={controlClass} /></label><label className="space-y-1 text-xs text-slate-500"><span>Maximum</span><input type="number" min={15} max={100} value={value?.max ?? ""} onChange={(event) => update("max", event.target.value)} placeholder="e.g. 45" className={controlClass} /></label></div></fieldset>;
}

function hasFilterValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.values(value).some((item) => item !== undefined && item !== "");
  return value !== undefined && value !== "";
}

function countFilters(criteria: StaffReportCriteria, keys?: Array<keyof StaffReportCriteria>) {
  return (keys ?? Object.keys(criteria) as Array<keyof StaffReportCriteria>).filter((key) => hasFilterValue(criteria[key])).length;
}

function FilterGroup({ title, count, children, open = false }: { title: string; count: number; children: React.ReactNode; open?: boolean }) {
  return <details open={open} className="group border-b border-slate-100 pb-3"><summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-1 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 marker:hidden hover:text-slate-900"><span className="flex-1">{title}</span>{count > 0 ? <span className="rounded-full bg-ncos-green-100 px-2 py-0.5 text-[11px] text-ncos-green-800">{count}</span> : null}<ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" /></summary><div className="space-y-3 px-1 pt-2">{children}</div></details>;
}

export function StaffReportFilters({ draft, applied, options, onChange, onApply, onReset, onClose }: Props) {
  const setNumeric = (key: keyof StaffReportCriteria, value: string) => onChange({ ...draft, [key]: value ? [Number(value)] : undefined });
  const setString = (key: keyof StaffReportCriteria, value: string) => onChange({ ...draft, [key]: value ? [value] : undefined });
  const setBoolean = (key: keyof StaffReportCriteria, value?: boolean) => onChange({ ...draft, [key]: value });
  const activeCount = countFilters(draft);
  const hasChanges = JSON.stringify(draft) !== JSON.stringify(applied);
  const employmentCount = countFilters(draft, ["statuses", "staff_status_ids", "rank_ids", "levels", "sex", "age", "appointment_date", "date_of_birth"]);
  const personalCount = countFilters(draft, ["blood_groups", "genotypes", "marital_statuses"]);
  const organizationCount = countFilters(draft, ["directorate_ids", "departments", "work_distribution_ids", "training_institute_ids", "zone_ids", "prison_ids"]);
  const qualityCount = countFilters(draft, ["missing_fields", "verified", "has_email", "has_photo", "has_education", "never_logged_in", "last_login", "record_created"]);
  const quickFilterClass = "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ncos-green-300";

  return <aside className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-5">
    <form onSubmit={(event) => { event.preventDefault(); onApply(); }}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-2"><Filter className="h-4 w-4 text-ncos-green-700" /><div><div className="flex items-center gap-2"><h2 className="font-semibold text-slate-900">Report filters</h2>{activeCount > 0 ? <span className="rounded-full bg-ncos-green-100 px-2 py-0.5 text-xs font-semibold text-ncos-green-800">{activeCount}</span> : null}</div><p className="text-xs text-slate-500">Choose only what you need</p></div></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ncos-green-300" aria-label="Hide report filters"><X className="h-4 w-4" /></button></div>
      <div className="max-h-[calc(100vh-15rem)] space-y-3 overflow-y-auto px-4 py-3">
        <label className="block space-y-1.5 text-sm text-slate-700"><span className="font-medium">Search staff</span><div className="relative"><Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /><input value={draft.search ?? ""} onChange={(event) => onChange({ ...draft, search: event.target.value || undefined })} placeholder="Name, service no., email..." className={`${controlClass} pl-10`} /></div></label>
        <div className="space-y-2 rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-600">Quick filters</p><div className="flex flex-wrap gap-2"><button type="button" aria-pressed={draft.statuses?.[0] === 1} className={`${quickFilterClass} ${draft.statuses?.[0] === 1 ? "border-ncos-green-600 bg-ncos-green-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-ncos-green-300"}`} onClick={() => onChange({ ...draft, statuses: draft.statuses?.[0] === 1 ? undefined : [1] })}>Active staff</button><button type="button" aria-pressed={draft.never_logged_in === true} className={`${quickFilterClass} ${draft.never_logged_in ? "border-ncos-green-600 bg-ncos-green-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-ncos-green-300"}`} onClick={() => setBoolean("never_logged_in", draft.never_logged_in ? undefined : true)}>Never logged in</button><button type="button" aria-pressed={draft.missing_fields?.[0] === "education"} className={`${quickFilterClass} ${draft.missing_fields?.[0] === "education" ? "border-ncos-green-600 bg-ncos-green-700 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-ncos-green-300"}`} onClick={() => onChange({ ...draft, missing_fields: draft.missing_fields?.[0] === "education" ? undefined : ["education"] })}>Missing education</button></div></div>
        {hasChanges ? <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">You have changes that have not been applied.</p> : null}
        <FilterGroup title="Employment" count={employmentCount} open>
          <ReportSelect label="Account status" value={selectValue(draft.statuses)} options={options.statuses} onChange={(value) => setNumeric("statuses", value)} />
          <ReportSelect label="Staff status" value={selectValue(draft.staff_status_ids)} options={options.staff_statuses} onChange={(value) => setNumeric("staff_status_ids", value)} />
          <ReportSelect label="Present rank" value={selectValue(draft.rank_ids)} options={options.rankings} onChange={(value) => setNumeric("rank_ids", value)} />
          <ReportSelect label="Level" value={selectValue(draft.levels)} options={options.levels} onChange={(value) => setNumeric("levels", value)} />
          <ReportSelect label="Sex" value={selectValue(draft.sex)} options={options.sex} onChange={(value) => setString("sex", value)} />
          <AgeRange value={draft.age} onChange={(value) => onChange({ ...draft, age: value })} />
          <DateRange label="First appointment" value={draft.appointment_date} onChange={(value) => onChange({ ...draft, appointment_date: value })} />
          <DateRange label="Date of birth" value={draft.date_of_birth} onChange={(value) => onChange({ ...draft, date_of_birth: value })} />
        </FilterGroup>
        <FilterGroup title="Personal & medical" count={personalCount}>
          <ReportSelect label="Blood group" value={selectValue(draft.blood_groups)} options={options.blood_groups} onChange={(value) => setString("blood_groups", value)} />
          <ReportSelect label="Genotype" value={selectValue(draft.genotypes)} options={options.genotypes} onChange={(value) => setString("genotypes", value)} />
          <ReportSelect label="Marital status" value={selectValue(draft.marital_statuses)} options={options.marital_statuses} onChange={(value) => setString("marital_statuses", value)} />
        </FilterGroup>
        <FilterGroup title="Organization & location" count={organizationCount}>
          <ReportSelect label="Directorate" value={selectValue(draft.directorate_ids)} options={options.directorates} onChange={(value) => setNumeric("directorate_ids", value)} />
          <ReportSelect label="Department" value={selectValue(draft.departments)} options={options.departments} onChange={(value) => setString("departments", value)} />
          <ReportSelect label="Work distribution" value={selectValue(draft.work_distribution_ids)} options={options.work_distributions} onChange={(value) => setNumeric("work_distribution_ids", value)} />
          <ReportSelect label="Training institute" value={selectValue(draft.training_institute_ids)} options={options.training_institutes} onChange={(value) => setNumeric("training_institute_ids", value)} />
          <ReportSelect label="Zone" value={selectValue(draft.zone_ids)} options={options.zones} onChange={(value) => setNumeric("zone_ids", value)} />
          <ReportSelect label="Custodial centre" value={selectValue(draft.prison_ids)} options={options.prisons} onChange={(value) => setNumeric("prison_ids", value)} />
        </FilterGroup>
        <FilterGroup title="Account & data quality" count={qualityCount}>
          <ReportSelect label="Missing information" value={selectValue(draft.missing_fields)} options={options.missing_fields} onChange={(value) => setString("missing_fields", value)} />
          <BooleanSelect label="Verified" value={draft.verified} onChange={(value) => setBoolean("verified", value)} />
          <BooleanSelect label="Has work email" value={draft.has_email} onChange={(value) => setBoolean("has_email", value)} />
          <BooleanSelect label="Has photo" value={draft.has_photo} onChange={(value) => setBoolean("has_photo", value)} />
          <BooleanSelect label="Has education record" value={draft.has_education} onChange={(value) => setBoolean("has_education", value)} />
          <label className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"><input type="checkbox" checked={draft.never_logged_in ?? false} onChange={(event) => setBoolean("never_logged_in", event.target.checked || undefined)} className="h-4 w-4 accent-ncos-green-700" />Never logged in</label>
          <DateRange label="Last login" value={draft.last_login} onChange={(value) => onChange({ ...draft, last_login: value })} />
          <DateRange label="Record created" value={draft.record_created} onChange={(value) => onChange({ ...draft, record_created: value })} />
        </FilterGroup>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4"><Button type="button" variant="ghost" size="sm" onClick={onReset} disabled={activeCount === 0}><RotateCcw className="mr-2 h-4 w-4" />Clear all</Button><Button type="submit" size="sm" disabled={!hasChanges}><Filter className="mr-2 h-4 w-4" />Apply{activeCount > 0 ? ` (${activeCount})` : ""}</Button></div>
    </form>
  </aside>;
}
