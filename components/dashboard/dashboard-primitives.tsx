import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Outer chrome for dashboard surfaces — matches Blueveno workstation panels */
export const dashboardPanelClass =
  "rounded-xl border border-border/85 bg-bv-surface/90 shadow-bv-card";

export const dashboardInsetWellClass =
  "rounded-lg border border-border/75 bg-bv-surface-inset/90 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]";

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
          className="flex-1 rounded-t-[2px] bg-gradient-to-t from-bv-blue-deep to-primary"
          style={{ height: `${Math.max(8, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
