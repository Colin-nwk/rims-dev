import { CheckCircle, ShieldCheck } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { type StaffDocument } from "@/lib/api/staff-documents";

interface StaffDocumentVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: StaffDocument | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function StaffDocumentVerifyModal({
  isOpen,
  onClose,
  document,
  onConfirm,
  isLoading = false,
}: StaffDocumentVerifyModalProps) {
  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verify Document"
      description="Confirm verification of this document"
      size="md"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 border border-emerald-200 rounded-lg bg-emerald-50">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-emerald-800">
              You're about to verify this document
            </h4>
            <p className="mt-1 text-sm text-emerald-700">
              Verified documents are marked as approved and visible to staff.
            </p>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">Document</span>
              <p className="font-medium text-slate-900">
                {document.document_name}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Service No</span>
              <p className="font-medium text-slate-900 font-mono">
                {document.service_no}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="button" onClick={onConfirm} isLoading={isLoading}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Verify Document
        </Button>
      </ModalFooter>
    </Modal>
  );
}
