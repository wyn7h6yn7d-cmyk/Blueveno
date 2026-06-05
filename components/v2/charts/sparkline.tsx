"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import { V2_CHART_COLORS, type V2ChartSeriesTone, v2ChartSeriesColor } from "@/components/v2/charts/chart-colors";

type SparklineProps = {
  values: number[];
  className?: string;
  tone?: V2ChartSeriesTone;
  /** Auto-detect tone from first vs last value when true */
  autoTone?: boolean;
  height?: number;
  width?: number;
  showArea?: boolean;
  ariaLabel?: string;
};

function resolveTone(values: number[], tone: V2ChartSeriesTone, autoTone: boolean): V2ChartSeriesTone {
  if (!autoTone || values.length < 2) return tone;
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  if (last > first) return "positive";
  if (last < first) return "negative";
  return "neutral";
}

export function Sparkline({
  values,
  className,
  tone = "primary",
  autoTone = false,
  height = 36,
  width = 120,
  showArea = true,
  ariaLabel,
}: SparklineProps) {
  const uid = useId();
  const resolvedTone = resolveTone(values, tone, autoTone);
  const stroke = v2ChartSeriesColor(resolvedTone);

  const { linePath, areaPath } = useMemo(() => {
    if (values.length < 2) {
      return { linePath: "", areaPath: "" };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, 1e-6);
    const padY = 4;
    const plotH = height - padY * 2;
    const plotW = width;
    const toX = (i: number) => (i / Math.max(values.length - 1, 1)) * plotW;
    const toY = (v: number) => padY + (1 - (v - min) / span) * plotH;

    const points = values.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`);
    const line = `M ${points.join(" L ")}`;
    const area = `${line} L ${plotW} ${height} L 0 ${height} Z`;
    return { linePath: line, areaPath: area };
  }, [values, height, width]);

  if (values.length < 2) {
    return (
      <svg
        className={cn("w-full overflow-visible opacity-40", className)}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden={!ariaLabel}
        aria-label={ariaLabel}
        role={ariaLabel ? "img" : undefined}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={V2_CHART_COLORS.grid}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  const areaGrad = `bv-spark-area-${uid}`;
  const areaOpacity = resolvedTone === "negative" ? 0.12 : 0.2;

  return (
    <svg
      className={cn("w-full overflow-visible", className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    >
      <defs>
        <linearGradient id={areaGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={areaOpacity} />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {showArea ? <path d={areaPath} fill={`url(#${areaGrad})`} /> : null}
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth="1.25"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
