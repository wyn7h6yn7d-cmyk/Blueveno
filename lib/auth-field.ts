import { cn } from "@/lib/utils";

/** Shared input styling for auth routes — matches marketing workstation panels */
export const authFieldClass = cn(
  "h-12 w-full rounded-[0.65rem] border border-white/[0.08] bg-bv-surface-inset/95 px-4 text-[15px] text-zinc-100 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition-[color,box-shadow,border-color]",
  "placeholder:text-zinc-600",
  "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:outline-none",
);

export const authLabelClass =
  "text-[12px] font-medium tracking-[0.02em] text-zinc-400";
