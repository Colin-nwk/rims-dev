import React, { useEffect, useState } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "emerald" | "blue" | "violet" | "amber" | "rose";
  isLoading?: boolean;
}

const colorMap = {
  emerald: {
    bg: "from-emerald-500 to-emerald-700",
    icon: "bg-emerald-400/30",
    ring: "ring-emerald-400/20",
  },
  blue: {
    bg: "from-blue-500 to-blue-700",
    icon: "bg-blue-400/30",
    ring: "ring-blue-400/20",
  },
  violet: {
    bg: "from-violet-500 to-violet-700",
    icon: "bg-violet-400/30",
    ring: "ring-violet-400/20",
  },
  amber: {
    bg: "from-amber-500 to-amber-700",
    icon: "bg-amber-400/30",
    ring: "ring-amber-400/20",
  },
  rose: {
    bg: "from-rose-500 to-rose-700",
    icon: "bg-rose-400/30",
    ring: "ring-rose-400/20",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
  isLoading = false,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const colors = colorMap[color];

  // Animated count-up effect
  useEffect(() => {
    if (isLoading) {
      setDisplayValue(0);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isLoading]);

  const formatValue = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-linear-to-br ${colors.bg} p-6 shadow-xl ring-1 ${colors.ring} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id={`grid-${color}`}
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#grid-${color})`} />
        </svg>
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            {isLoading ? (
              <div className="h-10 w-24 animate-pulse rounded-lg bg-white/20" />
            ) : (
              <span className="text-4xl font-bold tracking-tight text-white">
                {formatValue(displayValue)}
              </span>
            )}
            {trend && !isLoading && (
              <span
                className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                  trend.isPositive
                    ? "bg-green-400/20 text-green-100"
                    : "bg-red-400/20 text-red-100"
                }`}
              >
                {trend.isPositive ? "↑" : "↓"}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
        </div>

        <div className={`rounded-xl ${colors.icon} p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
    </div>
  );
};
