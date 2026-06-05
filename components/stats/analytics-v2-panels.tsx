"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BehaviorInsightsModule } from "@/components/behavior/behavior-insights-module";
import { MonthlyReviewCard } from "@/components/reports/monthly-review-card";
import { AnalyticsBreakdownTable } from "@/components/stats/analytics-breakdown-table";
import { SectionCard } from "@/components/v2/cards";
import {
  BarChart,
  ChartCard,
  DataTable,
  DonutChart,
  EmptyState,
  MetricCard,
  TableCard,
  TrendChart,
  type DataTableColumn,
} from "@/components/v2/design-system";
import { InsightList, KpiGrid, StatStrip } from "@/components/v2";
import { CompactCell, PnlCell } from "@/components/v2/tables";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { safeFiniteNumber } from "@/lib/v2/safe-number";
import {
  buildPatternInsights,
  computeSummaryKpis,
  cumulativeToLineData,
  dailyBarsToChartData,
  performanceRowsToBreakdown,
  weekdayRowsToBreakdown,
  weekdayToBarChart,
  weeklyToBarChart,
  winLossDonutSlices,
} from "@/lib/stats/analytics-v2-transforms";
import type { useStatsAnalyticsData } from "@/lib/stats/use-stats-analytics-data";
import { appPrimaryCta } from "@/lib/ui/app-surface";

type AnalyticsData = ReturnType<typeof useStatsAnalyticsData>;

function fmtPnl(n: number | null, currency: string) {
  if (n === null || !Number.isFinite(n)) return "—";
  return formatSignedPnlAmount(n, currency);
}

function formatProfitFactor(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

type PanelProps = {
  data: AnalyticsData;
  currency: string;
};

export function AnalyticsSummaryPanel({ data, currency }: PanelProps) {
  const { stats, filteredEntries, monthlyReview } = data;
  const summary = useMemo(() => computeSummaryKpis(filteredEntries, stats), [filteredEntries, stats]);
  const lineData = useMemo(() => cumulativeToLineData(stats.cumulative), [stats.cumulative]);
  const donut = useMemo(() => winLossDonutSlices(stats), [stats]);
  const avgGreen = stats.avgGreenDay;
  const avgRed = stats.avgRedDay;

  return (
    <div className="space-y-5">
      <MonthlyReviewCard
        review={monthlyReview}
        displayCurrency={currency}
        storageKey={`blueveno:monthly-review:stats:${data.accountScope}:${monthlyReview.monthKey}`}
        title="Monthly review"
      />

      <KpiGrid columns={5}>
        <MetricCard
          label="Net P&L"
          value={fmtPnl(summary.netPnl, currency)}
          tone={summary.netPnl > 0 ? "positive" : summary.netPnl < 0 ? "negative" : "neutral"}
        />
        <MetricCard label="Win rate" value={summary.winRate !== null ? `${summary.winRate}%` : "—"} />
        <MetricCard label="Avg green day" value={fmtPnl(avgGreen, currency)} tone="positive" hint={`${stats.winDays} green days`} />
        <MetricCard label="Avg red day" value={fmtPnl(avgRed, currency)} tone="negative" hint={`${stats.lossDays} red days`} />
        <MetricCard
          label="Profit factor"
          value={formatProfitFactor(summary.profitFactor)}
          tone={(summary.profitFactor ?? 0) >= 1 ? "positive" : "negative"}
        />
      </KpiGrid>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <ChartCard eyebrow="Preview" title="Cumulative P&L" hasData={lineData.length >= 2} emptyTitle="Not enough data" emptyDescription="Log more days to preview your equity curve.">
            <TrendChart data={lineData} xKey="day" yKey="pnl" variant="area" height={220} />
          </ChartCard>
        </div>
        <div className="lg:col-span-4">
          <ChartCard eyebrow="Days" title="Green / red split" hasData={stats.winDays + stats.lossDays > 0} emptyTitle="No day split" emptyDescription="Log winning and losing days to see distribution.">
            <DonutChart slices={donut} height={200} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPerformancePanel({ data, currency }: PanelProps) {
  const { stats, filteredEntries } = data;
  const summary = useMemo(() => computeSummaryKpis(filteredEntries, stats), [filteredEntries, stats]);
  const lineData = useMemo(() => cumulativeToLineData(stats.cumulative), [stats.cumulative]);
  const barData = useMemo(() => dailyBarsToChartData(stats.dailyBars), [stats.dailyBars]);
  const weeklyBars = useMemo(() => weeklyToBarChart(stats), [stats]);
  const maxDd = summary.maxDrawdown;

  return (
    <div className="space-y-5">
      <StatStrip
        items={[
          { id: "net", label: "Net P&L", value: fmtPnl(summary.netPnl, currency), tone: summary.netPnl >= 0 ? "positive" : "negative" },
          {
            id: "dd",
            label: "Max drawdown",
            value: maxDd !== null && maxDd < 0 ? fmtPnl(maxDd, currency) : "—",
            tone: "negative",
          },
          { id: "pf", label: "Profit factor", value: formatProfitFactor(summary.profitFactor), tone: "neutral" },
          { id: "wr", label: "Win rate", value: summary.winRate !== null ? `${summary.winRate}%` : "—", tone: "neutral" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Cumulative P&L" hasData={lineData.length >= 2} emptyTitle="Not enough data" emptyDescription="Need at least two traded days.">
          <TrendChart data={lineData} xKey="day" yKey="pnl" height={260} />
        </ChartCard>
        <ChartCard title="Daily P&L" hasData={barData.length > 0} emptyTitle="No daily bars" emptyDescription="Log entries across multiple days.">
          <BarChart data={barData} xKey="day" yKey="pnl" height={260} />
        </ChartCard>
      </div>

      <ChartCard title="Weekly totals" hasData={weeklyBars.length > 0} emptyTitle="No weekly data" emptyDescription="Weekly buckets appear after logging across weeks.">
        <BarChart data={weeklyBars} xKey="day" yKey="pnl" height={220} colorBySign />
      </ChartCard>

      <KpiGrid columns={2}>
        <MetricCard
          label="Best day"
          value={summary.bestDay ? fmtPnl(summary.bestDay.pnl, currency) : "—"}
          hint={summary.bestDay?.date}
          tone="positive"
        />
        <MetricCard
          label={summary.worstDay?.label ?? "Worst day"}
          value={summary.worstDay ? fmtPnl(summary.worstDay.pnl, currency) : "—"}
          hint={summary.worstDay?.date}
          tone="negative"
        />
      </KpiGrid>
    </div>
  );
}

export function AnalyticsBehaviorPanel({ data, currency }: PanelProps) {
  const {
    stats,
    filteredEntries,
    weeklyReflections,
    latestReviewRule,
    latestReviewConfidence,
    latestReviewWorked,
    latestReviewSlipped,
    personalRules,
  } = data;

  return (
    <BehaviorInsightsModule
      entries={filteredEntries}
      currency={currency}
      personalRules={personalRules}
      reflectionWorked={latestReviewWorked}
      reflectionSlipped={latestReviewSlipped}
      weeklyReflections={weeklyReflections}
      stats={stats}
      latestReviewRule={latestReviewRule}
      latestReviewConfidence={latestReviewConfidence}
    />
  );
}

export function AnalyticsPatternsPanel({ data, currency }: PanelProps) {
  const { stats, sessionTagPerformance, marketConditionPerformance, mistakeTagPerformance, rulesAnalytics } = data;

  const insights = useMemo(
    () =>
      buildPatternInsights({
        stats,
        sessionTags: sessionTagPerformance,
        rulesTopPositive: rulesAnalytics.topPositive,
        currency,
      }),
    [stats, sessionTagPerformance, rulesAnalytics.topPositive, currency],
  );

  const weekdayBars = useMemo(() => weekdayToBarChart(stats), [stats]);
  const weekdayRows = useMemo(() => weekdayRowsToBreakdown(stats), [stats]);
  const setupRows = useMemo(() => performanceRowsToBreakdown(stats.setupPerformance), [stats.setupPerformance]);
  const symbolRows = useMemo(() => performanceRowsToBreakdown(stats.symbolPerformance), [stats.symbolPerformance]);
  const sessionTagRows = useMemo(() => performanceRowsToBreakdown(sessionTagPerformance), [sessionTagPerformance]);
  const marketRows = useMemo(() => performanceRowsToBreakdown(marketConditionPerformance), [marketConditionPerformance]);
  const mistakeRows = useMemo(() => performanceRowsToBreakdown(mistakeTagPerformance), [mistakeTagPerformance]);

  return (
    <div className="space-y-5">
      <SectionCard eyebrow="Insights" title="Pattern signals">
        <InsightList
          items={insights}
          empty={
            <EmptyState
              title="Patterns need more data"
              description="Log more tagged entries to unlock setup, session, and discipline insights."
              compact
            />
          }
        />
      </SectionCard>

      <ChartCard title="Weekday performance" hasData={weekdayBars.length > 0} emptyTitle="No weekday data" emptyDescription="Trade on multiple weekdays to compare timing.">
        <BarChart data={weekdayBars} xKey="day" yKey="pnl" height={220} colorBySign />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <TableCard title="By weekday" contentClassName="p-0 sm:p-0">
          <AnalyticsBreakdownTable rows={weekdayRows} currency={currency} emptyDescription="No weekday breakdown yet." />
        </TableCard>
        <TableCard title="By setup" contentClassName="p-0 sm:p-0">
          <AnalyticsBreakdownTable rows={setupRows} currency={currency} emptyDescription="No setup-tagged entries in this scope." />
        </TableCard>
        <TableCard title="By symbol" contentClassName="p-0 sm:p-0">
          <AnalyticsBreakdownTable rows={symbolRows} currency={currency} />
        </TableCard>
        <TableCard title="By session tag" contentClassName="p-0 sm:p-0">
          <AnalyticsBreakdownTable rows={sessionTagRows} currency={currency} />
        </TableCard>
        <TableCard title="By market condition" contentClassName="p-0 sm:p-0">
          <AnalyticsBreakdownTable rows={marketRows} currency={currency} />
        </TableCard>
        <TableCard title="By mistake tag" contentClassName="p-0 sm:p-0">
          <AnalyticsBreakdownTable rows={mistakeRows} currency={currency} />
        </TableCard>
      </div>
    </div>
  );
}

type AccountRow = AnalyticsData["accountComparisonRows"][number];

export function AnalyticsAccountsPanel({ data, currency }: PanelProps) {
  const columns: DataTableColumn<AccountRow>[] = [
    {
      id: "name",
      header: "Account",
      cell: (row) => <CompactCell primary={row.name} secondary={row.type} />,
    },
    {
      id: "pnl",
      header: "Net P&L",
      cell: (row) => <PnlCell value={safeFiniteNumber(row.pnl, 0)} currency={currency} />,
      sortable: true,
      sortValue: (row) => safeFiniteNumber(row.pnl, 0),
    },
    {
      id: "win",
      header: "Win %",
      cell: (row) => <span className="font-mono text-[12px]">{row.winRate !== null ? `${row.winRate}%` : "—"}</span>,
      sortable: true,
      sortValue: (row) => row.winRate ?? -1,
    },
    {
      id: "days",
      header: "Traded days",
      cell: (row) => <span className="font-mono text-[12px]">{row.tradedDays}</span>,
      sortable: true,
      sortValue: (row) => row.tradedDays,
    },
    {
      id: "disc",
      header: "Discipline",
      cell: (row) => <span className="font-mono text-[12px]">{row.disciplineScore !== null ? `${row.disciplineScore}%` : "—"}</span>,
      sortable: true,
      sortValue: (row) => row.disciplineScore ?? -1,
    },
  ];

  return (
    <TableCard
      eyebrow="Accounts"
      title="Account comparison"
      description="P&L, win rate, traded days, and discipline score per account."
    >
      <DataTable
        columns={columns}
        rows={data.accountComparisonRows}
        getRowKey={(row) => row.id}
        empty={
          <EmptyState
            title="No accounts to compare"
            description="Create trading accounts in Settings to compare performance."
            action={<Link href="/app/settings?section=accounts" className="text-[13px] text-bv-ice hover:underline">Manage accounts</Link>}
            compact
          />
        }
      />
    </TableCard>
  );
}

export function AnalyticsEmptyState() {
  return (
    <EmptyState
      title="No analytics yet"
      description="Add a few trading days to unlock performance and behavior patterns."
      action={
        <Link href="/app/journal" className={appPrimaryCta}>
          Log the day
        </Link>
      }
    />
  );
}
