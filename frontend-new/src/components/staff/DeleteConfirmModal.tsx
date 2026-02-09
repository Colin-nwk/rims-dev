import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { getFileUrl } from "@/lib/api/apiClient";
import { Staff } from "@/lib/api/staff";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  staff,
  onConfirm,
  isLoading = false,
}) => {
  if (!staff) return null;

  const fullName =
    `${staff.surname} ${staff.first_name} ${staff.other_names || ""}`.trim();
  const photoUrl = getFileUrl(staff.photo, staff.updated_at);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="text-center">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h3 className="mb-2 text-lg font-semibold text-slate-900">
          Delete Staff Record
        </h3>

        {/* Message */}
        <p className="mb-4 text-sm text-slate-600">
          Are you sure you want to delete the staff record for{" "}
          <span className="font-semibold text-slate-900">{fullName}</span>?
        </p>

        {/* Staff Info Card */}
        <div className="p-3 mb-6 text-left rounded-lg bg-slate-50">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={fullName}
                className="object-cover w-12 h-12 rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 text-sm font-bold text-white rounded-lg bg-gradient-to-br from-ncos-green-500 to-ncos-green-700">
                {staff.first_name?.[0]}
                {staff.surname?.[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">{fullName}</p>
              <p className="text-xs text-slate-500">
                Service No: {staff.service_no}
                {staff.ippis && ` • IPPIS: ${staff.ippis}`}
              </p>
              <p className="text-xs text-slate-500">
                {staff.present_rank || "No Rank"} •{" "}
                {staff.department || "No Department"}
              </p>
            </div>
          </div>
        </div>

        {/* Warning Text */}
        <p className="mb-6 text-xs text-red-600">
          This action cannot be undone. All data associated with this staff
          member will be permanently removed.
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
          Delete Staff
        </Button>
      </ModalFooter>
    </Modal>
  );
};
