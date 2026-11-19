import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { type Role } from "@/lib/api/roles";
import { AlertTriangle, Info } from "lucide-react";

interface DeleteRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: Role | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({
  isOpen,
  onClose,
  role,
  onConfirm,
  isLoading = false,
}) => {
  if (!role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Role"
      size="md"
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Warning Icon */}
        <div className="flex items-center justify-center w-16 h-16 border rounded-full bg-red-50 border-red-100 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Message */}
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Are you absolutely sure?
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            You are about to delete the{" "}
            <span className="font-bold text-red-600">"{role.name}"</span> role.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            This role has{" "}
            <span className="font-semibold text-slate-700">
              {role.permissions?.length || 0} permission
              {role.permissions?.length !== 1 ? "s" : ""}
            </span>{" "}
            assigned.
          </p>
        </div>

        {/* Info Box */}
        <div className="w-full p-4 text-left border rounded-lg bg-slate-50 border-slate-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-600">
              Deleted roles cannot be recovered. Users currently assigned to
              this role will lose their special permissions until a new role is
              assigned to them.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid w-full grid-cols-2 gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            No, Keep Role
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Yes, Delete Role
          </Button>
        </div>
      </div>
    </Modal>
  );
};
