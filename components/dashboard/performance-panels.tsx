import { cn } from "@/lib/utils";
import { DashboardEyebrow, HistogramMini, dashboardPanelClass } from "@/components/dashboard/dashboard-primitives";

type WinRatePanelProps = {
  winRate?: string;
  trades?: number;
  wins?: number;
  losses?: string;
  className?: string;
};

export function WinRatePanel({
  winRate = "54.2%",
  trades = 182,
  wins = 99,
  losses = "83",
  className,
}: WinRatePanelProps) {
  return (
    <section className={cn(dashboardPanelClass, "p-4 sm:p-5", className)}>
      <DashboardEyebrow>Win rate</DashboardEyebrow>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-display text-4xl tabular-nums tracking-tight text-zinc-50">{winRate}</p>
          <p className="mt-2 font-mono text-[11px] text-zinc-500">
            {wins}W / {losses}L · {trades} fills
          </p>
        </div>
        <div className="flex h-14 w-24 flex-col justify-end">
          <HistogramMini values={[40, 52, 48, 61, 55, 58, 44, 50, 62, 47, 53, 56]} />
        </div>
      </div>
      <p className="mt-4 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-zinc-500">
        Tagged trades only · scratches included in denominator
      </p>
    </section>
  );
}

type ExpectancyPanelProps = {
  expectancyR?: string;
  perTradeUsd?: string;
  streak?: string;
  className?: string;
};

export function ExpectancyPanel({
  expectancyR = "+0.18",
  perTradeUsd = "+$68",
  streak = "7 sessions > 0",
  className,
}: ExpectancyPanelProps) {
  return (
    <section className={cn(dashboardPanelClass, "p-4 sm:p-5", className)}>
      <DashboardEyebrow>Expectancy</DashboardEyebrow>
      <p className="font-display mt-3 text-4xl tabular-nums tracking-tight text-zinc-50">{expectancyR} R</p>
      <p className="mt-1 font-mono text-[13px] tabular-nums text-[oklch(0.78_0.1_250)]">{perTradeUsd} / trade</p>
      <dl className="mt-5 space-y-3 border-t border-white/[0.06] pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Gross / fees</dt>
          <dd className="font-mono tabular-nums text-zinc-300">$42.1k / $3.2k</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Profit factor</dt>
          <dd className="font-mono tabular-nums text-zinc-300">1.42</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Green streak</dt>
          <dd className="font-mono text-xs text-zinc-400">{streak}</dd>
        </div>
      </dl>
    </section>
  );
}
