import { parsePnlAmount, tradeWinRatePercent } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";

export type MonthlyReviewSnapshot = {
  monthKey: string;
  monthPnl: number;
  tradedDays: number;
  /** Winning / (winning + losing) trades in month; breakevens excluded */
  winRateTrades: number | null;
  bestDay: { date: string; pnl: number } | null;
  worstOrSmallestGreenDay: { date: string; pnl: number; label: "Worst day" | "Smallest green day" } | null;
  bestWeek: { weekStart: string; pnl: number } | null;
  weakestWeek: { weekStart: string; pnl: number } | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  disciplineScore: number | null;
  bestMood: string | null;
  mostCommonMistake: string | null;
  bestSetup: string | null;
  topSymbol: string | null;
  nextFocus: string | null;
};

type ReflectionFocus = { weekStart: string; nextWeekFocus: string | null };

function weekStartMonday(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}

function pickMonthKey(entries: JournalRow[], preferredMonthKey?: string): string {
  if (preferredMonthKey && /^\d{4}-\d{2}$/.test(preferredMonthKey)) return preferredMonthKey;
  const first = entries.find((e) => e.entryDate)?.entryDate;
  if (first) return first.slice(0, 7);
  return new Date().toISOString().slice(0, 7);
}

export function computeMonthlyReview(
  entries: JournalRow[],
  weeklyFocuses: ReflectionFocus[],
  preferredMonthKey?: string,
): MonthlyReviewSnapshot {
  const monthKey = pickMonthKey(entries, preferredMonthKey);
  const rows = entries.filter((e) => (e.entryDate ?? "").slice(0, 7) === monthKey);
  const byDay = new Map<string, number>();
  const green: number[] = [];
  const red: number[] = [];
  const weekly = new Map<string, number>();
  const moodMap = new Map<string, { total: number; count: number }>();
  const mistakeMap = new Map<string, number>();
  const setupMap = new Map<string, { total: number; count: number }>();
  const symbolMap = new Map<string, number>();
  let checksDone = 0;
  let checksTotal = 0;

  for (const row of rows) {
    const day = row.entryDate ?? "";
    if (!day) continue;
    const pnl = parsePnlAmount(row.r) ?? 0;
    byDay.set(day, (byDay.get(day) ?? 0) + pnl);
    const ws = weekStartMonday(day);
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
    checksTotal += 3;
    if (row.followedPlan) checksDone += 1;
    if (row.respectedStop) checksDone += 1;
    if (row.noRevengeTrade) checksDone += 1;
  }

  const daily = [...byDay.entries()].map(([date, pnl]) => ({ date, pnl })).sort((a, b) => a.date.localeCompare(b.date));
  for (const d of daily) {
    if (d.pnl > 0) green.push(d.pnl);
    else if (d.pnl < 0) red.push(d.pnl);
  }
  const bestDay = daily.length ? daily.reduce((a, b) => (b.pnl > a.pnl ? b : a)) : null;
  const worstDay = daily.filter((d) => d.pnl < 0).sort((a, b) => a.pnl - b.pnl)[0] ?? null;
  const smallestGreen = daily.filter((d) => d.pnl > 0).sort((a, b) => a.pnl - b.pnl)[0] ?? null;
  const weeklyRows = [...weekly.entries()].map(([weekStart, pnl]) => ({ weekStart, pnl }));
  const bestWeek = weeklyRows.length ? weeklyRows.reduce((a, b) => (b.pnl > a.pnl ? b : a)) : null;
  const weakestWeek = weeklyRows.length ? weeklyRows.reduce((a, b) => (b.pnl < a.pnl ? b : a)) : null;
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
  const winRateTrades = tradeWinRatePercent(rows);
  const focus = weeklyFocuses
    .filter((r) => r.weekStart.slice(0, 7) <= monthKey && Boolean(r.nextWeekFocus?.trim()))
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0]?.nextWeekFocus;

  return {
    monthKey,
    monthPnl,
    tradedDays: daily.length,
    winRateTrades,
    bestDay,
    worstOrSmallestGreenDay: worstDay
      ? { ...worstDay, label: "Worst day" }
      : smallestGreen
        ? { ...smallestGreen, label: "Smallest green day" }
        : null,
    bestWeek,
    weakestWeek,
    avgGreenDay: green.length ? green.reduce((s, v) => s + v, 0) / green.length : null,
    avgRedDay: red.length ? red.reduce((s, v) => s + v, 0) / red.length : null,
    disciplineScore: checksTotal > 0 ? Math.round((checksDone / checksTotal) * 100) : null,
    bestMood,
    mostCommonMistake,
    bestSetup,
    topSymbol,
    nextFocus: focus?.trim() ?? null,
  };
}
