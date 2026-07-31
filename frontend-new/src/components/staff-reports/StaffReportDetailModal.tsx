import { Modal } from "@/components/ui/Modal";
import { getFileUrl } from "@/lib/api/apiClient";
import { useStaffReportDetail } from "@/lib/api/staff-reports";
import { BriefcaseBusiness, GraduationCap, MapPin, ShieldCheck, UserRound } from "lucide-react";

export function StaffReportDetailModal({ serviceNo, onClose }: { serviceNo?: string; onClose: () => void }) {
  const { data: staff, isLoading, isError } = useStaffReportDetail(serviceNo);
  return (
    <Modal isOpen={Boolean(serviceNo)} onClose={onClose} title="Staff report detail" description={serviceNo} size="full">
      {isLoading ? <div className="space-y-3" aria-label="Loading staff detail"><div className="h-24 animate-pulse rounded-xl bg-slate-100" /><div className="h-52 animate-pulse rounded-xl bg-slate-100" /></div> : null}
      {isError ? <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">This staff detail could not be loaded within your report scope.</p> : null}
      {staff ? <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-xl bg-linear-to-r from-ncos-green-900 to-ncos-green-700 p-5 text-white sm:flex-row sm:items-center">
          {staff.identity.photo ? <img src={getFileUrl(staff.identity.photo)} alt="" className="h-20 w-20 rounded-xl object-cover ring-2 ring-white/40" /> : <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-white/15"><UserRound className="h-9 w-9" /></div>}
          <div><h3 className="text-xl font-bold">{staff.identity.full_name}</h3><p className="text-sm text-white/75">{staff.identity.service_no} · {staff.employment.present_rank || "Rank not assigned"}</p><div className="mt-2 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/15 px-2 py-1">{staff.employment.account_status}</span>{staff.employment.verified ? <span className="rounded-full bg-white/15 px-2 py-1">Verified</span> : null}</div></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <DetailSection icon={BriefcaseBusiness} title="Employment" values={{ "Staff status": staff.employment.staff_status, "Present rank": staff.employment.present_rank, "Initial rank": staff.employment.initial_rank, Level: staff.employment.level, Step: staff.employment.step, Duty: staff.employment.duty, "First appointment": staff.employment.first_appointment_date }} />
          <DetailSection icon={MapPin} title="Organization & location" values={{ Directorate: staff.organization.directorate, Department: staff.organization.department, "Work distribution": staff.organization.work_distribution, State: staff.location.state, "Custodial centre": staff.location.prison, Station: staff.location.station }} />
          <DetailSection icon={ShieldCheck} title="Account" values={{ Email: staff.identity.work_email, Phone: staff.identity.phone_number, "Last login": staff.account.last_login ? new Date(staff.account.last_login).toLocaleString() : "Never", Roles: staff.account.roles.join(", ") || "None" }} />
          <section className="rounded-xl border border-slate-200 p-4"><h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><GraduationCap className="h-5 w-5 text-ncos-green-700" />Education</h4>{staff.education?.length ? <div className="space-y-3">{staff.education.map((item) => <div key={item.id} className="border-b border-slate-100 pb-2 last:border-0"><p className="font-medium text-slate-800">{item.institution}</p><p className="text-sm text-slate-500">{item.type}{item.course ? ` · ${item.course}` : ""}</p></div>)}</div> : <p className="text-sm text-slate-500">No education records.</p>}</section>
        </div>
      </div> : null}
    </Modal>
  );
}

function DetailSection({ icon: Icon, title, values }: { icon: typeof BriefcaseBusiness; title: string; values: Record<string, string | number | undefined> }) {
  return <section className="rounded-xl border border-slate-200 p-4"><h4 className="mb-3 flex items-center gap-2 font-semibold text-slate-900"><Icon className="h-5 w-5 text-ncos-green-700" />{title}</h4><dl className="grid grid-cols-2 gap-x-4 gap-y-3">{Object.entries(values).map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</dd></div>)}</dl></section>;
}
