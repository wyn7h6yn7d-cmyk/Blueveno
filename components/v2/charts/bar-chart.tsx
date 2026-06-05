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
import { cn } from "@/lib/utils";

export type BarChartPoint = Record<string, string | number>;

type BarChartProps = {
  data: BarChartPoint[];
  xKey: string;
  yKey: string;
  height?: number;
  className?: string;
  wellClassName?: string;
  label?: string;
  /** Color bars by sign of yKey value */
  colorBySign?: boolean;
  /** Brighter axes for dashboard hero charts */
  enhanced?: boolean;
};

export function BarChart({
  data,
  xKey,
  yKey,
  height = 220,
  className,
  wellClassName,
  label,
  colorBySign = true,
  enhanced = false,
}: BarChartProps) {
  const safeData = sanitizeChartRows(data, [yKey]);

  if (safeData.length === 0) {
    return (
      <ChartWell height="md" label={label} className={cn(className, wellClassName)}>
        <ChartEmpty />
      </ChartWell>
    );
  }

  const axisTheme = enhanced
    ? {
        ...V2_RECHARTS_THEME.axis,
        tick: { fill: "oklch(0.7 0.04 252)", fontSize: 11 },
      }
    : V2_RECHARTS_THEME.axis;

  const gridTheme = enhanced
    ? { ...V2_RECHARTS_THEME.grid, stroke: V2_CHART_COLORS.gridStrong }
    : V2_RECHARTS_THEME.grid;

  return (
    <ChartWell height="auto" label={label} className={cn(className, wellClassName)} grid={enhanced}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={safeData} margin={{ top: 10, right: 12, left: 2, bottom: 4 }}>
            <CartesianGrid {...gridTheme} vertical={false} />
            <XAxis dataKey={xKey} {...axisTheme} />
            <YAxis {...axisTheme} width={enhanced ? 44 : 40} />
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
