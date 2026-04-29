"use client";

import type { JournalRow } from "@/lib/user-data/types";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { formatSignedPnlAmount } from "@/lib/format-pnl";

export type BehaviorInsight = { title: string; detail: string };

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

type GetBehaviorInsightsParams = {
  entries: JournalRow[];
  activeAccountId?: string | null;
  timezone?: string | null;
  currency: string;
  maxItems?: number;
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
  // `entries` are already account-scoped by workspace state.
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

  let completedChecks = 0;
  let totalChecks = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  for (const row of entries) {
    const tradePnl = parsePnlAmount(row.r);
    if (tradePnl !== null) {
      if (tradePnl > 0) winningTrades += 1;
      if (tradePnl < 0) losingTrades += 1;
    }
    totalChecks += 3;
    if (row.followedPlan) completedChecks += 1;
    if (row.respectedStop) completedChecks += 1;
    if (row.noRevengeTrade) completedChecks += 1;
  }

  const directionalTrades = winningTrades + losingTrades;

  return {
    weekPnl,
    monthPnl,
    tradedDays,
    winningDays,
    losingDays,
    // Win rate is trade-based (+ / - entries), not day-based.
    winRate: directionalTrades > 0 ? Math.round((winningTrades / directionalTrades) * 100) : null,
    averageDay: avg(totalPnl, tradedDays),
    bestDay: tradedDays > 0 ? Math.max(...daily.map((d) => d.pnl)) : null,
    worstLossDay: negatives.length > 0 ? Math.min(...negatives) : null,
    smallestGreenDay: positives.length > 0 ? Math.min(...positives) : null,
    avgGreenDay: avg(positives.reduce((s, n) => s + n, 0), positives.length),
    avgRedDay: avg(negatives.reduce((s, n) => s + n, 0), negatives.length),
    streak: streakFromDaily(daily),
    disciplineScore: totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : null,
    greenRedSummary: `${winningDays} / ${losingDays}`,
  };
}

export function getBehaviorInsights({
  entries,
  activeAccountId,
  timezone,
  currency,
  maxItems = 5,
}: GetBehaviorInsightsParams): BehaviorInsight[] {
  // `entries` are already account-scoped by workspace state.
  void activeAccountId;
  const insights: BehaviorInsight[] = [];
  if (entries.length === 0) return insights;

  const daily = aggregateDaily(entries, timezone);
  const pnlEntries = entries
    .map((row) => parsePnlAmount(row.r))
    .filter((value): value is number => value !== null && Number.isFinite(value));
  if (pnlEntries.length < 4) return insights;

  const moodBuckets = new Map<string, { total: number; count: number }>();
  const validMoods = new Set(["Calm", "Focused", "Hesitant", "Tilted"]);
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null) continue;
    const mood = row.moodState;
    if (!mood || !validMoods.has(mood)) continue;
    const prev = moodBuckets.get(mood) ?? { total: 0, count: 0 };
    moodBuckets.set(mood, { total: prev.total + pnl, count: prev.count + 1 });
  }

  const bestMood = [...moodBuckets.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([mood, v]) => ({ mood, avg: v.total / v.count }))
    .sort((a, b) => b.avg - a.avg)[0];
  if (bestMood && bestMood.avg > 0) {
    insights.push({
      title: `Best state: ${bestMood.mood}`,
      detail: `${formatSignedPnlAmount(bestMood.avg, currency)} avg across ${moodBuckets.get(bestMood.mood)?.count ?? 0} entries`,
    });
  }

  const compare = (
    title: string,
    yesDetail: string,
    noDetail: string,
    pick: (row: JournalRow) => boolean | undefined,
    minimumEdge = 5,
  ) => {
    let yesTotal = 0;
    let yesCount = 0;
    let noTotal = 0;
    let noCount = 0;
    for (const row of entries) {
      const pnl = parsePnlAmount(row.r);
      if (pnl === null) continue;
      if (pick(row)) {
        yesTotal += pnl;
        yesCount += 1;
      } else {
        noTotal += pnl;
        noCount += 1;
      }
    }
    if (yesCount >= 2 && noCount >= 2) {
      const yesAvg = yesTotal / yesCount;
      const noAvg = noTotal / noCount;
      if (!Number.isFinite(yesAvg) || !Number.isFinite(noAvg)) return;
      if (yesAvg <= noAvg) return;
      if (Math.abs(yesAvg - noAvg) < minimumEdge) return;
      insights.push({
        title,
        detail: `${formatSignedPnlAmount(yesAvg, currency)} avg ${yesDetail} vs ${formatSignedPnlAmount(noAvg, currency)} ${noDetail}`,
      });
    }
  };

  compare("Following your plan is paying off", "when followed", "when not", (r) => r.followedPlan);
  compare("Stop discipline is positive", "when respected", "when not respected", (r) => r.respectedStop);
  compare("Revenge control is working", "when revenge-free", "when revenge happened", (r) => r.noRevengeTrade);

  const byDay = new Map<string, { allNoRevenge: boolean }>();
  for (const row of entries) {
    const key = rowDayKey(row, timezone);
    const prev = byDay.get(key);
    const noRevenge = Boolean(row.noRevengeTrade);
    byDay.set(key, { allNoRevenge: prev ? prev.allNoRevenge && noRevenge : noRevenge });
  }
  const orderedKeys = [...byDay.keys()].sort((a, b) => b.localeCompare(a));
  let revengeFreeStreak = 0;
  for (const key of orderedKeys) {
    if (byDay.get(key)?.allNoRevenge) revengeFreeStreak += 1;
    else break;
  }
  if (orderedKeys.length >= 3 && revengeFreeStreak >= 2) {
    insights.push({
      title: "Revenge-free streak is building",
      detail: `${revengeFreeStreak} straight day${revengeFreeStreak === 1 ? "" : "s"} without revenge trading`,
    });
  }

  const weekdayBuckets = new Map<string, { total: number; count: number }>();
  for (const d of daily) {
    const weekday = new Date(`${d.key}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short" });
    const prev = weekdayBuckets.get(weekday) ?? { total: 0, count: 0 };
    weekdayBuckets.set(weekday, { total: prev.total + d.pnl, count: prev.count + 1 });
  }
  const bestWeekday = [...weekdayBuckets.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([day, v]) => ({ day, total: v.total }))
    .sort((a, b) => b.total - a.total)[0];
  if (bestWeekday && bestWeekday.total > 0) {
    insights.push({
      title: `Best weekday: ${bestWeekday.day}`,
      detail: `${formatSignedPnlAmount(bestWeekday.total, currency)} total`,
    });
  }

  return insights.slice(0, maxItems);
}

