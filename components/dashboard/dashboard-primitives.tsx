import type { ReactNode } from "react";
import { appCardSecondary, appEyebrow } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

/** Outer chrome for dashboard surfaces — matches Blueveno workstation panels */
export const dashboardPanelClass = cn(appCardSecondary, "shadow-bv-card");

export const dashboardInsetWellClass =
  "rounded-lg border border-white/[0.1] bg-[linear-gradient(168deg,oklch(0.11_0.03_262/0.88),oklch(0.085_0.026_266/0.9))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]";

type DashboardEyebrowProps = { children: ReactNode; className?: string };

export function DashboardEyebrow({ children, className }: DashboardEyebrowProps) {
  return <p className={cn(appEyebrow, "text-zinc-500", className)}>{children}</p>;
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
