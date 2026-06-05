"use client";

import { LineAreaChart, type LineAreaPoint } from "@/components/v2/charts/line-area-chart";
import { sanitizeChartRows } from "@/lib/v2/sanitize-chart-data";

type TrendChartProps = {
  data: LineAreaPoint[];
  xKey: string;
  yKey: string;
  variant?: "line" | "area";
  height?: number;
  className?: string;
  label?: string;
  positiveTone?: boolean;
};

/** Line/area trend chart with sanitized numeric series (no NaN/Infinity). */
export function TrendChart({ data, yKey, ...props }: TrendChartProps) {
  const safeData = sanitizeChartRows(data, [yKey]);
  return <LineAreaChart data={safeData} yKey={yKey} {...props} />;
}
