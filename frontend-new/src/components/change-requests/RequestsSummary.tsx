import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface RequestsSummaryProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  activeStatus: StatusFilter;
  onStatusClick: (status: StatusFilter) => void;
  isLoading?: boolean;
}

interface StatCardProps {
  label: string;
  count: number;
  icon: React.ElementType;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  textColor: string;
  isActive: boolean;
  onClick: () => void;
  isLoading?: boolean;
}

const StatCard = ({
  label,
  count,
  icon: Icon,
  bgColor,
  borderColor,
  iconBg,
  textColor,
  isActive,
  onClick,
  isLoading,
}: StatCardProps) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-xl border transition-all duration-200 text-left w-full ${bgColor} ${borderColor} ${
      isActive
        ? "ring-2 ring-offset-2 ring-ncos-green-500 shadow-md"
        : "hover:shadow-md"
    }`}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-sm font-medium text-slate-600">{label}</span>
    </div>
    {isLoading ? (
      <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
    ) : (
      <p className={`text-2xl sm:text-3xl font-bold ${textColor}`}>{count}</p>
    )}
  </button>
);

export const RequestsSummary = ({
  total,
  pending,
  approved,
  rejected,
  activeStatus,
  onStatusClick,
  isLoading,
}: RequestsSummaryProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label="Total"
        count={total}
        icon={FileText}
        bgColor="bg-slate-50"
        borderColor="border-slate-200"
        iconBg="bg-slate-500"
        textColor="text-slate-700"
        isActive={activeStatus === "all"}
        onClick={() => onStatusClick("all")}
        isLoading={isLoading}
      />
      <StatCard
        label="Pending"
        count={pending}
        icon={Clock}
        bgColor="bg-amber-50"
        borderColor="border-amber-200"
        iconBg="bg-amber-500"
        textColor="text-amber-600"
        isActive={activeStatus === "pending"}
        onClick={() => onStatusClick("pending")}
        isLoading={isLoading}
      />
      <StatCard
        label="Approved"
        count={approved}
        icon={CheckCircle}
        bgColor="bg-emerald-50"
        borderColor="border-emerald-200"
        iconBg="bg-emerald-500"
        textColor="text-emerald-600"
        isActive={activeStatus === "approved"}
        onClick={() => onStatusClick("approved")}
        isLoading={isLoading}
      />
      <StatCard
        label="Rejected"
        count={rejected}
        icon={XCircle}
        bgColor="bg-red-50"
        borderColor="border-red-200"
        iconBg="bg-red-500"
        textColor="text-red-600"
        isActive={activeStatus === "rejected"}
        onClick={() => onStatusClick("rejected")}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RequestsSummary;
