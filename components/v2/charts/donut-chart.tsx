"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartWell } from "@/components/v2/charts/chart-well";
import { ChartEmpty } from "@/components/v2/charts/chart-empty";
import { ChartLegend, type ChartLegendItem } from "@/components/v2/charts/chart-legend";
import { V2_RECHARTS_THEME } from "@/components/v2/charts/recharts-theme";

export type DonutSlice = {
  id: string;
  label: string;
  value: number;
  color?: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  height?: number;
  className?: string;
  label?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
};

export function DonutChart({
  slices,
  height = 200,
  className,
  label,
  innerRadius = "58%",
  outerRadius = "82%",
}: DonutChartProps) {
  const total = slices.reduce((sum, s) => sum + Math.max(s.value, 0), 0);
  if (total <= 0) {
    return (
      <ChartWell height="md" label={label} className={className}>
        <ChartEmpty />
      </ChartWell>
    );
  }

  const legendItems: ChartLegendItem[] = slices.map((s) => ({
    id: s.id,
    label: s.label,
    value: `${Math.round((s.value / total) * 100)}%`,
    color: s.color,
  }));

  return (
    <ChartWell height="auto" label={label} className={className} grid={false}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip {...V2_RECHARTS_THEME.tooltip} />
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              stroke="transparent"
            >
              {slices.map((slice, i) => (
                <Cell key={slice.id} fill={slice.color ?? V2_RECHARTS_THEME.colors[i % V2_RECHARTS_THEME.colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend items={legendItems} className="mt-3" />
    </ChartWell>
  );
}
