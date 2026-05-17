import { cn } from "@/lib/utils";

/** Sentence-case field labels — avoid uppercase micro-labels */
export const appFormLabel = "text-[13px] font-medium text-zinc-400";

/** Standard text input / textarea on dark cards */
export const appFormControl = cn(
  "h-11 w-full min-w-0 rounded-xl border border-white/[0.08] bg-black/20 px-3 text-[15px] text-zinc-100",
  "shadow-[inset_0_1px_2px_oklch(0_0_0/0.15)] placeholder:text-zinc-600",
  "transition-[border-color,box-shadow] duration-200",
  "focus-visible:border-[oklch(0.58_0.12_252/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.1_0.04_268)]",
);

/** Compact select — filters and dense forms */
export const appFormSelect = cn(
  "h-9 min-w-0 rounded-lg border border-white/[0.08] bg-black/20 px-2.5 text-[13px] text-zinc-300",
  "focus-visible:border-[oklch(0.58_0.12_252/0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.28)]",
);

/** Filter bar shell — light chrome, not a heavy nested card */
export const appFilterShell = "rounded-xl bg-white/[0.02] px-3 py-2.5 ring-1 ring-white/[0.06]";

/** Settings-style lifted field (profile forms) */
export const appFormFieldLifted = cn(
  "h-10 w-full min-w-0 rounded-xl border px-3 text-[15px] text-zinc-100",
  "border-[oklch(0.55_0.12_252/0.32)]",
  "bg-[linear-gradient(168deg,oklch(0.17_0.06_262/0.72)_0%,oklch(0.1_0.045_268/0.88)_100%)]",
  "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08),0_4px_20px_-10px_rgba(0,0,0,0.85)]",
  "placeholder:text-zinc-600",
  "transition-[border-color,box-shadow] duration-200",
  "focus-visible:border-[oklch(0.62_0.14_252/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.32)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.1_0.04_268)]",
);
