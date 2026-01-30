import React from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type ChangeRequest,
  getModelName,
  getStatusColor,
  getTypeColor,
} from "@/lib/api/change-requests";
import {
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ChangeRequest | null;
  onApprove?: (request: ChangeRequest) => void;
  onReject?: (request: ChangeRequest) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  if (!request) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get requester name
  const getRequesterName = (req: ChangeRequest): string => {
    if (req.requested_by) {
      const requester = req.requested_by;
      if (requester.name) return requester.name;
      if (requester.surname && requester.first_name) {
        return `${requester.first_name} ${requester.surname}`;
      }
      if (requester.email) return requester.email;
    }
    return "Unknown";
  };

  // Format data key for display
  const formatKey = (key: string): string => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Format data value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const isPending = request.status === "PENDING";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Request Details"
      description={`Review the details of this ${request.type.toLowerCase()} request`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Request Info Card */}
          <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Request Information
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Type</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}
                >
                  {request.type}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                >
                  {request.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Model</span>
                <div className="flex items-center gap-1.5">
                  {getModelName(request.model_type) === "Staff" ? (
                    <User className="w-4 h-4 text-slate-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-sm font-medium text-slate-700">
                    {getModelName(request.model_type)}
                  </span>
                </div>
              </div>
              {request.service_no && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Service No</span>
                  <span className="font-mono text-sm font-medium text-slate-900">
                    {request.service_no}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Card */}
          <div className="p-4 border rounded-lg bg-slate-50 border-slate-200">
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Timeline
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-slate-400" />
                <div>
                  <span className="block text-xs text-slate-500">
                    Submitted
                  </span>
                  <span className="text-sm text-slate-700">
                    {formatDate(request.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="w-4 h-4 mt-0.5 text-slate-400" />
                <div>
                  <span className="block text-xs text-slate-500">
                    Requested By
                  </span>
                  <span className="text-sm text-slate-700">
                    {getRequesterName(request)}
                  </span>
                </div>
              </div>
              {request.approver && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-500" />
                  <div>
                    <span className="block text-xs text-slate-500">
                      Processed By
                    </span>
                    <span className="text-sm text-slate-700">
                      {request.approver.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rejection Reason (if rejected) */}
        {request.status === "REJECTED" && request.rejection_reason && (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">
                  Rejection Reason
                </h4>
                <p className="mt-1 text-sm text-red-700">
                  {request.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Changes */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900">
            {request.type === "CREATE" ? "New Data" : "Proposed Changes"}
          </h4>
          <div className="p-4 overflow-hidden border rounded-lg bg-slate-50 border-slate-200">
            <div className="max-h-64 overflow-y-auto">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(request.data).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 bg-white border rounded-md border-slate-100"
                  >
                    <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                      {formatKey(key)}
                    </span>
                    <span className="block mt-1 text-sm text-slate-900 wrap-break-word">
                      {formatValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {isPending && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  onReject?.(request);
                  onClose();
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => {
                  onApprove?.(request);
                  onClose();
                }}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </>
          )}
        </ModalFooter>
      </div>
    </Modal>
  );
};
