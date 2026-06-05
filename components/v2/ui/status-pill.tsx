import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusPillTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "pending"
  | "active"
  | "win"
  | "loss"
  | "breakeven"
  | "disciplined"
  | "violation";

const toneClass: Record<StatusPillTone, string> = {
  neutral: "border-white/[0.12] bg-white/[0.04] text-zinc-300",
  info: "border-sky-400/25 bg-sky-500/10 text-sky-100",
  success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  danger: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  pending: "border-zinc-500/25 bg-zinc-800/50 text-zinc-400",
  active: "border-bv-blue-accent/35 bg-bv-blue-accent/12 text-bv-ice",
  win: "border-emerald-400/35 bg-emerald-500/12 text-emerald-100",
  loss: "border-rose-400/35 bg-rose-500/12 text-rose-100",
  breakeven: "border-zinc-500/30 bg-zinc-800/40 text-zinc-300",
  disciplined: "border-emerald-400/25 bg-emerald-500/08 text-emerald-200",
  violation: "border-rose-400/25 bg-rose-500/08 text-rose-200",
};

type StatusPillProps = {
  children: ReactNode;
  tone?: StatusPillTone;
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
};

export function StatusPill({ children, tone = "neutral", size = "sm", dot = false, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px] tracking-[0.06em] uppercase" : "px-2.5 py-1 text-[11px] tracking-[0.04em]",
        toneClass[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            tone === "active" || tone === "win" || tone === "success" || tone === "disciplined"
              ? "bg-emerald-400"
              : tone === "loss" || tone === "danger" || tone === "violation"
                ? "bg-rose-400"
                : tone === "warning"
                  ? "bg-amber-400"
                  : tone === "info"
                    ? "bg-sky-400"
                    : "bg-zinc-500",
          )}
          aria-hidden
        />
      ) : null}
      <span className="truncate">{children}</span>
    </span>
  );
}
