import { Eye, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type ChangeRequest,
  type RequestStatus,
  getStatusColor,
  getTypeColor,
  getModelName,
} from "@/lib/api/change-requests/types";
import { formatRelativeTime, formatFieldName } from "@/lib/utils";

interface RequestCardProps {
  request: ChangeRequest;
  onViewDetails: (request: ChangeRequest) => void;
}

const statusIcons: Record<RequestStatus, React.ElementType> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
};

const statusBorderColors: Record<RequestStatus, string> = {
  PENDING: "border-l-amber-400",
  APPROVED: "border-l-emerald-400",
  REJECTED: "border-l-red-400",
};

const getRequestDescription = (request: ChangeRequest): string => {
  const modelName = getModelName(request.model_type);
  const changedFields = Object.keys(request.data || {});

  if (request.type === "CREATE") {
    return `New ${modelName} creation request`;
  }

  if (changedFields.length === 0) {
    return `${modelName} update request`;
  }

  const fieldNames = changedFields
    .slice(0, 10)
    .map((key) => formatFieldName(key))
    .join(", ");

  const suffix =
    changedFields.length > 10 ? ` +${changedFields.length - 10} more` : "";

  return `Changes to: ${fieldNames}${suffix}`;
};

export const RequestCard = ({ request, onViewDetails }: RequestCardProps) => {
  const StatusIcon = statusIcons[request.status];
  const borderColor = statusBorderColors[request.status];
  const modelName = getModelName(request.model_type);
  const description = getRequestDescription(request);

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${borderColor}`}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(request.type)}`}
            >
              {request.type}
            </span>
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
            >
              <StatusIcon className="w-3 h-3" />
              {request.status}
            </span>
          </div>
          {/* Relative Time */}
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {formatRelativeTime(request.created_at)}
          </span>
        </div>

        {/* Model Type Title */}
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          {modelName} {request.type === "CREATE" ? "Creation" : "Update"}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-3">{description}</p>
      </div>

      {/* Rejection Reason (if rejected) */}
      {request.status === "REJECTED" && request.rejection_reason && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-red-700 mb-1">
                Rejection Reason
              </p>
              <p className="text-sm text-red-600 line-clamp-2">
                {request.rejection_reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approved By (if approved) */}
      {request.status === "APPROVED" && request.approver && (
        <div className="px-4 py-3 bg-emerald-50 border-t border-emerald-100">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <p className="text-sm text-emerald-700">
              Approved by{" "}
              <span className="font-medium">{request.approver.name}</span>
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(request)}
          className="w-full text-slate-600 hover:text-slate-900"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </div>
  );
};

export default RequestCard;
