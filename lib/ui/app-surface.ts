import { cn } from "@/lib/utils";

/** Primary CTA — cobalt, used across app for main actions */
export const appPrimaryCta = cn(
  "inline-flex h-10 min-h-10 items-center justify-center rounded-xl px-5 text-[14px] font-medium tracking-tight",
  "bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.68_0.15_252))] text-[oklch(0.12_0.04_265)]",
  "shadow-[0_1px_0_0_oklch(1_0_0_/0.12)_inset,0_8px_28px_-8px_oklch(0.45_0.14_252/0.45)]",
  "transition hover:brightness-[1.03] active:brightness-[0.98]",
);

/** Secondary outline — navigation & secondary actions */
export const appSecondaryCta = cn(
  "inline-flex h-10 min-h-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[14px] text-zinc-100",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] transition hover:border-white/[0.18] hover:bg-white/[0.07]",
);

/** Section kicker in page headers and cards — sentence case, readable */
export const appEyebrow = "text-[12px] font-medium tracking-wide text-[oklch(0.72_0.1_252)]";

/** Inline field / metric labels */
export const appMetricLabel = "text-[13px] font-medium text-zinc-300/90";

/** Compact supporting labels inside panels */
export const appKicker = "text-[13px] font-medium text-zinc-500";

/** Small body copy */
export const appBodySmall = "text-[13px] leading-relaxed text-zinc-400";

/** Muted paragraph */
export const appBodyMuted = "text-[14px] leading-relaxed text-zinc-500";

/** Base shell — standard Overview / app content cards */
export const appCardShell = cn(
  "rounded-2xl border border-white/[0.08]",
  "bg-[linear-gradient(168deg,oklch(0.14_0.026_262/0.96),oklch(0.105_0.022_266/0.95))]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.055),0_24px_56px_-40px_rgba(0,0,0,0.72)]",
);

/** KPI metric cards — same language as shell, slightly elevated with subtle brand accent */
export const appCardKpi = cn(
  appCardShell,
  "border-white/[0.09]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06),0_26px_60px_-38px_rgba(0,0,0,0.76),0_0_40px_-36px_oklch(0.48_0.11_252/0.18)]",
);

/** Nested panels inside section cards */
export const appInnerPanel = cn(
  "rounded-xl border border-white/[0.07] bg-white/[0.025]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]",
);

/** Semantic inner panels — use for positive / negative states only */
export const appInnerPanelPositive = cn(
  appInnerPanel,
  "border-emerald-400/20 bg-emerald-500/[0.06]",
);

export const appInnerPanelNegative = cn(
  appInnerPanel,
  "border-rose-400/20 bg-rose-500/[0.06]",
);

/** @deprecated Use appCardKpi — kept for existing imports */
export const appCardPrimary = appCardKpi;

/** Secondary grouped metrics / analytics panels */
export const appCardSecondary = cn(
  appCardShell,
  "rounded-xl border-white/[0.07]",
  "bg-[linear-gradient(165deg,oklch(0.13_0.024_262/0.94),oklch(0.098_0.02_266/0.92))]",
);

/** App main content width — use on shell inner wrapper */
export const appContentWrap = "mx-auto w-full max-w-[min(100%,104rem)]";
