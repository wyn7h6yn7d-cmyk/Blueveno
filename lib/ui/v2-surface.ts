import { cn } from "@/lib/utils";
import {
  appCardShell,
  appEyebrow,
  appInnerPanel,
  appKicker,
  appMetricLabel,
} from "@/lib/ui/app-surface";

/**
 * V2 workstation tokens — denser, sharper hierarchy for premium dashboard modules.
 * Parallel to v1 (`app-surface.ts`); existing pages keep v1 until migrated slice-by-slice.
 */

/** Module outer shell — slightly tighter radius, stronger inset highlight */
export const v2ModuleShell = cn(
  appCardShell,
  "rounded-xl border-white/[0.09]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.065),0_20px_48px_-36px_rgba(0,0,0,0.78)]",
);

/** KPI tile — compact metric card for dense grids */
export const v2KpiShell = cn(
  v2ModuleShell,
  "border-white/[0.08]",
  "bg-[linear-gradient(168deg,oklch(0.135_0.026_262/0.97),oklch(0.102_0.022_266/0.95))]",
);

/** Recessed chart / table well */
export const v2ChartWell = cn(
  "rounded-lg border border-white/[0.07]",
  "bg-[linear-gradient(180deg,oklch(0.075_0.034_268/0.92),oklch(0.065_0.036_268/0.95))]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04),inset_0_-1px_0_0_oklch(0_0_0/0.25)]",
);

/** Inner data row / insight cell */
export const v2InsetCell = cn(appInnerPanel, "rounded-lg border-white/[0.06] bg-white/[0.02]");

/** Table header row */
export const v2TableHeader = "border-b border-white/[0.08] bg-white/[0.02]";

/** Table row */
export const v2TableRow = cn(
  "border-b border-white/[0.05] transition-colors",
  "hover:bg-white/[0.025]",
);

/** Denser section eyebrow */
export const v2Eyebrow = cn(appEyebrow, "text-[11px] font-medium uppercase tracking-[0.14em] text-bv-eyebrow");

/** Module title */
export const v2ModuleTitle = "font-display text-[1rem] font-semibold leading-snug tracking-[-0.02em] text-zinc-50";

/** KPI label */
export const v2KpiLabel = cn(appMetricLabel, "text-[12px] text-zinc-400");

/** KPI value */
export const v2KpiValue = "font-display text-[1.65rem] font-semibold leading-none tabular-nums tracking-[-0.04em] text-zinc-50 sm:text-[1.85rem]";

/** Supporting copy inside modules */
export const v2Supporting = cn(appKicker, "text-[12px] leading-snug text-zinc-500");

/** Mono metadata — timestamps, axis labels */
export const v2MonoMeta = "font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500";

/** Page canvas — dark navy workstation background */
export const v2PageCanvas =
  "bg-[linear-gradient(180deg,oklch(0.085_0.055_266),oklch(0.058_0.048_270)_54%,oklch(0.044_0.044_274)_100%)]";

/** Sidebar surface */
export const v2SidebarShell = cn(
  "border-r border-bv-border-accent/30",
  "bg-[linear-gradient(180deg,oklch(0.14_0.045_262),oklch(0.092_0.038_266)_68%,oklch(0.078_0.034_270))]",
  "shadow-[inset_-1px_0_0_oklch(1_0_0_/0.06)]",
);

/** Top action bar */
export const v2TopBarShell = cn(
  "border-b border-white/[0.08]",
  "bg-[linear-gradient(180deg,oklch(0.13_0.04_262/0.96),oklch(0.1_0.035_266/0.94))]",
  "shadow-[inset_0_-1px_0_0_oklch(1_0_0/0.04)]",
);

/** Toolbar strip inside cards */
export const v2Toolbar = cn(
  "flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2",
);

/** Filter pill base */
export const v2FilterPill = cn(
  "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-medium transition",
  "border-white/[0.1] bg-white/[0.03] text-zinc-400 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-zinc-200",
);

/** Active filter pill */
export const v2FilterPillActive = cn(
  v2FilterPill,
  "border-bv-blue-accent/35 bg-bv-blue-accent/10 text-bv-ice",
);

/** Tab strip — prevents clipping/overflow */
export const v2TabStrip = "flex min-w-0 flex-wrap items-center gap-1.5 overflow-x-auto pb-0.5";

/** Tab item */
export const v2TabItem = cn(
  "inline-flex shrink-0 items-center rounded-lg border px-3 py-1.5 text-[12px] font-medium transition",
  "border-transparent text-zinc-500 hover:border-white/[0.08] hover:bg-white/[0.04] hover:text-zinc-200",
);

export const v2TabItemActive = cn(
  v2TabItem,
  "border-bv-blue-accent/30 bg-bv-blue-accent/10 text-zinc-50",
);

/** Positive / negative / caution text */
export const v2TextPositive = "text-emerald-300";
export const v2TextNegative = "text-rose-300";
export const v2TextCaution = "text-amber-300";

