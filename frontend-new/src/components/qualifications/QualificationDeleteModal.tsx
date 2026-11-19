import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { type StaffEducation } from "@/lib/api/staff-education";

interface QualificationDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  education: StaffEducation | null;
  isLoading?: boolean;
}

export const QualificationDeleteModal: React.FC<
  QualificationDeleteModalProps
> = ({ isOpen, onClose, onConfirm, education, isLoading = false }) => {
  if (!education) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Qualification"
      description="This action cannot be undone"
      size="md"
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 mb-1">
              Warning: This action is permanent
            </p>
            <p className="text-sm text-red-700">
              Are you sure you want to delete this qualification record? This
              action cannot be undone.
            </p>
          </div>
        </div>

        {/* Record Details */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-3">
            Record to be deleted:
          </h4>
          <div className="space-y-2">
            {education.staff && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 min-w-20">Staff:</span>
                <span className="font-medium text-slate-900">
                  {education.staff.surname} {education.staff.first_name} (
                  {education.staff.service_no})
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 min-w-20">Institution:</span>
              <span className="font-medium text-slate-900">
                {education.institution}
              </span>
            </div>
            {education.course && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 min-w-20">Course:</span>
                <span className="font-medium text-slate-900">
                  {education.course}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500 min-w-20">Type:</span>
              <span className="font-medium text-slate-900">
                {education.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Deleting..." : "Delete Qualification"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
