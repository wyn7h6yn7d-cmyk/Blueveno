"use client";

import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartWell } from "@/components/v2/charts/chart-well";
import { ChartEmpty } from "@/components/v2/charts/chart-empty";
import { BalanceCurveTooltip } from "@/components/v2/charts/line-area-chart-tooltip";
import { V2_RECHARTS_THEME } from "@/components/v2/charts/recharts-theme";
import { V2_CHART_COLORS } from "@/components/v2/charts/chart-colors";
import { computeBalanceYDomain } from "@/lib/charts/compute-y-domain";
import { cn } from "@/lib/utils";

export type LineAreaPoint = Record<string, string | number>;

type YScaleMode = "zero" | "balance";
type AreaFillBase = "zero" | "min";
type TooltipVariant = "default" | "balance";

type LineAreaChartProps = {
  data: LineAreaPoint[];
  xKey: string;
  yKey: string;
  variant?: "line" | "area";
  height?: number;
  className?: string;
  wellClassName?: string;
  label?: string;
  positiveTone?: boolean;
  /** Brighter axes and richer brand area fill for hero charts */
  enhanced?: boolean;
  /**
   * `zero` — P&L-style charts that may include zero (default).
   * `balance` — zoomed capital/balance domain; area fill never uses baseline 0 unless `areaFillBase="zero"`.
   */
  yScale?: YScaleMode;
  /** Override area baseline. On balance charts defaults to series minimum. */
  areaFillBase?: AreaFillBase;
  /** Starting balance for zoomed financial Y-domain (`yScale="balance"`). */
  startingBalance?: number | null;
  /** Horizontal reference line (e.g. starting balance). */
  referenceValue?: number | null;
  referenceLabel?: string;
  tooltipVariant?: TooltipVariant;
  currency?: string;
};

function filterValidRows(data: LineAreaPoint[], yKey: string): LineAreaPoint[] {
  return data.filter((row) => {
    const y = row[yKey];
    return typeof y === "number" && Number.isFinite(y);
  });
}

function formatYAxisTick(value: number, balanceScale: boolean): string {
  if (!Number.isFinite(value)) return "";
  if (!balanceScale) return String(value);
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(0)}k`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function LineAreaChart({
  data,
  xKey,
  yKey,
  variant = "area",
  height = 240,
  className,
  wellClassName,
  label,
  positiveTone,
  enhanced = false,
  yScale = "zero",
  areaFillBase = "zero",
  startingBalance = null,
  referenceValue = null,
  referenceLabel = "Start",
  tooltipVariant = "default",
  currency = "USD",
}: LineAreaChartProps) {
  const fillId = useId().replace(/:/g, "");
  const safeData = useMemo(() => filterValidRows(data, yKey), [data, yKey]);

  const yValues = useMemo(
    () => safeData.map((row) => row[yKey]).filter((v): v is number => typeof v === "number" && Number.isFinite(v)),
    [safeData, yKey],
  );

  const isBalanceChart = yScale === "balance";
  const resolvedAreaFillBase: AreaFillBase =
    isBalanceChart && areaFillBase !== "zero" ? "min" : areaFillBase;

  const yDomain = useMemo((): [number, number] | undefined => {
    if (!isBalanceChart) return undefined;
    return computeBalanceYDomain(yValues, startingBalance);
  }, [isBalanceChart, yValues, startingBalance]);

  const areaBaseValue = useMemo(() => {
    if (variant !== "area") return undefined;
    if (resolvedAreaFillBase === "min" && yValues.length > 0) {
      return Math.min(...yValues);
    }
    if (resolvedAreaFillBase === "zero") return 0;
    return 0;
  }, [resolvedAreaFillBase, variant, yValues]);

  const showReference =
    referenceValue !== null &&
    referenceValue !== undefined &&
    Number.isFinite(referenceValue) &&
    yValues.length >= 2;

  if (safeData.length < 2) {
    return (
      <ChartWell height="md" label={label} className={cn(className, wellClassName)}>
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

  const axisTheme = enhanced
    ? {
        ...V2_RECHARTS_THEME.axis,
        tick: { fill: "oklch(0.7 0.04 252)", fontSize: 11 },
      }
    : V2_RECHARTS_THEME.axis;

  const gridTheme = enhanced
    ? { ...V2_RECHARTS_THEME.grid, stroke: V2_CHART_COLORS.gridStrong }
    : V2_RECHARTS_THEME.grid;

  const useGradientFill =
    variant === "area" && (isBalanceChart || resolvedAreaFillBase === "min" || enhanced);
  const fillTopOpacity = enhanced ? 0.14 : 0.1;
  const strokeWidth = isBalanceChart || enhanced ? 2.5 : 2;

  const Chart = variant === "area" ? AreaChart : LineChart;
  const Series = variant === "area" ? Area : Line;

  return (
    <ChartWell height="auto" label={label} className={cn(className, wellClassName)} grid={enhanced}>
      <div className={cn("w-full")} style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={safeData} margin={{ top: 10, right: 12, left: 2, bottom: 4 }}>
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={fillTopOpacity} />
                <stop offset="85%" stopColor={stroke} stopOpacity={0.02} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridTheme} vertical={false} />
            <XAxis dataKey={xKey} {...axisTheme} />
            <YAxis
              {...axisTheme}
              width={enhanced ? 44 : 40}
              domain={yDomain ?? ["auto", "auto"]}
              allowDataOverflow={isBalanceChart}
              tickFormatter={(v) => formatYAxisTick(Number(v), isBalanceChart)}
            />
            {tooltipVariant === "balance" ? (
              <Tooltip
                cursor={{ stroke: "oklch(0.55 0.04 252 / 0.35)", strokeWidth: 1 }}
                content={(props) => (
                  <BalanceCurveTooltip
                    active={props.active}
                    payload={props.payload}
                    label={props.label}
                    currency={currency}
                  />
                )}
              />
            ) : (
              <Tooltip {...V2_RECHARTS_THEME.tooltip} />
            )}
            {showReference ? (
              <ReferenceLine
                y={referenceValue}
                stroke="oklch(0.58 0.06 252 / 0.45)"
                strokeDasharray="5 4"
                strokeWidth={1}
                label={{
                  value: referenceLabel,
                  position: "insideTopRight",
                  fill: "oklch(0.55 0.04 252)",
                  fontSize: 10,
                }}
              />
            ) : null}
            <Series
              type="monotone"
              dataKey={yKey}
              stroke={stroke}
              fill={variant === "area" && useGradientFill ? `url(#${fillId})` : variant === "area" ? stroke : undefined}
              fillOpacity={variant === "area" && !useGradientFill ? 0.2 : undefined}
              strokeWidth={strokeWidth}
              baseValue={areaBaseValue}
              dot={false}
              activeDot={{ r: enhanced ? 4 : 3, fill: stroke, stroke: "oklch(0.92 0.02 252)", strokeWidth: 1 }}
            />
          </Chart>
        </ResponsiveContainer>
      </div>
    </ChartWell>
  );
}
