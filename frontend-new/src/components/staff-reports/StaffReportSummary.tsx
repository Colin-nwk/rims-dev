import type { Breakdown, StaffReportSummary } from "@/lib/api/staff-reports";
import { BadgeCheck, Clock3, ShieldCheck, UserCheck, UserX, Users } from "lucide-react";

const cards = [
  { key: "total_staff", label: "Total staff", icon: Users, color: "bg-blue-50 text-blue-700" },
  { key: "active_staff", label: "Active", icon: UserCheck, color: "bg-emerald-50 text-emerald-700" },
  { key: "inactive_staff", label: "Inactive / suspended", icon: UserX, color: "bg-amber-50 text-amber-700" },
  { key: "verified_staff", label: "Verified", icon: BadgeCheck, color: "bg-violet-50 text-violet-700" },
  { key: "with_roles", label: "With roles", icon: ShieldCheck, color: "bg-cyan-50 text-cyan-700" },
  { key: "never_logged_in", label: "Never logged in", icon: Clock3, color: "bg-slate-100 text-slate-700" },
] as const;

function BreakdownList({ title, items }: { title: string; items: Breakdown }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 font-semibold text-slate-900">{title}</h3>
      <div className="space-y-3">
        {items.slice(0, 8).map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="truncate text-slate-600">{item.label}</span>
              <span className="font-medium text-slate-900">{item.count.toLocaleString()}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-ncos-green-600" style={{ width: `${(item.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="text-sm text-slate-500">No data in this population.</p> : null}
      </div>
    </section>
  );
}

export function StaffReportSummaryView({ summary }: { summary: StaffReportSummary }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary[key].toLocaleString()}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <BreakdownList title="By status" items={summary.by_status} />
        <BreakdownList title="By rank" items={summary.by_rank} />
        <BreakdownList title="By directorate" items={summary.by_directorate} />
      </div>
    </div>
  );
}
