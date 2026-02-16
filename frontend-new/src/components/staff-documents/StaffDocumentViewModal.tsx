import {
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileText,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type StaffDocument,
  getStaffDocumentStatusLabel,
  getStaffDocumentStatusStyle,
  getStaffDocumentTypeLabel,
} from "@/lib/api/staff-documents";
import { getFileUrl } from "@/lib/api";

interface StaffDocumentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: StaffDocument | null;
  onViewFile?: (document: StaffDocument) => void;
  onDownloadFile?: (document: StaffDocument) => void;
}

function formatDate(value?: string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getVerifierName(document: StaffDocument): string {
  if (!document.verifier) return "N/A";
  if (document.verifier.name) return document.verifier.name;
  if (document.verifier.first_name || document.verifier.surname) {
    return `${document.verifier.first_name || ""} ${document.verifier.surname || ""}`.trim();
  }
  return document.verifier.email || document.verifier.service_no || "N/A";
}

export function StaffDocumentViewModal({
  isOpen,
  onClose,
  document,
  onViewFile,
  onDownloadFile,
}: StaffDocumentViewModalProps) {
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Document Details"
      description="View complete personnel document information"
      size="xl"
    >
      <div className="space-y-6">
        {document.staff && (
          <div className="p-4 sm:p-6 bg-linear-to-br from-ncos-green-50 to-slate-50 rounded-xl border border-ncos-green-100">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <User className="w-4 h-4" />
              Staff Information
            </h3>
            <div className="flex items-start gap-3 sm:gap-4">
              {document.staff.photo ? (
                <img
                  src={getFileUrl(document.staff.photo)}
                  alt={`${document.staff.surname} ${document.staff.first_name}`}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-3 border-white shadow-md shrink-0"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    const fallback = event.currentTarget.nextElementSibling;
                    if (fallback) {
                      (fallback as HTMLElement).style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-ncos-green-600 text-white flex items-center justify-center font-bold text-base sm:text-lg border-3 border-white shadow-md shrink-0 ${document.staff.photo ? "hidden" : ""}`}
              >
                {document.staff.surname[0]}
                {document.staff.first_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1 wrap-break-word">
                  {document.staff.surname} {document.staff.first_name}{" "}
                  {document.staff.other_names || ""}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                  <span className="text-slate-600">
                    {document.staff.service_no}
                  </span>
                  <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-ncos-green-600 text-white text-xs font-medium">
                    {document.staff.present_rank_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText className="w-4 h-4" />
                Document Details
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {document.document_name}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStaffDocumentStatusStyle(
                document.verification_status,
              )}`}
            >
              {getStaffDocumentStatusLabel(document.verification_status)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Document Type
              </p>
              <p className="mt-1 text-base font-medium text-slate-900">
                {getStaffDocumentTypeLabel(document.document_type)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Uploaded
              </p>
              <p className="mt-1 text-base font-medium text-slate-900">
                {formatDate(document.created_at)}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5" />
                Expiry Date
              </p>
              <p className="mt-1 text-base font-medium text-slate-900">
                {document.expires_at
                  ? formatDate(document.expires_at)
                  : "No expiry"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Notes
              </p>
              <p className="mt-1 text-base font-medium text-slate-900">
                {document.notes || "No notes"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
            <ShieldCheck className="w-4 h-4" />
            Verification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Status
              </p>
              <p className="mt-1 text-base font-medium text-slate-900">
                {getStaffDocumentStatusLabel(document.verification_status)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Reviewed By
              </p>
              <p className="mt-1 text-base font-medium text-slate-900">
                {getVerifierName(document)}
              </p>
            </div>
          </div>
          {document.rejection_reason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-red-700">
                <XCircle className="w-4 h-4" />
                Rejection Reason
              </div>
              <p className="mt-1 text-sm text-red-600">
                {document.rejection_reason}
              </p>
            </div>
          )}
          {document.verified_at && (
            <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle className="w-4 h-4" />
              Verified on {formatDate(document.verified_at)}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 bg-white rounded-xl border border-slate-200">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
            <FileText className="w-4 h-4" />
            File Actions
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onViewFile?.(document)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View File
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDownloadFile?.(document)}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
