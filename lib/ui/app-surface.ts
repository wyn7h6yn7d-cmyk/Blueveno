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

/** Hero KPI / primary metric cards */
export const appCardPrimary = cn(
  "rounded-2xl border border-[oklch(0.55_0.12_252/0.38)]",
  "bg-[linear-gradient(158deg,oklch(0.21_0.052_258/0.98),oklch(0.11_0.034_264/0.99))]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.12),0_32px_64px_-36px_oklch(0.48_0.14_252/0.48)]",
  "ring-1 ring-[oklch(0.58_0.1_252/0.22)]",
);

/** Secondary grouped metrics / breakdown panels */
export const appCardSecondary = cn(
  "rounded-xl border border-white/[0.07]",
  "bg-[linear-gradient(165deg,oklch(0.13_0.032_262/0.94),oklch(0.095_0.026_266/0.92))]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]",
);

/** App main content width — use on shell inner wrapper */
export const appContentWrap = "mx-auto w-full max-w-[min(100%,104rem)]";
