import type { BarChartPoint } from "@/components/v2/charts/bar-chart";
import type { LineAreaPoint } from "@/components/v2/charts/line-area-chart";
import type { RadarPoint } from "@/components/v2/charts/radar-chart";
import type { JournalRow } from "@/lib/user-data/types";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { computeDisciplineScorePercent } from "@/lib/user-data/discipline-stats";

export type DayAgg = { key: string; pnl: number };

function shortDateLabel(dayKey: string): string {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

export function buildCumulativeChartData(dayAgg: DayAgg[]): LineAreaPoint[] {
  const ordered = [...dayAgg].sort((a, b) => a.key.localeCompare(b.key));
  let cum = 0;
  return ordered.map((day) => {
    cum += day.pnl;
    return { day: shortDateLabel(day.key), pnl: Number(cum.toFixed(2)) };
  });
}

export function buildDailyBarChartData(dayAgg: DayAgg[], limit = 14): BarChartPoint[] {
  const ordered = [...dayAgg].sort((a, b) => a.key.localeCompare(b.key));
  const slice = ordered.slice(-limit);
  return slice.map((day) => ({
    day: shortDateLabel(day.key),
    pnl: Number(day.pnl.toFixed(2)),
  }));
}

export function getDominantMood(entries: JournalRow[]): string | null {
  const counts = new Map<string, number>();
  for (const row of entries) {
    const mood = row.moodState?.trim();
    if (!mood) continue;
    counts.set(mood, (counts.get(mood) ?? 0) + 1);
  }
  if (counts.size === 0) return null;
  let best: string | null = null;
  let bestCount = 0;
  for (const [mood, count] of counts) {
    if (count > bestCount) {
      best = mood;
      bestCount = count;
    }
  }
  return best;
}

export function getFollowedPlanPercent(entries: JournalRow[]): number | null {
  let total = 0;
  let yes = 0;
  for (const row of entries) {
    if (row.followedPlan === undefined) continue;
    total += 1;
    if (row.followedPlan) yes += 1;
  }
  if (total === 0) return null;
  return Math.round((yes / total) * 100);
}

export function getAvgTradePnl(entries: JournalRow[]): number | null {
  const pnls: number[] = [];
  for (const row of entries) {
    const p = parsePnlAmount(row.r);
    if (p !== null && Number.isFinite(p)) pnls.push(p);
  }
  if (pnls.length === 0) return null;
  const avg = pnls.reduce((s, n) => s + n, 0) / pnls.length;
  return Number.isFinite(avg) ? avg : null;
}

const RADAR_MIN_TRADED_DAYS = 5;
const RADAR_MIN_ENTRIES = 8;

export function buildRadarReviewScores(params: {
  entries: JournalRow[];
  tradedDays: number;
  winRate: number | null;
}): RadarPoint[] | null {
  const { entries, tradedDays, winRate } = params;
  if (tradedDays < RADAR_MIN_TRADED_DAYS && entries.length < RADAR_MIN_ENTRIES) {
    return null;
  }

  const discipline = computeDisciplineScorePercent(entries);
  const planPct = getFollowedPlanPercent(entries);

  const axes: RadarPoint[] = [];
  if (discipline !== null) axes.push({ axis: "Discipline", value: discipline });
  if (winRate !== null) axes.push({ axis: "Win rate", value: winRate });
  if (planPct !== null) axes.push({ axis: "Plan", value: planPct });

  const stopPct = ruleAdherencePercent(entries, "respectedStop");
  if (stopPct !== null) axes.push({ axis: "Stops", value: stopPct });

  const revengePct = ruleAdherencePercent(entries, "noRevengeTrade");
  if (revengePct !== null) axes.push({ axis: "No revenge", value: revengePct });

  return axes.length >= 3 ? axes : null;
}

function ruleAdherencePercent(
  entries: JournalRow[],
  field: "followedPlan" | "respectedStop" | "noRevengeTrade",
): number | null {
  let total = 0;
  let yes = 0;
  for (const row of entries) {
    const val = row[field];
    if (val === undefined) continue;
    total += 1;
    if (val) yes += 1;
  }
  if (total === 0) return null;
  return Math.round((yes / total) * 100);
}

export function formatAvgTrade(value: number | null, currency: string, formatMoney: (n: number, c: string) => string): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return formatMoney(value, currency);
}
