import { Button } from "@/components/ui/button";
import type {
  ReportOption,
  StaffReportCriteria,
  StaffReportOptions,
} from "@/lib/api/staff-reports";
import { Filter, RotateCcw, Search } from "lucide-react";

type Props = {
  draft: StaffReportCriteria;
  options: StaffReportOptions;
  onChange: (criteria: StaffReportCriteria) => void;
  onApply: () => void;
  onReset: () => void;
};

const selectValue = (value?: Array<number | string>) =>
  value?.[0] === undefined ? "" : String(value[0]);

function ReportSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ReportOption[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1 text-sm text-slate-700">
      <span className="font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-ncos-green-600 focus:ring-2 focus:ring-ncos-green-100"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={String(option.id)} value={String(option.id)}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function StaffReportFilters({
  draft,
  options,
  onChange,
  onApply,
  onReset,
}: Props) {
  const setNumeric = (key: keyof StaffReportCriteria, value: string) =>
    onChange({ ...draft, [key]: value ? [Number(value)] : undefined });
  const setString = (key: keyof StaffReportCriteria, value: string) =>
    onChange({ ...draft, [key]: value ? [value] : undefined });

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-ncos-green-700" />
        <h2 className="font-semibold text-slate-900">Report filters</h2>
        <span className="text-xs text-slate-500">Apply to totals, rows and export</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1 text-sm text-slate-700 md:col-span-2">
          <span className="font-medium">Search staff</span>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              value={draft.search ?? ""}
              onChange={(event) =>
                onChange({ ...draft, search: event.target.value || undefined })
              }
              placeholder="Service number, name, email, file or IPPIS number"
              className="h-10 w-full rounded-lg border border-slate-300 pl-10 pr-3 outline-none focus:border-ncos-green-600 focus:ring-2 focus:ring-ncos-green-100"
            />
          </div>
        </label>
        <ReportSelect
          label="Account status"
          value={selectValue(draft.statuses)}
          options={options.statuses}
          onChange={(value) => setNumeric("statuses", value)}
        />
        <ReportSelect
          label="Staff status"
          value={selectValue(draft.staff_status_ids)}
          options={options.staff_statuses}
          onChange={(value) => setNumeric("staff_status_ids", value)}
        />
        <ReportSelect
          label="Sex"
          value={selectValue(draft.sex)}
          options={options.sex}
          onChange={(value) => setString("sex", value)}
        />
        <ReportSelect
          label="Directorate"
          value={selectValue(draft.directorate_ids)}
          options={options.directorates}
          onChange={(value) => setNumeric("directorate_ids", value)}
        />
        <ReportSelect
          label="Present rank"
          value={selectValue(draft.rank_ids)}
          options={options.rankings}
          onChange={(value) => setNumeric("rank_ids", value)}
        />
        <ReportSelect
          label="Department"
          value={selectValue(draft.departments)}
          options={options.departments}
          onChange={(value) => setString("departments", value)}
        />
        <ReportSelect
          label="Assigned state"
          value={selectValue(draft.state_ids)}
          options={options.states}
          onChange={(value) => setNumeric("state_ids", value)}
        />
        <ReportSelect
          label="Custodial centre"
          value={selectValue(draft.prison_ids)}
          options={options.prisons.filter(
            (prison) =>
              !draft.state_ids?.[0] || prison.state_id === draft.state_ids[0],
          )}
          onChange={(value) => setNumeric("prison_ids", value)}
        />
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Appointed from</span>
          <input
            type="date"
            value={draft.appointment_date?.from ?? ""}
            onChange={(event) =>
              onChange({
                ...draft,
                appointment_date: {
                  ...draft.appointment_date,
                  from: event.target.value || undefined,
                },
              })
            }
            className="h-10 w-full rounded-lg border border-slate-300 px-3"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Appointed to</span>
          <input
            type="date"
            value={draft.appointment_date?.to ?? ""}
            onChange={(event) =>
              onChange({
                ...draft,
                appointment_date: {
                  ...draft.appointment_date,
                  to: event.target.value || undefined,
                },
              })
            }
            className="h-10 w-full rounded-lg border border-slate-300 px-3"
          />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
        <Button type="submit" size="sm">
          <Filter className="mr-2 h-4 w-4" /> Apply filters
        </Button>
      </div>
    </form>
  );
}
