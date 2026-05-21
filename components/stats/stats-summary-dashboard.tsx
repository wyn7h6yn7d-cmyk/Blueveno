"use client";

import { Target, TrendingDown, TrendingUp } from "lucide-react";
import {
  CumulativeChart,
  DisciplineTrend,
  MoodDistributionChart,
} from "@/components/analytics/analytics-charts";
import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { GreenRedRatioBar } from "@/components/analytics/green-red-ratio-bar";
import { MetricStrip } from "@/components/analytics/metric-strip";
import { SessionComparisonPanel } from "@/components/analytics/session-comparison-panel";
import { SupportMetricCard } from "@/components/analytics/support-metric-card";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import type { SessionAnalysis } from "@/lib/user-data/session-analysis";
import type { TradingStatsSnapshot, WeeklyReflectionStat } from "@/lib/user-data/trading-stats";
import { cn } from "@/lib/utils";

type StatsSummaryDashboardProps = {
  stats: TradingStatsSnapshot;
  netPnl: number;
  currency: string;
  weeklyReflections: WeeklyReflectionStat[];
  sessionAnalysis: SessionAnalysis;
};

function fmtPnl(n: number | null, currency: string) {
  if (n === null || !Number.isFinite(n)) return "—";
  return formatSignedPnlAmount(n, currency);
}

function formatProfitFactor(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

export function StatsSummaryDashboard({
  stats,
  netPnl,
  currency,
  weeklyReflections,
  sessionAnalysis,
}: StatsSummaryDashboardProps) {
  const tradedDays = stats.dailyBars.length;
  const dayWinRate =
    tradedDays > 0 ? Math.round((stats.winDays / tradedDays) * 100) : null;
  const greenShare =
    stats.winDays + stats.lossDays > 0
      ? Math.round((stats.winDays / (stats.winDays + stats.lossDays)) * 100)
      : null;
  const worstDayPnl = stats.worstDay?.pnl ?? stats.smallestGreenDay?.pnl ?? null;
  const worstDayLabel = stats.worstDay ? "Worst day" : "Smallest green day";
  const worstDayDate = stats.worstDay?.date ?? stats.smallestGreenDay?.date;

  return (
    <div className="space-y-6">
      <MetricStrip
        items={[
          {
            label: "Net P&L",
            value: fmtPnl(netPnl, currency),
            tone: netPnl,
            icon: TrendingUp,
          },
          {
            label: "Win rate",
            value:
              stats.winRateTrades !== null
                ? `${stats.winRateTrades}%`
                : dayWinRate !== null
                  ? `${dayWinRate}%`
                  : "—",
            icon: Target,
          },
          {
            label: "Avg green day",
            value: fmtPnl(stats.avgGreenDay, currency),
            tone: stats.avgGreenDay ?? 0,
            icon: TrendingUp,
          },
          {
            label: "Avg red day",
            value: fmtPnl(stats.avgRedDay, currency),
            tone: stats.avgRedDay ?? 0,
            icon: TrendingDown,
          },
          {
            label: "Profit factor",
            value: formatProfitFactor(stats.profitFactor),
            tone: (stats.profitFactor ?? 0) >= 1 ? 1 : -1,
          },
        ]}
      />

      <AnalyticsPanel
        title="Cumulative P&L"
        description="Running total across your filtered trading days."
        glow="blue"
        contentClassName="overflow-hidden"
      >
        <CumulativeChart points={stats.cumulative} currency={currency} />
      </AnalyticsPanel>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <AnalyticsPanel
          title="Mood distribution"
          description="How often each mood shows up in your journal."
          glow="none"
        >
          <MoodDistributionChart moodBreakdown={stats.moodBreakdown} />
        </AnalyticsPanel>
        <AnalyticsPanel
          title="Discipline trend"
          description="Weekly discipline score with reflection bonus."
          glow="green"
        >
          <DisciplineTrend weekly={stats.weekly} weeklyReflections={weeklyReflections} />
        </AnalyticsPanel>
      </section>

      <AnalyticsPanel
        title="Session comparison"
        description="See which market windows and session tags contribute the most P&amp;L in this scope."
        glow="none"
      >
        <SessionComparisonPanel
          marketSessions={sessionAnalysis.marketSessions}
          taggedSessions={sessionAnalysis.taggedSessions}
          currency={currency}
          bestMarketSession={sessionAnalysis.bestMarketSession}
          weakestMarketSession={sessionAnalysis.weakestMarketSession}
          bestTaggedSession={sessionAnalysis.bestTaggedSession}
          weakestTaggedSession={sessionAnalysis.weakestTaggedSession}
        />
      </AnalyticsPanel>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Day highlights">
        <SupportMetricCard
          label="Best day"
          value={stats.bestDay ? fmtPnl(stats.bestDay.pnl, currency) : "—"}
          detail={stats.bestDay?.date ?? "Log more days to find your peak."}
          tone={stats.bestDay?.pnl ?? 0}
        />
        <SupportMetricCard
          label={worstDayLabel}
          value={worstDayPnl !== null ? fmtPnl(worstDayPnl, currency) : "—"}
          detail={worstDayDate ?? "Your toughest day will appear here."}
          tone={worstDayPnl ?? 0}
        />
        <div className="rounded-xl border border-white/[0.08] bg-[linear-gradient(165deg,oklch(0.12_0.032_262/0.9),oklch(0.09_0.026_266/0.88))] px-4 py-4 sm:col-span-2 xl:col-span-1">
          <p className="text-[13px] font-medium text-zinc-400">Green vs red days</p>
          <p className="font-display mt-2 text-[1.35rem] tabular-nums tracking-[-0.03em] text-zinc-50 sm:text-[1.5rem]">
            <span className="text-emerald-200">{stats.winDays}</span>
            <span className="text-zinc-600"> · </span>
            <span className="text-rose-200">{stats.lossDays}</span>
          </p>
          <div className="mt-4">
            <GreenRedRatioBar green={stats.winDays} red={stats.lossDays} />
          </div>
          {greenShare !== null ? (
            <p className={cn("mt-3 text-[13px] text-zinc-500")}>
              <span className="tabular-nums text-emerald-200/90">{greenShare}%</span> of traded days closed green.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
