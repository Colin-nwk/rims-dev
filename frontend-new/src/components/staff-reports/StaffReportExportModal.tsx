import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { useExportStaffReport, type StaffReportColumn, type StaffReportRequest } from "@/lib/api/staff-reports";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export function StaffReportExportModal({ isOpen, onClose, columns, request }: { isOpen: boolean; onClose: () => void; columns: StaffReportColumn[]; request: StaffReportRequest }) {
  const defaults = columns.filter((column) => column.default).map((column) => column.key);
  const [selected, setSelected] = useState<string[]>(defaults);
  const exportReport = useExportStaffReport();

  const download = async () => {
    try {
      const blob = await exportReport.mutateAsync({ request, columns: selected });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `staff-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Staff report downloaded");
      onClose();
    } catch {
      toast.error("Staff report export failed");
    }
  };

  const categories = columns.reduce<Record<string, StaffReportColumn[]>>(
    (groups, column) => {
      (groups[column.category] ??= []).push(column);
      return groups;
    },
    {},
  );
  return <Modal isOpen={isOpen} onClose={onClose} title="Export staff report" description="The download contains the entire filtered population, not only this page." size="lg">
    <div className="space-y-4">{Object.entries(categories).map(([category, items]) => <fieldset key={category}><legend className="mb-2 text-sm font-semibold text-slate-800">{category}</legend><div className="grid grid-cols-2 gap-2">{items?.map((column) => <label key={column.key} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-sm hover:bg-slate-50"><input type="checkbox" checked={selected.includes(column.key)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, column.key] : current.filter((key) => key !== column.key))} className="h-4 w-4 accent-ncos-green-700" />{column.label}</label>)}</div></fieldset>)}</div>
    <ModalFooter><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" isLoading={exportReport.isPending} disabled={selected.length === 0} onClick={download}><Download className="mr-2 h-4 w-4" />Download CSV</Button></ModalFooter>
  </Modal>;
}
