import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { type StatItem, getChartColor } from "@/lib/api/statistics";

// Custom tick component for angled labels
const AngledTick = ({
  x,
  y,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) => {
  if (!payload) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={10}
        textAnchor="end"
        fill="#64748b"
        fontSize={10}
        transform="rotate(-45)"
      >
        {payload.value.length > 12
          ? `${payload.value.substring(0, 12)}...`
          : payload.value}
      </text>
    </g>
  );
};

interface BarChartCardProps {
  title: string;
  subtitle?: string;
  data: StatItem[];
  colors: readonly string[];
  isLoading?: boolean;
  layout?: "horizontal" | "vertical";
  maxItems?: number;
  showPercentage?: boolean;
  height?: number;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StatItem }>;
}) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="font-semibold text-slate-900">{data.label}</p>
      <p className="text-sm text-slate-600">
        Count:{" "}
        <span className="font-medium">{data.count.toLocaleString()}</span>
      </p>
      <p className="text-sm text-slate-600">
        Percentage: <span className="font-medium">{data.percentage}%</span>
      </p>
    </div>
  );
};

export const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  subtitle,
  data,
  colors,
  isLoading = false,
  layout = "horizontal",
  maxItems = 10,
  showPercentage = true,
  height = 300,
}) => {
  // Limit data to maxItems and add colors
  const displayData = useMemo(() => {
    return data.slice(0, maxItems).map((item, index) => ({
      ...item,
      fill: getChartColor(index, colors),
    }));
  }, [data, maxItems, colors]);
  const hasMore = data.length > maxItems;
  const chartHeight = height > 0 ? height : 300;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {hasMore && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            Top {maxItems} of {data.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3" style={{ height: chartHeight }}>
          {[80, 65, 50, 40, 30].map((width, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
              <div
                className="h-6 animate-pulse rounded bg-slate-100"
                style={{ width: `${width}%` }}
              />
            </div>
          ))}
        </div>
      ) : displayData.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-slate-400"
          style={{ height: chartHeight }}
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm">No data available</p>
        </div>
      ) : layout === "horizontal" ? (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={displayData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 80, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                width={75}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                animationDuration={800}
                animationBegin={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ height: chartHeight }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={displayData}
              margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            >
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={<AngledTick />}
                height={60}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                animationBegin={0}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick stats below chart */}
      {!isLoading && displayData.length > 0 && showPercentage && (
        <div className="mt-4 flex flex-wrap gap-2">
          {displayData.slice(0, 5).map((item, index) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs"
              style={{
                backgroundColor: `${getChartColor(index, colors)}15`,
                color: getChartColor(index, colors),
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: getChartColor(index, colors) }}
              />
              {item.label}: {item.percentage}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
