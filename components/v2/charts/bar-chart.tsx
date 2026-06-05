"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartWell } from "@/components/v2/charts/chart-well";
import { ChartEmpty } from "@/components/v2/charts/chart-empty";
import { V2_RECHARTS_THEME } from "@/components/v2/charts/recharts-theme";
import { V2_CHART_COLORS } from "@/components/v2/charts/chart-colors";
import { sanitizeChartRows } from "@/lib/v2/sanitize-chart-data";
import { safeFiniteNumber } from "@/lib/v2/safe-number";

export type BarChartPoint = Record<string, string | number>;

type BarChartProps = {
  data: BarChartPoint[];
  xKey: string;
  yKey: string;
  height?: number;
  className?: string;
  label?: string;
  /** Color bars by sign of yKey value */
  colorBySign?: boolean;
};

export function BarChart({
  data,
  xKey,
  yKey,
  height = 220,
  className,
  label,
  colorBySign = true,
}: BarChartProps) {
  const safeData = sanitizeChartRows(data, [yKey]);

  if (safeData.length === 0) {
    return (
      <ChartWell height="md" label={label} className={className}>
        <ChartEmpty />
      </ChartWell>
    );
  }

  return (
    <ChartWell height="auto" label={label} className={className} grid={false}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={safeData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...V2_RECHARTS_THEME.grid} vertical={false} />
            <XAxis dataKey={xKey} {...V2_RECHARTS_THEME.axis} />
            <YAxis {...V2_RECHARTS_THEME.axis} width={40} />
            <Tooltip {...V2_RECHARTS_THEME.tooltip} />
            <Bar dataKey={yKey} radius={[3, 3, 0, 0]} maxBarSize={32}>
              {colorBySign
                ? safeData.map((entry, i) => {
                    const v = safeFiniteNumber(entry[yKey], 0);
                    const fill =
                      v > 0
                        ? V2_CHART_COLORS.positive
                        : v < 0
                          ? V2_CHART_COLORS.negative
                          : V2_CHART_COLORS.neutral;
                    return <Cell key={i} fill={fill} />;
                  })
                : null}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </ChartWell>
  );
}
