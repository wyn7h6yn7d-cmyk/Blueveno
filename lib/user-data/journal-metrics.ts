import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";

export function toDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function dayKeyFromRow(entryDate?: string, createdAt?: string): string {
  if (entryDate) return entryDate;
  if (createdAt) return new Date(createdAt).toISOString().slice(0, 10);
  return toDayKey(new Date());
}

export function startOfWeekMonday(base: Date) {
  const copy = new Date(base);
  const day = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

export function monthKey(base: Date) {
  const m = base.getMonth() + 1;
  return `${base.getFullYear()}-${String(m).padStart(2, "0")}`;
}

export type DayAgg = { key: string; pnl: number };

export function buildDayAgg(journal: JournalRow[]): DayAgg[] {
  const map = new Map<string, number>();
  for (const row of journal) {
    const key = dayKeyFromRow(row.entryDate, row.createdAt);
    const value = parsePnlAmount(row.r) ?? 0;
    map.set(key, (map.get(key) ?? 0) + value);
  }
  return [...map.entries()].map(([key, pnl]) => ({ key, pnl }));
}

export function streakFromDaily(daily: DayAgg[]): string {
  if (daily.length === 0) return "No streak";
  const ordered = [...daily].sort((a, b) => b.key.localeCompare(a.key));
  const first = ordered[0];
  if (first.pnl === 0) return "Flat day";
  const positive = first.pnl > 0;
  let count = 0;
  for (const d of ordered) {
    if (positive && d.pnl > 0) {
      count += 1;
      continue;
    }
    if (!positive && d.pnl < 0) {
      count += 1;
      continue;
    }
    break;
  }
  return `${count} ${positive ? "green" : "red"} day${count === 1 ? "" : "s"}`;
}

export type JournalSummary = {
  weekPnl: number;
  monthPnl: number;
  winLoss: string;
  streak: string;
};

export type OverviewKpis = {
  tradedDays: number;
  winningDays: number;
  losingDays: number;
  winRatePct: number | null;
  disciplineScorePct: number | null;
  averageDay: number | null;
  bestDay: number | null;
  worstDay: number | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
};

export function computeJournalSummary(dayAgg: DayAgg[]): JournalSummary {
  const now = new Date();
  const weekStart = startOfWeekMonday(now);
  const weekStartKey = toDayKey(weekStart);
  const month = monthKey(now);
  let weekPnl = 0;
  let monthPnl = 0;
  let wins = 0;
  let losses = 0;
  for (const d of dayAgg) {
    if (d.key >= weekStartKey) weekPnl += d.pnl;
    if (d.key.startsWith(month)) monthPnl += d.pnl;
    if (d.pnl > 0) wins += 1;
    if (d.pnl < 0) losses += 1;
  }
  return {
    weekPnl,
    monthPnl,
    winLoss: `${wins}/${losses}`,
    streak: streakFromDaily(dayAgg),
  };
}

export function signedMoney(value: number, currency: string) {
  return formatSignedPnlAmount(value, currency);
}

function safeAvg(total: number, count: number): number | null {
  if (count <= 0) return null;
  const v = total / count;
  return Number.isFinite(v) ? v : null;
}

export function computeOverviewKpis(journal: JournalRow[]): OverviewKpis {
  const dayAgg = buildDayAgg(journal);
  const tradedDays = dayAgg.length;
  const winningDays = dayAgg.filter((d) => d.pnl > 0).length;
  const losingDays = dayAgg.filter((d) => d.pnl < 0).length;
  const totalPnl = dayAgg.reduce((sum, d) => sum + d.pnl, 0);

  const greenTotals = dayAgg.filter((d) => d.pnl > 0).map((d) => d.pnl);
  const redTotals = dayAgg.filter((d) => d.pnl < 0).map((d) => d.pnl);

  let completedChecks = 0;
  let totalChecks = 0;
  for (const row of journal) {
    totalChecks += 3;
    if (row.followedPlan) completedChecks += 1;
    if (row.respectedStop) completedChecks += 1;
    if (row.noRevengeTrade) completedChecks += 1;
  }

  const winRateRaw = tradedDays > 0 ? (winningDays / tradedDays) * 100 : null;
  const disciplineRaw = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : null;

  return {
    tradedDays,
    winningDays,
    losingDays,
    winRatePct: winRateRaw !== null && Number.isFinite(winRateRaw) ? Math.round(winRateRaw) : null,
    disciplineScorePct: disciplineRaw !== null && Number.isFinite(disciplineRaw) ? Math.round(disciplineRaw) : null,
    averageDay: safeAvg(totalPnl, tradedDays),
    bestDay: tradedDays > 0 ? Math.max(...dayAgg.map((d) => d.pnl)) : null,
    worstDay: tradedDays > 0 ? Math.min(...dayAgg.map((d) => d.pnl)) : null,
    avgGreenDay: safeAvg(greenTotals.reduce((s, n) => s + n, 0), greenTotals.length),
    avgRedDay: safeAvg(redTotals.reduce((s, n) => s + n, 0), redTotals.length),
  };
}
