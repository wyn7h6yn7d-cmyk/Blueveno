"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartWell } from "@/components/v2/charts/chart-well";
import { ChartEmpty } from "@/components/v2/charts/chart-empty";
import { V2_RECHARTS_THEME } from "@/components/v2/charts/recharts-theme";
import { V2_CHART_COLORS } from "@/components/v2/charts/chart-colors";
import { cn } from "@/lib/utils";

export type LineAreaPoint = Record<string, string | number>;

type LineAreaChartProps = {
  data: LineAreaPoint[];
  xKey: string;
  yKey: string;
  variant?: "line" | "area";
  height?: number;
  className?: string;
  label?: string;
  positiveTone?: boolean;
};

export function LineAreaChart({
  data,
  xKey,
  yKey,
  variant = "area",
  height = 240,
  className,
  label,
  positiveTone,
}: LineAreaChartProps) {
  if (data.length < 2) {
    return (
      <ChartWell height="md" label={label} className={className}>
        <ChartEmpty />
      </ChartWell>
    );
  }

  const stroke =
    positiveTone === true
      ? V2_CHART_COLORS.positive
      : positiveTone === false
        ? V2_CHART_COLORS.negative
        : V2_CHART_COLORS.primary;

  const Chart = variant === "area" ? AreaChart : LineChart;
  const Series = variant === "area" ? Area : Line;

  return (
    <ChartWell height="auto" label={label} className={className} grid={false}>
      <div className={cn("w-full")} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...V2_RECHARTS_THEME.grid} vertical={false} />
            <XAxis dataKey={xKey} {...V2_RECHARTS_THEME.axis} />
            <YAxis {...V2_RECHARTS_THEME.axis} width={40} />
            <Tooltip {...V2_RECHARTS_THEME.tooltip} />
            <Series
              type="monotone"
              dataKey={yKey}
              stroke={stroke}
              fill={variant === "area" ? stroke : undefined}
              fillOpacity={variant === "area" ? 0.18 : undefined}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: stroke }}
            />
          </Chart>
        </ResponsiveContainer>
      </div>
    </ChartWell>
  );
}
