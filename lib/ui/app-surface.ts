import { cn } from "@/lib/utils";

/** Primary CTA — cobalt, used across app for main actions */
export const appPrimaryCta = cn(
  "inline-flex h-10 min-h-10 items-center justify-center rounded-xl px-5 text-[13px] font-medium tracking-tight",
  "bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.68_0.15_252))] text-[oklch(0.12_0.04_265)]",
  "shadow-[0_1px_0_0_oklch(1_0_0_/0.12)_inset,0_8px_28px_-8px_oklch(0.45_0.14_252/0.45)]",
  "transition hover:brightness-[1.03] active:brightness-[0.98]",
);

/** Secondary outline — navigation & secondary actions */
export const appSecondaryCta = cn(
  "inline-flex h-10 min-h-10 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-[13px] text-zinc-100",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] transition hover:border-white/[0.18] hover:bg-white/[0.07]",
);
