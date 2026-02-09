import { Clock, CheckCircle, XCircle, Inbox } from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface EmptyStateProps {
  status: StatusFilter;
}

const emptyStateConfig = {
  all: {
    icon: Inbox,
    title: "No change requests yet",
    message:
      "You haven't submitted any change requests. When you update your profile or request changes, they'll appear here.",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-400",
  },
  pending: {
    icon: Clock,
    title: "No pending requests",
    message:
      "Great! You don't have any requests awaiting approval. All caught up!",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-400",
  },
  approved: {
    icon: CheckCircle,
    title: "No approved requests",
    message:
      "No approved requests yet. Once your pending requests are approved, they'll appear here.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-400",
  },
  rejected: {
    icon: XCircle,
    title: "No rejected requests",
    message: "No rejected requests. That's good news!",
    iconBg: "bg-red-50",
    iconColor: "text-red-400",
  },
};

export const EmptyState = ({ status }: EmptyStateProps) => {
  const config = emptyStateConfig[status];
  const Icon = config.icon;

  return (
    <div className="p-12 text-center border rounded-xl border-slate-200 bg-white">
      <div className="flex flex-col items-center gap-4">
        <div
          className={`flex items-center justify-center w-16 h-16 rounded-full ${config.iconBg}`}
        >
          <Icon className={`w-8 h-8 ${config.iconColor}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {config.title}
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {config.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
