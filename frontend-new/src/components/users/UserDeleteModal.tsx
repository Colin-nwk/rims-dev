import React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { type AdminUser, getUserInitials } from "@/lib/api/users";

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: AdminUser | null;
  isLoading?: boolean;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}) => {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        {/* Warning Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
        <p className="text-sm text-slate-500 mb-6">
          This action cannot be undone.
        </p>

        {/* User being deleted */}
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 text-left">
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-ncos-green-400 to-ncos-green-600 flex items-center justify-center text-white font-bold shadow-md">
            {getUserInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-sm text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Warning details */}
        <div className="text-left mb-6 space-y-2">
          <p className="text-sm text-slate-600">Deleting this user will:</p>
          <ul className="text-sm text-slate-500 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              Remove all associated data permanently
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              Clear all role assignments
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
              Revoke system access immediately
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete User
          </Button>
        </div>
      </div>
    </Modal>
  );
};
