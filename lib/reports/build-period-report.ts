import { computeBehaviorAnalysis } from "@/lib/behavior/behavior-analysis";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import type { PeriodReportSnapshot, ReportTableRow, ReportTypeId } from "@/lib/reports/report-types";
import { computeSummaryKpis } from "@/lib/stats/analytics-v2-transforms";
import { applyEntryFilters, EMPTY_ENTRY_FILTERS } from "@/lib/user-data/entry-filters";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { computeMonthlyReview, formatMonthKeyLabel } from "@/lib/user-data/monthly-review";
import { computeTradingStats, type MoodBreakdown, type TradingStatsSnapshot } from "@/lib/user-data/trading-stats";
import type { JournalRow } from "@/lib/user-data/types";

function dominantMoodFromBreakdown(breakdown: MoodBreakdown): string | null {
  const rows = [
    { mood: "Calm", count: breakdown.calm },
    { mood: "Focused", count: breakdown.focused },
    { mood: "Hesitant", count: breakdown.hesitant },
    { mood: "Tilted", count: breakdown.tilted },
  ];
  const top = [...rows].sort((a, b) => b.count - a.count)[0];
  return top && top.count > 0 ? top.mood : null;
}

function extendedMetrics(stats: TradingStatsSnapshot, behaviorDiscipline: number | null = null) {
  return {
    avgGreenDay: stats.avgGreenDay,
    avgRedDay: stats.avgRedDay,
    disciplineScore: behaviorDiscipline ?? stats.avgDisciplineScore,
    dominantMood: dominantMoodFromBreakdown(stats.moodBreakdown),
    mostCommonMistake: stats.mostCommonMistake,
  };
}

export type AccountSummaryRow = {
  id: string;
  name: string;
  type: string;
  pnl: number;
  winRate: number | null;
  tradedDays: number;
  disciplineScore: number | null;
};

export type BuildPeriodReportParams = {
  reportType: ReportTypeId;
  entries: JournalRow[];
  from: string;
  to: string;
  currency: string;
  accountRows?: AccountSummaryRow[];
  weeklyFocuses?: Array<{ weekStart: string; nextWeekFocus: string | null }>;
  reflectionWorked?: string | null;
  reflectionSlipped?: string | null;
};

function periodLabel(from: string, to: string): string {
  if (!from && !to) return "All time";
  if (from && to) return `${from} → ${to}`;
  if (from) return `From ${from}`;
  return `Through ${to}`;
}

function filterByPeriod(entries: JournalRow[], from: string, to: string): JournalRow[] {
  return applyEntryFilters(entries, { ...EMPTY_ENTRY_FILTERS, from, to });
}

function formatDayShort(dayKey: string): string {
  if (!dayKey) return "—";
  const date = new Date(`${dayKey}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

function baseFromStats(
  reportType: ReportTypeId,
  reportLabel: string,
  from: string,
  to: string,
  entries: JournalRow[],
  stats: ReturnType<typeof computeTradingStats>,
  disciplineOverride?: number | null,
): Pick<
  PeriodReportSnapshot,
  | "reportType"
  | "reportLabel"
  | "periodLabel"
  | "from"
  | "to"
  | "hasData"
  | "netPnl"
  | "tradeCount"
  | "tradedDays"
  | "winRate"
  | "bestDay"
  | "worstDay"
  | "avgGreenDay"
  | "avgRedDay"
  | "disciplineScore"
  | "dominantMood"
  | "topSetup"
  | "mostCommonMistake"
> {
  const summary = computeSummaryKpis(entries, stats);
  const extended = extendedMetrics(stats, disciplineOverride);
  return {
    reportType,
    reportLabel,
    periodLabel: periodLabel(from, to),
    from,
    to,
    hasData: entries.length > 0,
    netPnl: summary.netPnl,
    tradeCount: summary.tradeCount,
    tradedDays: summary.tradedDays,
    winRate: summary.winRate,
    bestDay: summary.bestDay,
    worstDay: summary.worstDay,
    topSetup: stats.bestSetup,
    ...extended,
  };
}

export function buildPeriodReport(params: BuildPeriodReportParams): PeriodReportSnapshot {
  const {
    reportType,
    entries,
    from,
    to,
    currency,
    accountRows = [],
    weeklyFocuses = [],
    reflectionWorked,
    reflectionSlipped,
  } = params;

  const periodEntries = filterByPeriod(entries, from, to);
  const stats = computeTradingStats(periodEntries, []);
  const meta = reportType;

  if (reportType === "account_report") {
    const tableHeaders = [
      { key: "account", label: "account" },
      { key: "type", label: "type" },
      { key: "net_pnl", label: "net_pnl" },
      { key: "win_rate", label: "win_rate_pct" },
      { key: "traded_days", label: "traded_days" },
      { key: "discipline", label: "discipline_pct" },
    ];
    const tableRows: ReportTableRow[] = accountRows.map((row) => ({
      account: row.name,
      type: row.type,
      net_pnl: row.pnl,
      win_rate: row.winRate,
      traded_days: row.tradedDays,
      discipline: row.disciplineScore,
    }));
    const totalPnl = accountRows.reduce((s, r) => s + r.pnl, 0);
    const focus = weeklyFocuses
      .filter((w) => Boolean(w.nextWeekFocus?.trim()))
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0]?.nextWeekFocus ?? null;

    return {
      ...baseFromStats(reportType, "Account report", from, to, periodEntries, stats),
      hasData: accountRows.length > 0,
      netPnl: totalPnl,
      behavioralNotes: accountRows.length > 1 ? ["Compare discipline and win rate before moving size between accounts."] : [],
      nextFocus: focus,
      tableHeaders,
      tableRows,
    };
  }

  if (reportType === "monthly_report") {
    const monthKey = to?.slice(0, 7) || from?.slice(0, 7) || periodEntries[0]?.entryDate?.slice(0, 7) || "";
    const monthly = computeMonthlyReview(periodEntries, weeklyFocuses, monthKey || undefined);
    const tableHeaders = [
      { key: "metric", label: "metric" },
      { key: "value", label: "value" },
    ];
    const tableRows: ReportTableRow[] = [
      { metric: "month", value: monthly.monthLabel },
      { metric: "net_pnl", value: monthly.monthPnl },
      { metric: "entries", value: monthly.entryCount },
      { metric: "traded_days", value: monthly.tradedDays },
      { metric: "win_rate_pct", value: monthly.winRateTrades },
      { metric: "discipline_pct", value: monthly.disciplineScore },
      { metric: "best_setup", value: monthly.bestSetup },
      { metric: "best_mood", value: monthly.bestMood },
      { metric: "top_symbol", value: monthly.topSymbol },
      { metric: "common_mistake", value: monthly.mostCommonMistake },
    ];

    const notes: string[] = [];
    if (monthly.disciplineNote) notes.push(monthly.disciplineNote);
    if (monthly.mostCommonMistake) notes.push(`Most common mistake tag: ${monthly.mostCommonMistake}.`);

    return {
      reportType: meta,
      reportLabel: "Monthly report",
      periodLabel: monthly.monthLabel || periodLabel(from, to),
      from,
      to,
      hasData: monthly.entryCount > 0,
      netPnl: monthly.monthPnl,
      tradeCount: monthly.entryCount,
      tradedDays: monthly.tradedDays,
      winRate: monthly.winRateTrades,
      bestDay: monthly.bestDay,
      worstDay: monthly.worstOrSmallestGreenDay
        ? { date: monthly.worstOrSmallestGreenDay.date, pnl: monthly.worstOrSmallestGreenDay.pnl, label: monthly.worstOrSmallestGreenDay.label }
        : null,
      avgGreenDay: monthly.avgGreenDay,
      avgRedDay: monthly.avgRedDay,
      disciplineScore: monthly.disciplineScore,
      dominantMood: monthly.bestMood,
      topSetup: monthly.bestSetup,
      mostCommonMistake: monthly.mostCommonMistake,
      behavioralNotes: notes,
      nextFocus: monthly.nextFocus,
      tableHeaders,
      tableRows,
    };
  }

  if (reportType === "behavior_report") {
    const behavior = computeBehaviorAnalysis({
      entries: periodEntries,
      currency,
      reflectionWorked,
      reflectionSlipped,
    });
    const tableHeaders = [
      { key: "metric", label: "metric" },
      { key: "value", label: "value" },
    ];
    const tableRows: ReportTableRow[] = [
      { metric: "discipline_score", value: behavior.scores.disciplineScore },
      { metric: "plan_follow_score", value: behavior.scores.planFollowScore },
      { metric: "emotional_consistency", value: behavior.scores.emotionalConsistencyScore },
      { metric: "best_mood", value: behavior.bestMood?.mood ?? null },
      { metric: "riskiest_mood", value: behavior.riskiestMood?.mood ?? null },
      { metric: "strongest_rule", value: behavior.bestRuleCorrelation?.label ?? null },
      { metric: "costliest_violation", value: behavior.worstRuleCorrelation?.label ?? null },
    ];

    const notes = behavior.coachingInsights.slice(0, 4).map((i) => i.body);
    if (behavior.dataNotes.length > 0) notes.push(...behavior.dataNotes);

    const base = baseFromStats(reportType, "Behavior report", from, to, periodEntries, stats, behavior.scores.disciplineScore ?? null);

    return {
      ...base,
      dominantMood: behavior.bestMood?.mood ?? base.dominantMood,
      behavioralNotes: notes,
      nextFocus: behavior.recommendations.find((r) => r.kind === "consistency")?.body ?? null,
      tableHeaders,
      tableRows,
    };
  }

  if (reportType === "trades_export") {
    const tableHeaders = [
      { key: "date", label: "date" },
      { key: "symbol", label: "symbol" },
      { key: "pnl", label: "pnl" },
      { key: "setup", label: "setup" },
      { key: "mistake_tag", label: "mistake_tag" },
      { key: "mood", label: "mood" },
      { key: "session", label: "session" },
      { key: "market", label: "market" },
      { key: "followed_plan", label: "followed_plan" },
      { key: "respected_stop", label: "respected_stop" },
      { key: "no_revenge", label: "no_revenge" },
      { key: "note", label: "note" },
      { key: "lesson", label: "lesson" },
    ];
    const tableRows: ReportTableRow[] = entriesToExportRows(periodEntries);
    const base = baseFromStats(reportType, "Trades export", from, to, periodEntries, stats);
    const notes: string[] = [`${periodEntries.length} entries ready for CSV export.`];

    return {
      ...base,
      behavioralNotes: notes,
      nextFocus: weeklyFocuses
        .filter((w) => Boolean(w.nextWeekFocus?.trim()))
        .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0]?.nextWeekFocus ?? null,
      tableHeaders,
      tableRows,
    };
  }

  // weekly_report (default)
  const tableHeaders = [
    { key: "metric", label: "metric" },
    { key: "value", label: "value" },
  ];
  const tableRows: ReportTableRow[] = [
    { metric: "net_pnl", value: stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0 },
    { metric: "trade_count", value: periodEntries.length },
    { metric: "traded_days", value: stats.dailyBars.length },
    { metric: "win_rate_pct", value: stats.winRateTrades },
    { metric: "profit_factor", value: stats.profitFactor },
    { metric: "max_drawdown", value: stats.maxDrawdown },
    { metric: "avg_discipline", value: stats.avgDisciplineScore },
    { metric: "best_setup", value: stats.bestSetup },
    { metric: "green_days", value: stats.winDays },
    { metric: "red_days", value: stats.lossDays },
  ];

  const notes: string[] = [];
  if (stats.avgDisciplineScore !== null) {
    notes.push(`Average discipline score: ${stats.avgDisciplineScore}%.`);
  }
  for (const hint of stats.correlationHints.slice(0, 2)) {
    notes.push(`${hint.label}: ${formatSignedPnlAmount(hint.avgPnl, currency)} avg (${hint.sample} entries).`);
  }
  if (stats.mostCommonMistake) notes.push(`Most common mistake: ${stats.mostCommonMistake}.`);

  const base = baseFromStats(reportType, "Weekly report", from, to, periodEntries, stats);

  return {
    ...base,
    behavioralNotes: notes,
    nextFocus: weeklyFocuses
      .filter((w) => Boolean(w.nextWeekFocus?.trim()))
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0]?.nextWeekFocus ?? null,
    tableHeaders,
    tableRows,
  };
}

export function entriesToExportRows(entries: JournalRow[]): Array<Record<string, string | number>> {
  return entries.map((row) => ({
    date: dayKeyFromRow(row.entryDate, row.createdAt),
    symbol: row.sym,
    pnl: row.r,
    setup: String(row.setup ?? ""),
    mistake_tag: String(row.tag ?? ""),
    mood: row.moodState ?? "",
    session: row.sessionTag ?? "",
    market: row.marketCondition ?? "",
    followed_plan: row.followedPlan === undefined ? "" : row.followedPlan ? "yes" : "no",
    respected_stop: row.respectedStop === undefined ? "" : row.respectedStop ? "yes" : "no",
    no_revenge: row.noRevengeTrade === undefined ? "" : row.noRevengeTrade ? "yes" : "no",
    note: row.note ?? "",
    lesson: row.lessonLearned ?? "",
  }));
}

export function formatReportDayLabel(dayKey: string): string {
  return formatDayShort(dayKey);
}

export function monthLabelFromPeriod(from: string, to: string): string {
  const key = to?.slice(0, 7) || from?.slice(0, 7);
  return key ? formatMonthKeyLabel(key) : periodLabel(from, to);
}
