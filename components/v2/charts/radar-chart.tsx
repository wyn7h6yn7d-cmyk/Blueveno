"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChartWell } from "@/components/v2/charts/chart-well";
import { ChartEmpty } from "@/components/v2/charts/chart-empty";
import { V2_RECHARTS_THEME } from "@/components/v2/charts/recharts-theme";
import { V2_CHART_COLORS } from "@/components/v2/charts/chart-colors";

export type RadarPoint = {
  axis: string;
  value: number;
};

type RadarChartProps = {
  data: RadarPoint[];
  height?: number;
  className?: string;
  label?: string;
};

export function RadarChart({ data, height = 220, className, label }: RadarChartProps) {
  if (data.length < 3) {
    return (
      <ChartWell height="md" label={label} className={className}>
        <ChartEmpty title="Need more dimensions" description="Add at least three metrics to render a radar chart." />
      </ChartWell>
    );
  }

  return (
    <ChartWell height="auto" label={label} className={className} grid={false}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} outerRadius="72%">
            <PolarGrid stroke={V2_CHART_COLORS.grid} />
            <PolarAngleAxis dataKey="axis" tick={{ fill: "oklch(0.55 0.02 260)", fontSize: 10 }} />
            <Tooltip {...V2_RECHARTS_THEME.tooltip} />
            <Radar
              dataKey="value"
              stroke={V2_CHART_COLORS.primary}
              fill={V2_CHART_COLORS.primary}
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </ChartWell>
  );
}
