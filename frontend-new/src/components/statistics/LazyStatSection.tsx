import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ChartSkeleton } from "./ChartSkeleton";

interface LazyStatSectionProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  defaultExpanded?: boolean;
  onVisible?: () => void;
}

export const LazyStatSection: React.FC<LazyStatSectionProps> = ({
  title,
  children,
  isLoading = false,
  defaultExpanded = true,
  onVisible,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
          onVisible?.();
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasBeenVisible, onVisible]);

  return (
    <div ref={sectionRef} className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-all hover:bg-slate-50"
      >
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4">
          {!hasBeenVisible || isLoading ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartSkeleton type="bar" />
              <ChartSkeleton type="bar" />
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};
