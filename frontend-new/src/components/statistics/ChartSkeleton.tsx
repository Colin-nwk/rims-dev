import React from "react";

interface ChartSkeletonProps {
  type: "stat" | "pie" | "bar" | "trend";
  className?: string;
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({
  type,
  className = "",
}) => {
  if (type === "stat") {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-200 to-slate-300 p-6 ${className}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-400/30" />
            <div className="h-10 w-32 animate-pulse rounded bg-slate-400/30" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-400/30" />
          </div>
          <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-400/30" />
        </div>
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-linear-to-r from-transparent via-white/20 to-transparent" />
      </div>
    );
  }

  if (type === "pie") {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}
      >
        <div className="mb-4 space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="flex h-64 items-center justify-center">
          <div className="relative">
            <div className="h-44 w-44 animate-pulse rounded-full bg-slate-100" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-white" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="h-3 w-3 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "bar") {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}
      >
        <div className="mb-4 space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-4">
          {[100, 85, 70, 55, 40].map((width, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div
                className="h-6 animate-pulse rounded bg-slate-100"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Trend chart skeleton
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`}
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-slate-100">
        {/* Fake chart lines */}
        <svg className="h-full w-full" viewBox="0 0 400 200">
          <path
            d="M 20 150 Q 100 100 180 120 T 340 80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};

// Grid skeleton for multiple stat cards
export const StatCardsGridSkeleton: React.FC = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((i) => (
      <ChartSkeleton key={i} type="stat" />
    ))}
  </div>
);

// Full page skeleton
export const StatisticsPageSkeleton: React.FC = () => (
  <div className="space-y-6">
    <StatCardsGridSkeleton />
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartSkeleton type="pie" />
      <ChartSkeleton type="pie" />
    </div>
    <ChartSkeleton type="bar" />
    <ChartSkeleton type="trend" />
  </div>
);
