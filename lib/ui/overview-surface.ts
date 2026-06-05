import { cn } from "@/lib/utils";
import { v2ChartWell, v2InsetCell, v2KpiShell } from "@/lib/ui/v2-surface";

/** Overview page canvas — navy base with a calm blue wash */
export const overviewPageShell = "relative isolate";

export const overviewPageGradient = cn(
  "pointer-events-none absolute inset-x-[-1.5rem] top-[-1.5rem] -z-10 min-h-[calc(100%+3rem)] sm:inset-x-[-2rem] sm:top-[-2rem]",
  "bg-[linear-gradient(180deg,oklch(0.094_0.06_262)_0%,oklch(0.074_0.054_266)_42%,oklch(0.056_0.048_270)_100%)]",
);

export const overviewPageGlow = cn(
  "pointer-events-none absolute inset-x-[-1.5rem] top-[-1.5rem] -z-10 h-[28rem] sm:inset-x-[-2rem]",
  "bg-[radial-gradient(ellipse_82%_58%_at_50%_-4%,oklch(0.5_0.14_252/0.22),transparent_74%)]",
);

export const overviewHeroAccent = cn(
  "pointer-events-none absolute inset-x-0 -top-2 -z-10 h-48",
  "bg-[radial-gradient(ellipse_68%_52%_at_50%_0%,oklch(0.56_0.13_252/0.12),transparent_72%)]",
);

/** Soft glow reserved for the performance chart column only */
export const overviewPerformanceGlow = cn(
  "pointer-events-none absolute -inset-x-2 -inset-y-3 -z-10 rounded-[1.25rem]",
  "bg-[radial-gradient(ellipse_88%_78%_at_40%_48%,oklch(0.5_0.13_252/0.16),transparent_70%)]",
);

export const overviewKpi = cn(
  v2KpiShell,
  "border-white/[0.1]",
  "bg-[linear-gradient(168deg,oklch(0.154_0.038_262/0.98),oklch(0.116_0.034_268/0.96))]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.085),0_14px_36px_-28px_rgba(0,0,0,0.74)]",
);

/** Lead metric (Net P&L) — single brand-accent tile */
export const overviewKpiLead = cn(
  overviewKpi,
  "border-bv-blue-accent/24",
  "bg-[linear-gradient(168deg,oklch(0.162_0.042_262/0.98),oklch(0.118_0.036_268/0.96))]",
  "shadow-[inset_0_1px_0_0_oklch(0.62_0.13_252/0.14),0_16px_40px_-28px_rgba(0,0,0,0.76),0_0_48px_-36px_oklch(0.52_0.13_252/0.2)]",
);

export const overviewCard = cn(
  "border-white/[0.1]",
  "bg-[linear-gradient(172deg,oklch(0.138_0.032_262/0.97),oklch(0.108_0.028_268/0.95))]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.075),0_18px_44px_-34px_rgba(0,0,0,0.78)]",
);

/** Featured performance module — the one place we lean into brand blue */
export const overviewCardFeatured = cn(
  overviewCard,
  "border-bv-blue-accent/26",
  "bg-[linear-gradient(172deg,oklch(0.145_0.04_262/0.98),oklch(0.11_0.036_268/0.96))]",
  "shadow-[inset_0_1px_0_0_oklch(0.62_0.13_252/0.11),0_22px_52px_-36px_rgba(0,0,0,0.8),0_0_56px_-42px_oklch(0.5_0.12_252/0.12)]",
);

export const overviewChartWell = cn(
  v2ChartWell,
  "border-bv-blue-accent/14",
  "bg-[linear-gradient(180deg,oklch(0.098_0.042_264/0.96),oklch(0.078_0.038_268/0.98))]",
  "shadow-[inset_0_1px_0_0_oklch(0.58_0.12_252/0.08),inset_0_-1px_0_0_oklch(0_0_0/0.22)]",
);

export const overviewInsetCell = cn(
  v2InsetCell,
  "border-white/[0.09]",
  "bg-[linear-gradient(180deg,oklch(0.122_0.032_264/0.58),oklch(0.102_0.03_268/0.52))]",
);

export const overviewKpiLabel = "text-[12px] font-medium text-zinc-300";
export const overviewKpiValueNeutral = "text-zinc-50";
export const overviewKpiIcon = "border-bv-blue-accent/18 bg-bv-blue-accent/8 text-bv-ice/80";
export const overviewKpiIconLead = "border-bv-blue-accent/28 bg-bv-blue-accent/12 text-bv-ice";
