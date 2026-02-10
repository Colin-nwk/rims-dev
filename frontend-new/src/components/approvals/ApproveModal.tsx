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

  // Format key for display
  const formatKey = (key: string): string => {
    // Remove any prefix before the last dot
    const cleanKey = key.includes(".") ? key.split(".").pop() || key : key;
    return cleanKey
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Format value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // Flatten nested objects (e.g., details.ippis)
  const flattenData = (
    data: Record<string, unknown>,
    prefix = "",
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(
          result,
          flattenData(value as Record<string, unknown>, newKey),
        );
      } else {
        result[newKey] = value;
      }
    }

    return result;
  };

  // Get current value from model
  const getCurrentValue = (key: string): unknown => {
    if (!request.model) return undefined;

    const keys = key.split(".");
    let value: unknown = request.model;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return undefined;
      }
    }

    return value;
  };

  // Check if values are different
  const valuesAreDifferent = (
    currentVal: unknown,
    proposedVal: unknown,
  ): boolean => {
    const normalize = (val: unknown) => {
      if (val === null || val === undefined || val === "") return null;
      return val;
    };

    const normCurrent = normalize(currentVal);
    const normProposed = normalize(proposedVal);

    if (normCurrent === normProposed) return false;
    if (typeof normCurrent === "object" || typeof normProposed === "object") {
      return JSON.stringify(normCurrent) !== JSON.stringify(normProposed);
    }

    return String(normCurrent) !== String(normProposed);
  };

  const flattenedData = flattenData(request.data);
  const changesCount = Object.keys(flattenedData).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Approval" size="xl">
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800">
              Are you sure you want to approve this request?
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              This action will apply {changesCount} change
              {changesCount !== 1 ? "s" : ""} immediately and cannot be undone.
            </p>
          </div>
        </div>

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate-500">Request Type</span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}
            >
              {request.type}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
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

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate-500">
              {isEmail ? "Email" : "Service No"}
            </span>
            <span
              className={`text-sm font-medium text-slate-900 break-all ${isEmail ? "" : "font-mono"}`}
            >
              {identifier}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-slate-500">Requested By</span>
            <span className="text-sm font-medium text-slate-700 wrap-break-word text-right">
              {getRequesterName()}
            </span>
          </div>
        </div>

        {/* Changes Preview */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Changes to be Applied ({changesCount})
          </h4>

          {/* Info banner when model data is missing */}
          {(request.type === "UPDATE" || request.type === "SENSITIVE") &&
            !request.model && (
              <div className="mb-3 p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Current values unavailable. Only
                  proposed changes shown.
                </p>
              </div>
            )}

          <div className="max-h-64 overflow-y-auto border rounded-lg bg-white border-slate-200">
            <div className="divide-y divide-slate-100">
              {Object.entries(flattenedData).map(([key, proposedValue]) => {
                const currentValue = getCurrentValue(key);
                const hasChanged = valuesAreDifferent(
                  currentValue,
                  proposedValue,
                );
                // Check if current value is empty (new field being added)
                const isNewField =
                  currentValue === undefined ||
                  currentValue === null ||
                  currentValue === "";
                const isActualChange = hasChanged && !isNewField;

                return (
                  <div
                    key={key}
                    className={`p-3 transition-colors ${
                      isNewField
                        ? "bg-blue-50/50 hover:bg-blue-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {formatKey(key)}
                      </div>
                      {isNewField && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          New
                        </span>
                      )}
                    </div>

                    {request.model && request.model_id ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        {!isNewField && (
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-400 mb-0.5">
                              Current
                            </div>
                            <div
                              className={`text-sm font-medium wrap-break-word ${
                                isActualChange
                                  ? "text-slate-400 line-through"
                                  : "text-slate-700"
                              }`}
                            >
                              {formatValue(currentValue)}
                            </div>
                          </div>
                        )}

                        {hasChanged && (
                          <>
                            {!isNewField && (
                              <div className="text-emerald-600 shrink-0 hidden sm:block">→</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-medium mb-0.5 ${
                                  isNewField
                                    ? "text-blue-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {isNewField ? "New Value" : "New"}
                              </div>
                              <div
                                className={`text-sm font-semibold wrap-break-word ${
                                  isNewField
                                    ? "text-blue-700"
                                    : "text-emerald-700"
                                }`}
                              >
                                {formatValue(proposedValue)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-slate-900 wrap-break-word">
                        {formatValue(proposedValue)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
