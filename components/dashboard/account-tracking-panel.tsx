"use client";

import { cn } from "@/lib/utils";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";
import { DashboardEyebrow, dashboardInsetWellClass, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

type AccountTrackingPanelProps = {
  label?: string;
  equity?: string;
  dayPnl?: string;
  buyingPower?: string;
  openRisk?: string;
  className?: string;
};

export function AccountTrackingPanel({
  label = "Primary · futures",
  equity = "$184,260",
  dayPnl = "+$1,240",
  buyingPower = "$92,130",
  openRisk = "0.42 R",
  className,
}: AccountTrackingPanelProps) {
  return (
    <section className={cn(dashboardPanelClass, "p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <DashboardEyebrow>Account</DashboardEyebrow>
          <p className="mt-1 font-mono text-[11px] text-zinc-500">{label}</p>
          <p className="font-display mt-3 text-2xl tabular-nums tracking-tight text-zinc-50">{equity}</p>
          <p className="mt-1 font-mono text-[13px] tabular-nums text-[oklch(0.78_0.1_250)]">{dayPnl} today</p>
        </div>
        <div className="w-32 shrink-0">
          <MiniSparkline positive />
        </div>
      </div>

      <dl className={cn(dashboardInsetWellClass, "mt-5 grid gap-3 px-4 py-3 sm:grid-cols-2")}>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Buying power</dt>
          <dd className="mt-1 font-mono text-sm tabular-nums text-zinc-300">{buyingPower}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">Open risk</dt>
          <dd className="mt-1 font-mono text-sm tabular-nums text-zinc-300">{openRisk}</dd>
        </div>
      </dl>

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-600">
        Numbers are illustrative—connect clearing for live balances and risk.
      </p>
    </section>
  );
}
