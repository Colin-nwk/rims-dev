import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import type { StaffPosting } from "@/lib/api/staff-postings";

interface StaffPostingDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  posting?: StaffPosting | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function StaffPostingDeleteModal({
  isOpen,
  onClose,
  posting,
  onConfirm,
  isLoading = false,
}: StaffPostingDeleteModalProps) {
  if (!posting) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-slate-900">
          Delete Staff Posting
        </h3>
        <p className="mb-4 text-sm text-slate-600">
          Are you sure you want to delete the posting for{" "}
          <span className="font-semibold text-slate-900">
            {posting.station_name}
          </span>
          ?
        </p>
        <div className="p-3 mb-6 text-left rounded-lg bg-slate-50">
          <p className="text-sm text-slate-700">
            Service No: <span className="font-medium">{posting.service_no}</span>
          </p>
          <p className="text-xs text-slate-500">
            Status: {posting.status}
          </p>
        </div>
        <p className="mb-6 text-xs text-red-600">
          This action cannot be undone.
        </p>
      </div>

      <ModalFooter className="justify-center">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          isLoading={isLoading}
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Posting
        </Button>
      </ModalFooter>
    </Modal>
  );
}
