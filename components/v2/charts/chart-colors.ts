/** Shared chart palette — aligned with globals.css `--chart-*` and bv tokens */

export const V2_CHART_COLORS = {
  primary: "oklch(0.58 0.14 252)",
  primaryMuted: "oklch(0.48 0.12 252 / 0.55)",
  positive: "oklch(0.72 0.14 155)",
  positiveMuted: "oklch(0.62 0.12 155 / 0.45)",
  negative: "oklch(0.68 0.16 25)",
  negativeMuted: "oklch(0.58 0.14 25 / 0.45)",
  neutral: "oklch(0.55 0.02 260)",
  grid: "oklch(1 0 0 / 0.06)",
  gridStrong: "oklch(0.52 0.12 252 / 0.18)",
  zeroLine: "oklch(0.55 0.12 252 / 0.32)",
  axis: "oklch(0.55 0.02 260)",
  tooltipBg: "oklch(0.12 0.03 262 / 0.96)",
} as const;

export type V2ChartSeriesTone = "primary" | "positive" | "negative" | "neutral";

export function v2ChartSeriesColor(tone: V2ChartSeriesTone): string {
  switch (tone) {
    case "positive":
      return V2_CHART_COLORS.positive;
    case "negative":
      return V2_CHART_COLORS.negative;
    case "neutral":
      return V2_CHART_COLORS.neutral;
    default:
      return V2_CHART_COLORS.primary;
  }
}
