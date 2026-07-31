import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { useExportStaffReport, type ReportOption, type StaffReportColumn, type StaffReportRequest } from "@/lib/api/staff-reports";
import { Download, FileImage, FileText, Files, ScrollText } from "lucide-react";
import { type RefObject, useState } from "react";
import { toast } from "react-toastify";

type ExportFormat = "pdf" | "word" | "image" | "document";
const formatMeta: Record<ExportFormat, { label: string; description: string; extension: string; icon: typeof FileText }> = {
  pdf: { label: "PDF", description: "Print-ready full report", extension: "pdf", icon: FileText },
  word: { label: "Word", description: "Editable Word document", extension: "doc", icon: ScrollText },
  image: { label: "Image", description: "PNG of the current view", extension: "png", icon: FileImage },
  document: { label: "Document", description: "Portable HTML document", extension: "html", icon: Files },
};

function saveBlob(blob: Blob, extension: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `staff-report-${new Date().toISOString().slice(0, 10)}.${extension}`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StaffReportExportModal({ isOpen, onClose, columns, formats, request, captureTarget, activeView }: { isOpen: boolean; onClose: () => void; columns: StaffReportColumn[]; formats: ReportOption[]; request: StaffReportRequest; captureTarget: RefObject<HTMLDivElement | null>; activeView: "summary" | "details" }) {
  const defaults = columns.filter((column) => column.default).map((column) => column.key);
  const [selected, setSelected] = useState<string[]>(defaults);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [capturing, setCapturing] = useState(false);
  const exportReport = useExportStaffReport();

  const download = async () => {
    try {
      if (format === "image") {
        if (!captureTarget.current) throw new Error("Report view is unavailable");
        setCapturing(true);
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(captureTarget.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (!blob) throw new Error("Could not render report image");
        saveBlob(blob, formatMeta.image.extension);
      } else {
        const blob = await exportReport.mutateAsync({ request, columns: selected, format });
        saveBlob(blob, formatMeta[format].extension);
      }
      toast.success(`${formatMeta[format].label} report downloaded`);
      onClose();
    } catch {
      toast.error("Staff report export failed");
    } finally {
      setCapturing(false);
    }
  };

  const categories = columns.reduce<Record<string, StaffReportColumn[]>>((groups, column) => { (groups[column.category] ??= []).push(column); return groups; }, {});
  const availableFormats = formats.map((option) => String(option.id)).filter((value): value is ExportFormat => value in formatMeta);

  return <Modal isOpen={isOpen} onClose={onClose} title="Export staff report" description="PDF, Word and Document include the entire filtered population. Image captures the current tab." size="lg">
    <div className="space-y-5">
      <fieldset><legend className="mb-2 text-sm font-semibold text-slate-800">Format</legend><div className="grid gap-2 sm:grid-cols-2">{availableFormats.map((value) => { const item = formatMeta[value]; const Icon = item.icon; return <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${format === value ? "border-ncos-green-600 bg-ncos-green-50" : "border-slate-200 hover:bg-slate-50"}`}><input type="radio" name="export-format" value={value} checked={format === value} onChange={() => setFormat(value)} className="sr-only" /><Icon className="mt-0.5 h-5 w-5 text-ncos-green-700" /><span><span className="block text-sm font-semibold text-slate-900">{item.label}</span><span className="block text-xs text-slate-500">{item.description}</span></span></label>; })}</div></fieldset>
      {format === "image" ? <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">The PNG will capture the visible <strong>{activeView === "summary" ? "Statistics" : "Details"}</strong> tab. Switch tabs before exporting to capture the other view.</div> : <div className="max-h-[45vh] space-y-4 overflow-y-auto pr-1">{Object.entries(categories).map(([category, items]) => <fieldset key={category}><legend className="mb-2 text-sm font-semibold text-slate-800">{category}</legend><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{items.map((column) => <label key={column.key} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-sm hover:bg-slate-50"><input type="checkbox" checked={selected.includes(column.key)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, column.key] : current.filter((key) => key !== column.key))} className="h-4 w-4 accent-ncos-green-700" />{column.label}</label>)}</div></fieldset>)}</div>}
    </div>
    <ModalFooter><Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button><Button size="sm" isLoading={exportReport.isPending || capturing} disabled={format !== "image" && selected.length === 0} onClick={download}><Download className="mr-2 h-4 w-4" />Download {formatMeta[format].label}</Button></ModalFooter>
  </Modal>;
}
