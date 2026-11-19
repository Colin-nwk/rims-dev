import { ListFilter, Clock, CheckCircle, XCircle } from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

interface StatusTabsProps {
  activeTab: StatusFilter;
  onTabChange: (tab: StatusFilter) => void;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

const tabs: {
  id: StatusFilter;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "all", label: "All Requests", icon: ListFilter },
  { id: "pending", label: "Pending", icon: Clock },
  { id: "approved", label: "Approved", icon: CheckCircle },
  { id: "rejected", label: "Rejected", icon: XCircle },
];

export const StatusTabs = ({
  activeTab,
  onTabChange,
  counts,
}: StatusTabsProps) => {
  return (
    <div className="flex gap-1 p-1 bg-white border rounded-lg shadow-sm border-slate-200 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const count = counts[tab.id];
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              isActive
                ? "bg-ncos-green-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
            {count > 0 && (
              <span
                className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.id === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : tab.id === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : tab.id === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-slate-100 text-slate-800"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StatusTabs;
