import { V2_CHART_COLORS } from "@/components/v2/charts/chart-colors";

/** Shared Recharts styling — calm premium palette */
export const V2_RECHARTS_THEME = {
  axis: {
    stroke: V2_CHART_COLORS.axis,
    tick: { fill: "oklch(0.55 0.02 260)", fontSize: 10 },
    tickLine: false,
    axisLine: false,
  },
  grid: {
    stroke: V2_CHART_COLORS.grid,
    strokeDasharray: "3 3",
  },
  tooltip: {
    contentStyle: {
      background: V2_CHART_COLORS.tooltipBg,
      border: "1px solid oklch(1 0 0 / 0.1)",
      borderRadius: "8px",
      fontSize: "12px",
      color: "oklch(0.92 0.01 260)",
    },
    labelStyle: { color: "oklch(0.65 0.02 260)" },
  },
  colors: [
    V2_CHART_COLORS.primary,
    V2_CHART_COLORS.positive,
    V2_CHART_COLORS.negative,
    "oklch(0.62 0.1 250)",
    "oklch(0.55 0.08 280)",
  ],
} as const;
