import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Outer chrome for dashboard surfaces — matches Blueveno workstation panels */
export const dashboardPanelClass =
  "rounded-xl border border-white/[0.07] bg-[oklch(0.12_0.025_265/0.88)] shadow-bv-card backdrop-blur-sm";

export const dashboardInsetWellClass =
  "rounded-lg border border-white/[0.06] bg-bv-surface-inset/90 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]";

type DashboardEyebrowProps = { children: ReactNode; className?: string };

export function DashboardEyebrow({ children, className }: DashboardEyebrowProps) {
  return (
    <p className={cn("font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500", className)}>
      {children}
    </p>
  );
}

export function HistogramMini({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className={cn("flex h-12 items-end gap-px", className)}>
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[2px] bg-gradient-to-t from-[oklch(0.35_0.1_260)] to-[oklch(0.62_0.14_250)]"
          style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
