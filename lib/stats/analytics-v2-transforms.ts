import type { BarChartPoint } from "@/components/v2/charts/bar-chart";
import type { DonutSlice } from "@/components/v2/charts/donut-chart";
import type { LineAreaPoint } from "@/components/v2/charts/line-area-chart";
import type { InsightListItem } from "@/components/v2/data/insight-list";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";
import type {
  CumulativePoint,
  DailyBar,
  TradingStatsSnapshot,
} from "@/lib/user-data/trading-stats";
import type { SessionTagPerformanceRow } from "@/lib/user-data/session-analysis";

export type BreakdownRow = {
  id: string;
  label: string;
  count: number;
  winRate: number | null;
  totalPnl: number;
  avgResult: number | null;
};

export type SummaryKpis = {
  netPnl: number;
  tradeCount: number;
  tradedDays: number;
  winRate: number | null;
  avgWin: number | null;
  avgLoss: number | null;
  avgTrade: number | null;
  riskReward: number | null;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number; label: string } | null;
  profitFactor: number | null;
  maxDrawdown: number | null;
};

function shortDate(dayKey: string): string {
  if (!dayKey) return "—";
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

export function cumulativeToLineData(points: CumulativePoint[]): LineAreaPoint[] {
  if (points.length < 2) return [];
  return points.slice(1).map((p) => ({
    day: shortDate(p.t),
    pnl: Number(p.y.toFixed(2)),
  }));
}

export function dailyBarsToChartData(bars: DailyBar[]): BarChartPoint[] {
  return bars.map((b) => ({
    day: shortDate(b.date),
    pnl: Number(b.pnl.toFixed(2)),
  }));
}

export function winLossDonutSlices(stats: TradingStatsSnapshot): DonutSlice[] {
  return [
    { id: "wins", label: "Green days", value: stats.winDays },
    { id: "losses", label: "Red days", value: stats.lossDays },
    ...(stats.flatDays > 0 ? [{ id: "flat", label: "Flat days", value: stats.flatDays }] : []),
  ];
}

export function weekdayToBarChart(stats: TradingStatsSnapshot): BarChartPoint[] {
  return stats.weekdayPerformance
    .filter((w) => w.tradedDays > 0)
    .map((w) => ({
      day: w.weekday,
      pnl: Number(w.totalPnl.toFixed(2)),
    }));
}

export function weeklyToBarChart(stats: TradingStatsSnapshot): BarChartPoint[] {
  return stats.weekly.map((w) => ({
    day: w.label,
    pnl: Number(w.total.toFixed(2)),
  }));
}

export function weekdayRowsToBreakdown(stats: TradingStatsSnapshot): BreakdownRow[] {
  return stats.weekdayPerformance
    .filter((w) => w.tradedDays > 0)
    .map((w) => ({
      id: w.weekday,
      label: w.weekday,
      count: w.tradedDays,
      winRate: null,
      totalPnl: w.totalPnl,
      avgResult: w.averagePnl,
    }));
}

function winRateFromEntries(count: number, wins: number): number | null {
  if (count <= 0) return null;
  return Math.round((wins / count) * 100);
}

type PerformanceSourceRow = {
  label?: string;
  setup?: string;
  symbol?: string;
  totalPnl: number;
  averagePnl: number | null;
  entries: number;
  winRate?: number | null;
};

function performanceLabel(row: PerformanceSourceRow): string {
  return row.label ?? row.setup ?? row.symbol ?? "—";
}

export function performanceRowsToBreakdown(rows: PerformanceSourceRow[]): BreakdownRow[] {
  return rows.map((row) => {
    const label = performanceLabel(row);
    return {
    id: label,
    label,
    count: row.entries,
    winRate: row.winRate ?? null,
    totalPnl: row.totalPnl,
    avgResult: row.averagePnl,
  };
  });
}

export function sessionPnlToBreakdown(
  rows: Array<{ session: string; totalPnl: number; entries: number; winEntries: number }>,
): BreakdownRow[] {
  return rows
    .filter((r) => r.entries > 0)
    .map((r) => ({
      id: r.session,
      label: r.session,
      count: r.entries,
      winRate: winRateFromEntries(r.entries, r.winEntries),
      totalPnl: r.totalPnl,
      avgResult: r.entries > 0 ? r.totalPnl / r.entries : null,
    }));
}

export function computeSummaryKpis(entries: JournalRow[], stats: TradingStatsSnapshot): SummaryKpis {
  const wins: number[] = [];
  const losses: number[] = [];
  const allPnls: number[] = [];

  for (const row of entries) {
    const p = parsePnlAmount(row.r);
    if (p === null || !Number.isFinite(p)) continue;
    allPnls.push(p);
    if (p > 0) wins.push(p);
    else if (p < 0) losses.push(Math.abs(p));
  }

  const avgWin = wins.length ? wins.reduce((s, n) => s + n, 0) / wins.length : null;
  const avgLoss = losses.length ? losses.reduce((s, n) => s + n, 0) / losses.length : null;
  const avgTrade = allPnls.length ? allPnls.reduce((s, n) => s + n, 0) / allPnls.length : null;
  const riskReward = avgWin !== null && avgLoss !== null && avgLoss > 0 ? avgWin / avgLoss : null;

  const netPnl = stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0;

  return {
    netPnl,
    tradeCount: entries.length,
    tradedDays: stats.dailyBars.length,
    winRate: stats.winRateTrades,
    avgWin,
    avgLoss,
    avgTrade,
    riskReward,
    bestDay: stats.bestDay,
    worstDay: stats.worstDay
      ? { date: stats.worstDay.date, pnl: stats.worstDay.pnl, label: "Worst day" }
      : stats.smallestGreenDay
        ? { date: stats.smallestGreenDay.date, pnl: stats.smallestGreenDay.pnl, label: "Smallest green day" }
        : null,
    profitFactor: stats.profitFactor,
    maxDrawdown: stats.maxDrawdown,
  };
}

export function buildPatternInsights(params: {
  stats: TradingStatsSnapshot;
  sessionTags: SessionTagPerformanceRow[];
  rulesTopPositive?: { title: string; followedPct: number | null } | null;
  currency: string;
}): InsightListItem[] {
  const { stats, sessionTags, rulesTopPositive, currency } = params;
  const items: InsightListItem[] = [];

  if (stats.bestSetup) {
    const setup = stats.setupPerformance.find((s) => s.setup === stats.bestSetup);
    items.push({
      id: "best-setup",
      title: "Best setup",
      body: setup
        ? `${stats.bestSetup} contributed ${formatSignedPnlAmount(setup.totalPnl, currency)} across ${setup.entries} entries.`
        : stats.bestSetup,
      severity: "positive",
      tag: "Setup",
    });
  }

  const worstSetup = [...stats.setupPerformance].sort((a, b) => a.totalPnl - b.totalPnl)[0];
  if (worstSetup && worstSetup.entries >= 2 && worstSetup.totalPnl < 0) {
    items.push({
      id: "worst-setup",
      title: "Weakest setup",
      body: `${worstSetup.setup} averaged ${formatSignedPnlAmount(worstSetup.averagePnl ?? 0, currency)} per entry.`,
      severity: "negative",
      tag: "Setup",
    });
  }

  if (stats.bestWeekday) {
    const wd = stats.weekdayPerformance.find((w) => w.weekday === stats.bestWeekday);
    items.push({
      id: "best-weekday",
      title: "Strongest weekday",
      body: wd
        ? `${stats.bestWeekday} days total ${formatSignedPnlAmount(wd.totalPnl, currency)}.`
        : stats.bestWeekday,
      severity: "positive",
      tag: "Timing",
    });
  }

  const bestSession = sessionTags[0];
  if (bestSession && bestSession.entries >= 2) {
    items.push({
      id: "best-session",
      title: "Best session tag",
      body: `${bestSession.label} · ${formatSignedPnlAmount(bestSession.totalPnl, currency)} total.`,
      severity: "positive",
      tag: "Session",
    });
  }

  const winHint = stats.correlationHints.find((h) => h.label.includes("Followed plan = true"));
  const lossHint = stats.correlationHints.find((h) => h.label.includes("Followed plan = false"));
  if (winHint) {
    items.push({
      id: "plan-win",
      title: "Winning trait",
      body: `Following plan averages ${formatSignedPnlAmount(winHint.avgPnl, currency)} (${winHint.sample} samples).`,
      severity: "positive",
      tag: "Discipline",
    });
  }
  if (lossHint) {
    items.push({
      id: "plan-loss",
      title: "Losing trait",
      body: `Missing plan averages ${formatSignedPnlAmount(lossHint.avgPnl, currency)} (${lossHint.sample} samples).`,
      severity: "warning",
      tag: "Discipline",
    });
  }

  if (rulesTopPositive && rulesTopPositive.followedPct !== null) {
    items.push({
      id: "rule-positive",
      title: "Rule adherence",
      body: `${rulesTopPositive.title} followed ${rulesTopPositive.followedPct}% of the time in this scope.`,
      severity: "info",
      tag: "Rules",
    });
  }

  if (stats.mostCommonMistake && stats.mostCommonMistake !== "None") {
    items.push({
      id: "mistake",
      title: "Common mistake tag",
      body: `${stats.mostCommonMistake}${stats.mistakeCost !== null ? ` · cost ${formatSignedPnlAmount(stats.mistakeCost, currency)}` : ""}.`,
      severity: "warning",
      tag: "Tag",
    });
  }

  return items;
}

export function moodRowsFromStats(stats: TradingStatsSnapshot): BreakdownRow[] {
  const total = stats.moodBreakdown.calm + stats.moodBreakdown.focused + stats.moodBreakdown.hesitant + stats.moodBreakdown.tilted;
  if (total === 0) return [];
  return [
    { id: "calm", label: "Calm", count: stats.moodBreakdown.calm, winRate: null, totalPnl: 0, avgResult: null },
    { id: "focused", label: "Focused", count: stats.moodBreakdown.focused, winRate: null, totalPnl: 0, avgResult: null },
    { id: "hesitant", label: "Hesitant", count: stats.moodBreakdown.hesitant, winRate: null, totalPnl: 0, avgResult: null },
    { id: "tilted", label: "Tilted", count: stats.moodBreakdown.tilted, winRate: null, totalPnl: 0, avgResult: null },
  ].filter((r) => r.count > 0);
}
