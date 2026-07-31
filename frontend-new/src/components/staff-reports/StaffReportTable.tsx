import { Pagination } from "@/components/ui/pagination";
import type { StaffReportResponse, StaffReportRow } from "@/lib/api/staff-reports";
import { ArrowDownAZ, Eye, Inbox } from "lucide-react";

type Props = {
  details: NonNullable<StaffReportResponse["data"]["details"]>;
  isFetching: boolean;
  sortField: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onView: (row: StaffReportRow) => void;
};

export function StaffReportTable({ details, isFetching, sortField, sortDirection, onSort, onPageChange, onView }: Props) {
  const sortButton = (field: string, label: string) => (
    <button className="inline-flex items-center gap-1 font-semibold hover:text-ncos-green-700" onClick={() => onSort(field)}>
      {label}<ArrowDownAZ className={`h-3.5 w-3.5 ${sortField === field && sortDirection === "desc" ? "rotate-180" : ""}`} />
    </button>
  );

  if (details.rows.length === 0) {
    return <div className="rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center"><Inbox className="mx-auto mb-3 h-10 w-10 text-slate-300" /><h3 className="font-semibold text-slate-800">No staff matched these filters</h3><p className="mt-1 text-sm text-slate-500">Adjust or reset the report filters.</p></div>;
  }

  return (
    <div className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`} aria-busy={isFetching}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600"><tr>
              <th className="px-4 py-3">{sortButton("service_no", "Service no.")}</th>
              <th className="px-4 py-3">{sortButton("full_name", "Staff")}</th>
              <th className="px-4 py-3">Rank / level</th><th className="px-4 py-3">Organization</th><th className="px-4 py-3">{sortButton("status", "Status")}</th><th className="px-4 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {details.rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{row.identity.service_no}</td>
                  <td className="px-4 py-3"><p className="font-semibold text-slate-900">{row.identity.full_name}</p><p className="text-xs text-slate-500">{row.identity.work_email || "No work email"}</p></td>
                  <td className="px-4 py-3"><p className="text-slate-800">{row.employment.present_rank || "Unassigned"}</p><p className="text-xs text-slate-500">Level {row.employment.level ?? "—"}</p></td>
                  <td className="px-4 py-3"><p>{row.organization.directorate || row.organization.department || "Unassigned"}</p><p className="text-xs text-slate-500">{row.organization.work_distribution}</p></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.employment.account_status === "active" ? "bg-emerald-100 text-emerald-700" : row.employment.account_status === "suspended" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{row.employment.account_status}</span></td>
                  <td className="px-4 py-3 text-right"><button onClick={() => onView(row)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ncos-green-700 hover:bg-ncos-green-50" aria-label={`View ${row.identity.full_name}`}><Eye className="h-4 w-4" /> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination currentPage={details.pagination.current_page} totalPages={Math.max(details.pagination.last_page, 1)} onPageChange={onPageChange} isLoading={isFetching} />
    </div>
  );
}
