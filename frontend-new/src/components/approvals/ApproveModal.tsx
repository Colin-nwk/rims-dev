import React from "react";
import { CheckCircle, AlertTriangle, User, FileText } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type ChangeRequest,
  getModelName,
  getTypeColor,
  getIdentifier,
} from "@/lib/api/change-requests";

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ChangeRequest | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirm,
  isLoading = false,
}) => {
  if (!request) return null;

  const identifier = getIdentifier(request);
  const isEmail = identifier.includes("@");
  const modelName = getModelName(request.model_type);

  // Get requester name
  const getRequesterName = (): string => {
    if (request.requested_by) {
      const requester = request.requested_by;
      if (requester.name) return requester.name;
      if (requester.surname && requester.first_name) {
        return `${requester.first_name} ${requester.surname}`;
      }
      if (requester.email) return requester.email;
    }
    return "Unknown";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Approval" size="md">
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800">
              Are you sure you want to approve this request?
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              This action will apply the changes immediately and cannot be
              undone.
            </p>
          </div>
        </div>

        {/* Request Details Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Request Type</span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}
            >
              {request.type}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Account Type</span>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-slate-200">
                {modelName === "Staff" ? (
                  <User className="w-3 h-3 text-slate-600" />
                ) : (
                  <FileText className="w-3 h-3 text-slate-600" />
                )}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {modelName}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {isEmail ? "Email" : "Service No"}
            </span>
            <span
              className={`text-sm font-medium text-slate-900 ${isEmail ? "" : "font-mono"}`}
            >
              {identifier}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Requested By</span>
            <span className="text-sm font-medium text-slate-700">
              {getRequesterName()}
            </span>
          </div>
        </div>

        {/* Changes Preview */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2">
            Changes to be Applied:
          </h4>
          <div className="max-h-40 overflow-y-auto p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(request.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          isLoading={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Yes, Approve
        </Button>
      </ModalFooter>
    </Modal>
  );
};
