import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { type StatItem } from "@/lib/api/statistics";

interface TrendChartProps {
  title: string;
  subtitle?: string;
  yearlyData: StatItem[];
  monthlyData?: StatItem[];
  isLoading?: boolean;
  height?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-2 font-semibold text-slate-900">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-slate-600">{entry.name}:</span>
          <span className="font-medium text-slate-900">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

export const TrendChart: React.FC<TrendChartProps> = ({
  title,
  subtitle,
  yearlyData,
  monthlyData,
  isLoading = false,
  height = 350,
}) => {
  // Calculate summary stats
  const totalAppointments = yearlyData.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const peakYear = yearlyData.reduce(
    (max, item) => (item.count > max.count ? item : max),
    yearlyData[0] || { label: "N/A", count: 0 },
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>

        {/* Summary badges */}
        {!isLoading && yearlyData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Total: {totalAppointments.toLocaleString()}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Peak: {peakYear.label} ({peakYear.count.toLocaleString()})
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : yearlyData.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-slate-400"
          style={{ height }}
        >
          <svg
            className="mb-2 h-12 w-12 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          <p className="text-sm">No trend data available</p>
        </div>
      ) : (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={yearlyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickMargin={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}K` : value
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-slate-600">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Appointments"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#colorCount)"
                animationDuration={1000}
                animationBegin={0}
                dot={{
                  r: 4,
                  fill: "#10b981",
                  strokeWidth: 2,
                  stroke: "white",
                }}
                activeDot={{
                  r: 6,
                  fill: "#10b981",
                  strokeWidth: 2,
                  stroke: "white",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Monthly breakdown if available */}
      {!isLoading && monthlyData && monthlyData.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h4 className="mb-3 text-sm font-medium text-slate-700">
            Monthly Distribution
          </h4>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {monthlyData.map((month) => (
              <div
                key={month.label}
                className="rounded-lg bg-slate-50 p-2 text-center transition-colors hover:bg-slate-100"
              >
                <p className="text-xs font-medium text-slate-500">
                  {month.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {month.count.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
