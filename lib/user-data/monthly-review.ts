import { parsePnlAmount, tradeWinRatePercent } from "@/lib/user-data/kpi";
import {
  computeDisciplineScorePercent,
  getDisciplineCoverageHint,
  summarizeDisciplineCoverage,
} from "@/lib/user-data/discipline-stats";
import { dayKeyFromRow, startOfWeekMonday, toDayKey } from "@/lib/user-data/journal-metrics";
import {
  pickBestDay,
  pickMonthKeyFromEntries,
  pickWorstOrSmallestGreenDay,
} from "@/lib/user-data/stats-display";
import { pickBestWorstWeeks } from "@/lib/user-data/week-aggregation";
import type { JournalRow } from "@/lib/user-data/types";

/** Minimum distinct traded days before the month report is treated as fully reliable. */
export const MONTHLY_REVIEW_MIN_TRADED_DAYS = 3;

export type MonthlyReviewSnapshot = {
  monthKey: string;
  monthLabel: string;
  monthPnl: number;
  entryCount: number;
  tradedDays: number;
  /** True when the month has some activity but fewer than {@link MONTHLY_REVIEW_MIN_TRADED_DAYS} traded days. */
  isPartial: boolean;
  /** Winning / (winning + losing) trades in month; breakevens excluded */
  winRateTrades: number | null;
  bestDay: { date: string; pnl: number } | null;
  worstOrSmallestGreenDay: { date: string; pnl: number; label: "Worst day" | "Smallest green day" } | null;
  bestWeek: { weekStart: string; pnl: number } | null;
  weakestWeek: { weekStart: string; pnl: number } | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  disciplineScore: number | null;
  disciplineNote: string | null;
  bestMood: string | null;
  mostCommonMistake: string | null;
  bestSetup: string | null;
  topSymbol: string | null;
  nextFocus: string | null;
};

type ReflectionFocus = { weekStart: string; nextWeekFocus: string | null };

function weekStartForDayKey(dayKey: string): string {
  return toDayKey(startOfWeekMonday(new Date(`${dayKey}T12:00:00`)));
}

export function formatMonthKeyLabel(monthKey: string): string {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) return monthKey;
  const d = new Date(`${monthKey}-01T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function computeMonthlyReview(
  entries: JournalRow[],
  weeklyFocuses: ReflectionFocus[],
  preferredMonthKey?: string,
): MonthlyReviewSnapshot {
  const dayKeyForRow = (row: JournalRow) => dayKeyFromRow(row.entryDate, row.createdAt);
  const monthKey = pickMonthKeyFromEntries(entries, dayKeyForRow, preferredMonthKey);
  const rows = entries.filter((e) => dayKeyForRow(e).slice(0, 7) === monthKey);
  const byDay = new Map<string, number>();
  const weekly = new Map<string, number>();
  const moodMap = new Map<string, { total: number; count: number }>();
  const mistakeMap = new Map<string, number>();
  const setupMap = new Map<string, { total: number; count: number }>();
  const symbolMap = new Map<string, number>();

  for (const row of rows) {
    const day = dayKeyForRow(row);
    if (!day) continue;
    const pnl = parsePnlAmount(row.r) ?? 0;
    byDay.set(day, (byDay.get(day) ?? 0) + pnl);
    const ws = weekStartForDayKey(day);
    weekly.set(ws, (weekly.get(ws) ?? 0) + pnl);

    if (row.sym?.trim()) symbolMap.set(row.sym.trim(), (symbolMap.get(row.sym.trim()) ?? 0) + 1);
    if (row.tag && row.tag !== "None") mistakeMap.set(row.tag, (mistakeMap.get(row.tag) ?? 0) + 1);
    if (row.setup && row.setup !== "Other") {
      const b = setupMap.get(String(row.setup)) ?? { total: 0, count: 0 };
      b.total += pnl;
      b.count += 1;
      setupMap.set(String(row.setup), b);
    }
    if (row.moodState) {
      const b = moodMap.get(row.moodState) ?? { total: 0, count: 0 };
      b.total += pnl;
      b.count += 1;
      moodMap.set(row.moodState, b);
    }
  }

  const daily = [...byDay.entries()].map(([date, pnl]) => ({ date, pnl })).sort((a, b) => a.date.localeCompare(b.date));
  const green: number[] = [];
  const red: number[] = [];
  for (const d of daily) {
    if (d.pnl > 0) green.push(d.pnl);
    else if (d.pnl < 0) red.push(d.pnl);
  }

  const bestDay = pickBestDay(daily);
  const worstOrSmallestGreenDay = pickWorstOrSmallestGreenDay(daily);
  const weeklyRows = [...weekly.entries()].map(([weekStart, pnl]) => ({ weekStart, pnl }));
  const { bestWeek, weakestWeek } = pickBestWorstWeeks(weeklyRows);

  const topSymbol = [...symbolMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const mostCommonMistake = [...mistakeMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const bestSetup =
    [...setupMap.entries()]
      .filter(([, stats]) => stats.count > 0)
      .map(([name, stats]) => ({ name, avg: stats.total / stats.count }))
      .sort((a, b) => b.avg - a.avg)[0]?.name ?? null;
  const bestMood =
    [...moodMap.entries()]
      .filter(([, stats]) => stats.count > 0)
      .map(([name, stats]) => ({ name, avg: stats.total / stats.count }))
      .sort((a, b) => b.avg - a.avg)[0]?.name ?? null;
  const monthPnl = daily.reduce((s, d) => s + d.pnl, 0);
  const entryCount = rows.length;
  const tradedDays = daily.length;
  const isPartial = entryCount > 0 && tradedDays < MONTHLY_REVIEW_MIN_TRADED_DAYS;
  const winRateTrades = tradeWinRatePercent(rows);
  const focus = weeklyFocuses
    .filter((r) => r.weekStart.slice(0, 7) <= monthKey && Boolean(r.nextWeekFocus?.trim()))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0]?.nextWeekFocus;

  return {
    monthKey,
    monthLabel: formatMonthKeyLabel(monthKey),
    monthPnl,
    entryCount,
    tradedDays,
    isPartial,
    winRateTrades,
    bestDay,
    worstOrSmallestGreenDay,
    bestWeek,
    weakestWeek,
    avgGreenDay: green.length ? green.reduce((s, v) => s + v, 0) / green.length : null,
    avgRedDay: red.length ? red.reduce((s, v) => s + v, 0) / red.length : null,
    disciplineScore: computeDisciplineScorePercent(rows),
    disciplineNote: getDisciplineCoverageHint(summarizeDisciplineCoverage(rows)) ?? null,
    bestMood,
    mostCommonMistake,
    bestSetup,
    topSymbol,
    nextFocus: focus?.trim() ?? null,
  };
}
