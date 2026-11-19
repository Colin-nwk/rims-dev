import React, { useMemo } from "react";
import { PieChart, Pie, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { type StatItem, getChartColor } from "@/lib/api/statistics";

interface PieChartCardProps {
  title: string;
  subtitle?: string;
  data: StatItem[] | Record<string, StatItem>;
  colors: readonly string[];
  isLoading?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
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

const CustomLegend = ({
  payload,
  colors,
}: {
  payload?: Array<{ value: string; color: string }>;
  colors: readonly string[];
}) => {
  if (!payload) return null;

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
      {payload.map((entry, index) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
          <span className="text-xs text-slate-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

function normalizeStatItems(
  data: StatItem[] | Record<string, StatItem> | null | undefined,
): StatItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return Object.values(data);
}

export const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  subtitle,
  data,
  colors,
  isLoading = false,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 90,
  height = 256,
}) => {
  const chartHeight = height > 0 ? height : 256;
  const normalizedData = useMemo(() => normalizeStatItems(data), [data]);
  const total = normalizedData.reduce((sum, item) => sum + item.count, 0);

  // Add fill colors to data
  const coloredData = useMemo(() => {
    return normalizedData.map((item, index) => ({
      ...item,
      fill: getChartColor(index, colors),
    }));
  }, [normalizedData, colors]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-44 w-44 animate-pulse rounded-full bg-slate-100" />
        </div>
      ) : normalizedData.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-slate-400">
          <svg
            className="h-12 w-12 mb-2 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
          <p className="text-sm">No data available</p>
        </div>
      ) : (
        <>
          <div className="relative" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={coloredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="label"
                  animationDuration={800}
                  animationBegin={0}
                  stroke="white"
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
                {showLegend && (
                  <Legend
                    content={({ payload }) => (
                      <CustomLegend
                        payload={
                          payload as Array<{ value: string; color: string }>
                        }
                        colors={colors}
                      />
                    )}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {total.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
