import { cn } from "@/lib/utils";
import { DashboardEyebrow, dashboardInsetWellClass, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

type AverageRPanelProps = {
  avgWinR?: string;
  avgLossR?: string;
  payoff?: string;
  className?: string;
};

export function AverageRPanel({
  avgWinR = "+0.82",
  avgLossR = "−0.54",
  payoff = "1.52",
  className,
}: AverageRPanelProps) {
  const ticks = [-2, -1, 0, 1, 2];
  return (
    <section className={cn(dashboardPanelClass, "p-4 sm:p-5", className)}>
      <DashboardEyebrow>Average R</DashboardEyebrow>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Winners</p>
          <p className="font-display mt-1 text-2xl tabular-nums text-zinc-50">{avgWinR} R</p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Losers</p>
          <p className="font-display mt-1 text-2xl tabular-nums text-zinc-300">{avgLossR} R</p>
        </div>
      </div>
      <div className={cn(dashboardInsetWellClass, "mt-5 px-3 py-3")}>
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-600">
          <span>R distribution</span>
          <span className="text-zinc-500">Payoff {payoff}</span>
        </div>
        <div className="relative mt-3 h-2 rounded-full bg-zinc-800/90">
          <div
            className="absolute inset-y-0 left-1/2 w-px bg-white/20"
            style={{ marginLeft: "-0.5px" }}
            aria-hidden
          />
          <div
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-red-900/35 via-bv-blue-deep/80 to-primary opacity-90"
            style={{ left: "38%", right: "12%" }}
          />
        </div>
        <div className="mt-2 flex justify-between font-mono text-[9px] tabular-nums text-zinc-600">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-zinc-500">
        Averages exclude scratches; payoff is |avg win| / |avg loss|.
      </p>
    </section>
  );
}
