import React from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  type ChangeRequest,
  getModelName,
  getStatusColor,
  getTypeColor,
  getIdentifier,
} from "@/lib/api/change-requests";
import { FilePreviewLink } from "@/components/file-preview-link/FilePreviewLink";
import { User, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ChangeRequest | null;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  if (!request) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
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
    // Remove any prefix before the last dot
    const cleanKey = key.includes(".") ? key.split(".").pop() || key : key;
    return cleanKey
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Check if a string looks like an ISO date
  const isISODateString = (value: string): boolean => {
    // Match ISO 8601 date formats like "2025-01-06T00:00:00.000000Z" or "2025-01-06"
    const isoDateRegex =
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;
    return isoDateRegex.test(value);
  };

  // Format a date value nicely
  const formatDateValue = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Check if time is midnight (date only)
    const hasTime =
      date.getHours() !== 0 ||
      date.getMinutes() !== 0 ||
      date.getSeconds() !== 0;

    if (hasTime) {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format data value for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "string" && isISODateString(value)) {
      return formatDateValue(value);
    }
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const isFileLinkKey = (key: string): boolean => {
    const normalizedKey = key.toLowerCase();
    return (
      normalizedKey === "file_path" ||
      normalizedKey.endsWith(".file_path") ||
      normalizedKey === "url" ||
      normalizedKey.endsWith(".url") ||
      normalizedKey === "certificate_url" ||
      normalizedKey.endsWith(".certificate_url") ||
      normalizedKey === "photo" ||
      normalizedKey.endsWith(".photo")
    );
  };

  const getFileLinkValue = (value: unknown): string | null => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  };

  const isFileMetaKey = (key: string): boolean => {
    const normalizedKey = key.toLowerCase();
    return (
      normalizedKey.endsWith("file_size") ||
      normalizedKey.endsWith("mime_type") ||
      normalizedKey.endsWith("file_type") ||
      normalizedKey.endsWith("file_name") ||
      normalizedKey.endsWith("filename") ||
      normalizedKey.endsWith("content_type") ||
      normalizedKey.endsWith("content_length")
    );
  };

  const getKeyPrefix = (key: string): string => {
    const parts = key.split(".");
    parts.pop();
    return parts.join(".");
  };

  // Helper to flatten nested data for comparison (e.g., {details: {ippis: "123"}} -> {"details.ippis": "123"})
  const flattenData = (
    data: Record<string, unknown>,
    prefix = "",
  ): Record<string, unknown> => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof File)
      ) {
        // Recursively flatten nested objects
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

  const flattenedData = flattenData(request.data);
  const fileLinkAvailability = Object.entries(flattenedData).reduce(
    (acc, [key, value]) => {
      if (isFileLinkKey(key) && getFileLinkValue(value)) {
        acc.add(getKeyPrefix(key));
      }
      return acc;
    },
    new Set<string>(),
  );

  const shouldHideFileMetaKey = (key: string): boolean => {
    if (!isFileMetaKey(key)) return false;
    return !fileLinkAvailability.has(getKeyPrefix(key));
  };

  // Helper to get current value from model data (handles nested paths like details.ippis)
  const getCurrentValue = (key: string): unknown => {
    if (!request.model) return undefined;

    // Handle nested keys (e.g., "details.ippis")
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

  // Check if values are different (handles null/undefined/empty string equality)
  const valuesAreDifferent = (
    currentVal: unknown,
    proposedVal: unknown,
  ): boolean => {
    // Normalize null, undefined, and empty string
    const normalize = (val: unknown) => {
      if (val === null || val === undefined || val === "") return null;
      return val;
    };

    const normCurrent = normalize(currentVal);
    const normProposed = normalize(proposedVal);

    if (normCurrent === normProposed) return false;

    // For objects/arrays, do JSON comparison
    if (typeof normCurrent === "object" || typeof normProposed === "object") {
      return JSON.stringify(normCurrent) !== JSON.stringify(normProposed);
    }

    // Convert to string for comparison
    return String(normCurrent) !== String(normProposed);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Request Details"
      description={`Review the details of this ${request.type.toLowerCase()} request`}
      size="2xl"
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
              {(() => {
                const identifier = getIdentifier(request);
                if (identifier === "-") return null;
                const isEmail = identifier.includes("@");
                return (
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
                );
              })()}
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

          {/* Info banner when model data is missing for UPDATE/SENSITIVE */}
          {(request.type === "UPDATE" || request.type === "SENSITIVE") &&
            !request.model && (
              <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Current values are not available for
                  comparison. Only proposed changes are shown below.
                </p>
              </div>
            )}

          <div className="overflow-hidden border rounded-lg bg-slate-50 border-slate-200">
            <div className="max-h-96 overflow-y-auto p-4">
              {request.type === "CREATE" ? (
                // For CREATE requests, show simple grid
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(request.data).map(([key, value]) => {
                    const filePath = isFileLinkKey(key)
                      ? getFileLinkValue(value)
                      : null;

                    if (shouldHideFileMetaKey(key)) return null;

                    return (
                      <div
                        key={key}
                        className="p-3 bg-white border rounded-md border-slate-100 hover:shadow-sm transition-shadow"
                      >
                        <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                          {formatKey(key)}
                        </span>
                        <span className="block mt-1 text-sm text-slate-900 wrap-break-word">
                          {isFileLinkKey(key) && !filePath
                            ? "File has been removed"
                            : formatValue(value)}
                        </span>
                        {filePath && (
                          <div className="mt-2">
                            <FilePreviewLink value={filePath} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // For UPDATE/SENSITIVE requests, show before/after comparison
                <div className="space-y-2">
                  {(() => {
                    const entries = Object.entries(flattenedData);

                    return entries.map(([key, proposedValue]) => {
                      if (shouldHideFileMetaKey(key)) return null;

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
                          className={`p-4 bg-white border rounded-lg transition-all ${
                            isNewField
                              ? "border-blue-200 bg-blue-50/50"
                              : hasChanged
                                ? "border-amber-200 bg-amber-50/50"
                                : "border-slate-100"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                {formatKey(key)}
                              </span>

                              {request.model && request.model_id ? (
                                // Show before/after comparison
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                  {!isNewField && (
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs text-slate-400 mb-1">
                                        Current
                                      </div>
                                      <div
                                        className={`text-sm font-medium wrap-break-word ${
                                          isActualChange
                                            ? "text-slate-500 line-through"
                                            : "text-slate-700"
                                        }`}
                                      >
                                        {formatValue(currentValue)}
                                      </div>
                                      {isFileLinkKey(key) &&
                                        getFileLinkValue(currentValue) && (
                                          <div className="mt-2">
                                            <FilePreviewLink
                                              value={
                                                getFileLinkValue(
                                                  currentValue,
                                                ) as string
                                              }
                                            />
                                          </div>
                                        )}
                                    </div>
                                  )}

                                  {hasChanged && (
                                    <>
                                      {!isNewField && (
                                        <>
                                          <div className="hidden sm:block shrink-0">
                                            <svg
                                              className="w-5 h-5 text-amber-500"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                              />
                                            </svg>
                                          </div>
                                          <div className="sm:hidden shrink-0">
                                            <svg
                                              className="w-4 h-4 text-amber-500"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                              />
                                            </svg>
                                          </div>
                                        </>
                                      )}

                                      <div className="flex-1 min-w-0">
                                        <div
                                          className={`text-xs font-medium mb-1 ${
                                            isNewField
                                              ? "text-blue-600"
                                              : "text-emerald-600"
                                          }`}
                                        >
                                          {isNewField
                                            ? "New Value"
                                            : "Proposed"}
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
                                        {isFileLinkKey(key) &&
                                          getFileLinkValue(proposedValue) && (
                                            <div className="mt-2">
                                              <FilePreviewLink
                                                value={
                                                  getFileLinkValue(
                                                    proposedValue,
                                                  ) as string
                                                }
                                              />
                                            </div>
                                          )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                // No current data available, just show proposed
                                <div className="text-sm font-medium text-slate-900 wrap-break-word">
                                  {formatValue(proposedValue)}
                                  {isFileLinkKey(key) &&
                                    getFileLinkValue(proposedValue) && (
                                      <div className="mt-2">
                                        <FilePreviewLink
                                          value={
                                            getFileLinkValue(
                                              proposedValue,
                                            ) as string
                                          }
                                        />
                                      </div>
                                    )}
                                </div>
                              )}
                            </div>

                            {isNewField && (
                              <div className="shrink-0">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  New
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};
