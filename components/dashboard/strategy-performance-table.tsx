import { cn } from "@/lib/utils";
import type { StrategyRow } from "@/components/dashboard/types";
import { DashboardEyebrow, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

const defaultRows: StrategyRow[] = [
  { setup: "ORB · long", trades: 54, winRate: "58%", expectancy: "+0.21", netR: "+11.3", profitFactor: "1.62" },
  { setup: "Fade · failed BO", trades: 38, winRate: "47%", expectancy: "+0.12", netR: "+4.6", profitFactor: "1.28" },
  { setup: "VWAP · reclaim", trades: 29, winRate: "52%", expectancy: "+0.08", netR: "+2.3", profitFactor: "1.15" },
  { setup: "Scratch / flat", trades: 61, winRate: "—", expectancy: "−0.04", netR: "−2.4", profitFactor: "0.88" },
];

type StrategyPerformanceTableProps = {
  rows?: StrategyRow[];
  className?: string;
};

export function StrategyPerformanceTable({ rows = defaultRows, className }: StrategyPerformanceTableProps) {
  return (
    <section className={cn(dashboardPanelClass, "overflow-hidden", className)}>
      <header className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <DashboardEyebrow>Performance</DashboardEyebrow>
        <p className="mt-1 font-display text-[15px] font-medium text-zinc-100">By setup</p>
        <p className="mt-1 text-xs text-zinc-500">Last 90 sessions · min 5 trades to show</p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-bv-surface-inset/80 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
              <th scope="col" className="px-4 py-3">
                Setup
              </th>
              <th scope="col" className="px-4 py-3 text-right tabular-nums">
                N
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Win%
              </th>
              <th scope="col" className="px-4 py-3 text-right tabular-nums">
                E(trade)
              </th>
              <th scope="col" className="px-4 py-3 text-right tabular-nums">
                {"Net P&L"}
              </th>
              <th scope="col" className="px-4 py-3 text-right tabular-nums">
                PF
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.setup} className="border-b border-white/[0.04] transition hover:bg-white/[0.03]">
                <td className="px-4 py-2.5 font-medium text-zinc-200">{r.setup}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-400">{r.trades}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-400">{r.winRate}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-300">{r.expectancy}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-100">{r.netR}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-zinc-400">{r.profitFactor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
