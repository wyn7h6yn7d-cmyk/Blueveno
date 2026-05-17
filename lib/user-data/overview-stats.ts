"use client";

import type { JournalRow } from "@/lib/user-data/types";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { computeDisciplineScorePercent } from "@/lib/user-data/discipline-stats";
import { pickSmallestGreenDay, pickWorstLossDay } from "@/lib/user-data/stats-display";

export type { BehaviorInsight, BehaviorInsightsResult } from "@/lib/user-data/behavior-insights";
export {
  BEHAVIOR_INSIGHT_MIN_ENTRIES,
  BEHAVIOR_INSIGHT_MIN_TRADED_DAYS,
  getBehaviorInsights,
} from "@/lib/user-data/behavior-insights";

type OverviewStats = {
  weekPnl: number;
  monthPnl: number;
  tradedDays: number;
  winningDays: number;
  losingDays: number;
  winRate: number | null;
  averageDay: number | null;
  bestDay: number | null;
  worstLossDay: number | null;
  smallestGreenDay: number | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  streak: string;
  disciplineScore: number | null;
  greenRedSummary: string;
};

type GetOverviewStatsParams = {
  entries: JournalRow[];
  activeAccountId?: string | null;
  timezone?: string | null;
  currency: string;
};

type DailyAgg = { key: string; pnl: number };

function dayKeyFromDate(date: Date, timezone?: string | null): string {
  if (!timezone) return date.toISOString().slice(0, 10);
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function rowDayKey(row: JournalRow, timezone?: string | null): string {
  if (row.entryDate && /^\d{4}-\d{2}-\d{2}$/.test(row.entryDate)) return row.entryDate;
  if (row.createdAt) return dayKeyFromDate(new Date(row.createdAt), timezone);
  return dayKeyFromDate(new Date(), timezone);
}

function startOfWeekMonday(base: Date): Date {
  const d = new Date(base);
  const dow = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dow);
  return d;
}

function monthKey(date: Date, timezone?: string | null): string {
  return dayKeyFromDate(date, timezone).slice(0, 7);
}

function aggregateDaily(entries: JournalRow[], timezone?: string | null): DailyAgg[] {
  const map = new Map<string, number>();
  for (const row of entries) {
    const key = rowDayKey(row, timezone);
    const pnl = parsePnlAmount(row.r) ?? 0;
    map.set(key, (map.get(key) ?? 0) + pnl);
  }
  return [...map.entries()].map(([key, pnl]) => ({ key, pnl }));
}

function avg(total: number, count: number): number | null {
  if (count <= 0) return null;
  const v = total / count;
  return Number.isFinite(v) ? v : null;
}

function streakFromDaily(daily: DailyAgg[]): string {
  if (daily.length === 0) return "No streak";
  const ordered = [...daily].sort((a, b) => b.key.localeCompare(a.key));
  const first = ordered[0];
  if (!first || first.pnl === 0) return "Flat day";
  const positive = first.pnl > 0;
  let count = 0;
  for (const day of ordered) {
    if (positive && day.pnl > 0) {
      count += 1;
      continue;
    }
    if (!positive && day.pnl < 0) {
      count += 1;
      continue;
    }
    break;
  }
  return `${count} ${positive ? "green" : "red"} day${count === 1 ? "" : "s"}`;
}

export function getOverviewStats({
  entries,
  activeAccountId,
  timezone,
  currency,
}: GetOverviewStatsParams): OverviewStats {
  void activeAccountId;
  void currency;
  const daily = aggregateDaily(entries, timezone);
  const tradedDays = daily.length;
  const now = new Date();
  const weekStart = dayKeyFromDate(startOfWeekMonday(now), timezone);
  const month = monthKey(now, timezone);

  let weekPnl = 0;
  let monthPnl = 0;
  let winningDays = 0;
  let losingDays = 0;
  let totalPnl = 0;
  const positives: number[] = [];
  const negatives: number[] = [];

  for (const d of daily) {
    totalPnl += d.pnl;
    if (d.key >= weekStart) weekPnl += d.pnl;
    if (d.key.startsWith(month)) monthPnl += d.pnl;
    if (d.pnl > 0) {
      winningDays += 1;
      positives.push(d.pnl);
    } else if (d.pnl < 0) {
      losingDays += 1;
      negatives.push(d.pnl);
    }
  }

  let winningTrades = 0;
  let losingTrades = 0;
  for (const row of entries) {
    const tradePnl = parsePnlAmount(row.r);
    if (tradePnl !== null) {
      if (tradePnl > 0) winningTrades += 1;
      if (tradePnl < 0) losingTrades += 1;
    }
  }

  const directionalTrades = winningTrades + losingTrades;
  const dailyRows = daily.map((d) => ({ date: d.key, pnl: d.pnl }));
  const worstLoss = pickWorstLossDay(dailyRows);
  const smallestGreen = pickSmallestGreenDay(dailyRows);

  return {
    weekPnl,
    monthPnl,
    tradedDays,
    winningDays,
    losingDays,
    winRate: directionalTrades > 0 ? Math.round((winningTrades / directionalTrades) * 100) : null,
    averageDay: avg(totalPnl, tradedDays),
    bestDay: tradedDays > 0 ? Math.max(...daily.map((d) => d.pnl)) : null,
    worstLossDay: worstLoss?.pnl ?? null,
    smallestGreenDay: smallestGreen?.pnl ?? null,
    avgGreenDay: avg(positives.reduce((s, n) => s + n, 0), positives.length),
    avgRedDay: avg(negatives.reduce((s, n) => s + n, 0), negatives.length),
    streak: streakFromDaily(daily),
    disciplineScore: computeDisciplineScorePercent(entries),
    greenRedSummary: `${winningDays} / ${losingDays}`,
  };
}
