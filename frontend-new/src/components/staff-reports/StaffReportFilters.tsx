import { Button } from "@/components/ui/button";
import type { ReportOption, StaffReportCriteria, StaffReportOptions } from "@/lib/api/staff-reports";
import { Filter, RotateCcw, Search, X } from "lucide-react";

type Props = {
  draft: StaffReportCriteria;
  options: StaffReportOptions;
  onChange: (criteria: StaffReportCriteria) => void;
  onApply: () => void;
  onReset: () => void;
  onClose: () => void;
};

const controlClass = "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-ncos-green-600 focus:ring-2 focus:ring-ncos-green-100";
const selectValue = (value?: Array<number | string>) => value?.[0] === undefined ? "" : String(value[0]);

function ReportSelect({ label, value, options, onChange }: { label: string; value: string; options: ReportOption[]; onChange: (value: string) => void }) {
  return <label className="block space-y-1.5 text-sm text-slate-700"><span className="font-medium">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className={controlClass}><option value="">All</option>{options.map((option) => <option key={String(option.id)} value={String(option.id)}>{option.name}</option>)}</select></label>;
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

function FilterGroup({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return <details open={open} className="group border-b border-slate-100 pb-4"><summary className="cursor-pointer list-none py-2 text-xs font-bold uppercase tracking-wider text-slate-500 marker:hidden">{title}<span className="float-right text-base font-normal text-slate-400 group-open:rotate-45">+</span></summary><div className="space-y-3 pt-2">{children}</div></details>;
}

export function StaffReportFilters({ draft, options, onChange, onApply, onReset, onClose }: Props) {
  const setNumeric = (key: keyof StaffReportCriteria, value: string) => onChange({ ...draft, [key]: value ? [Number(value)] : undefined });
  const setString = (key: keyof StaffReportCriteria, value: string) => onChange({ ...draft, [key]: value ? [value] : undefined });
  const setBoolean = (key: keyof StaffReportCriteria, value?: boolean) => onChange({ ...draft, [key]: value });

  return <aside className="h-fit rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-5">
    <form onSubmit={(event) => { event.preventDefault(); onApply(); }}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-2"><Filter className="h-4 w-4 text-ncos-green-700" /><div><h2 className="font-semibold text-slate-900">Report filters</h2><p className="text-xs text-slate-500">Totals, details and exports</p></div></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Hide report filters"><X className="h-4 w-4" /></button></div>
      <div className="max-h-[calc(100vh-15rem)] space-y-3 overflow-y-auto px-4 py-3">
        <label className="block space-y-1.5 text-sm text-slate-700"><span className="font-medium">Search staff</span><div className="relative"><Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" /><input value={draft.search ?? ""} onChange={(event) => onChange({ ...draft, search: event.target.value || undefined })} placeholder="Name, service no., email..." className={`${controlClass} pl-10`} /></div></label>
        <FilterGroup title="Employment" open>
          <ReportSelect label="Account status" value={selectValue(draft.statuses)} options={options.statuses} onChange={(value) => setNumeric("statuses", value)} />
          <ReportSelect label="Staff status" value={selectValue(draft.staff_status_ids)} options={options.staff_statuses} onChange={(value) => setNumeric("staff_status_ids", value)} />
          <ReportSelect label="Present rank" value={selectValue(draft.rank_ids)} options={options.rankings} onChange={(value) => setNumeric("rank_ids", value)} />
          <ReportSelect label="Level" value={selectValue(draft.levels)} options={options.levels} onChange={(value) => setNumeric("levels", value)} />
          <ReportSelect label="Sex" value={selectValue(draft.sex)} options={options.sex} onChange={(value) => setString("sex", value)} />
          <AgeRange value={draft.age} onChange={(value) => onChange({ ...draft, age: value })} />
          <DateRange label="First appointment" value={draft.appointment_date} onChange={(value) => onChange({ ...draft, appointment_date: value })} />
          <DateRange label="Date of birth" value={draft.date_of_birth} onChange={(value) => onChange({ ...draft, date_of_birth: value })} />
        </FilterGroup>
        <FilterGroup title="Personal & medical">
          <ReportSelect label="Blood group" value={selectValue(draft.blood_groups)} options={options.blood_groups} onChange={(value) => setString("blood_groups", value)} />
          <ReportSelect label="Genotype" value={selectValue(draft.genotypes)} options={options.genotypes} onChange={(value) => setString("genotypes", value)} />
          <ReportSelect label="Marital status" value={selectValue(draft.marital_statuses)} options={options.marital_statuses} onChange={(value) => setString("marital_statuses", value)} />
        </FilterGroup>
        <FilterGroup title="Organization & location">
          <ReportSelect label="Directorate" value={selectValue(draft.directorate_ids)} options={options.directorates} onChange={(value) => setNumeric("directorate_ids", value)} />
          <ReportSelect label="Department" value={selectValue(draft.departments)} options={options.departments} onChange={(value) => setString("departments", value)} />
          <ReportSelect label="Work distribution" value={selectValue(draft.work_distribution_ids)} options={options.work_distributions} onChange={(value) => setNumeric("work_distribution_ids", value)} />
          <ReportSelect label="Training institute" value={selectValue(draft.training_institute_ids)} options={options.training_institutes} onChange={(value) => setNumeric("training_institute_ids", value)} />
          <ReportSelect label="Zone" value={selectValue(draft.zone_ids)} options={options.zones} onChange={(value) => setNumeric("zone_ids", value)} />
          <ReportSelect label="Custodial centre" value={selectValue(draft.prison_ids)} options={options.prisons} onChange={(value) => setNumeric("prison_ids", value)} />
        </FilterGroup>
        <FilterGroup title="Account & data quality">
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
      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-4"><Button type="button" variant="ghost" size="sm" onClick={onReset}><RotateCcw className="mr-2 h-4 w-4" />Reset</Button><Button type="submit" size="sm"><Filter className="mr-2 h-4 w-4" />Apply</Button></div>
    </form>
  </aside>;
}
