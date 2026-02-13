import { useEffect, useRef } from "react";
import { staffFormTabs } from "./staff-form-tabs";

interface TabNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNav({ activeTab, onTabChange }: TabNavProps) {
  const tabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabContainerRef.current) {
      const activeElement = tabContainerRef.current.querySelector(
        `[data-tab="${activeTab}"]`,
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [activeTab]);

  return (
    <div className="bg-white sticky top-0 z-10">
      <div
        ref={tabContainerRef}
        className="flex overflow-x-auto px-4 pb-2"
        style={{
          scrollbarWidth: "thin",
        }}
      >
        {staffFormTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              data-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.title}</span>
            </button>
          );
        })}
      </div>
      <div className="h-px bg-slate-200" />
    </div>
  );
}
