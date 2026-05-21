import type { ForexSessionLabel } from "@/lib/trading-session";
import { primaryForexSessionUTC } from "@/lib/trading-session";
import type { JournalRow } from "@/lib/user-data/types";
import { journalEntryMoment } from "@/lib/user-data/journal-entry-time";
import { parsePnlAmount, tradeWinRatePercent } from "@/lib/user-data/kpi";
import { computeDisciplineScorePercent, rowDisciplineChecks } from "@/lib/user-data/discipline-stats";
import { dayKeyFromRow, startOfWeekMonday, toDayKey } from "@/lib/user-data/journal-metrics";
import { pickBestDay, pickSmallestGreenDay, pickWorstLossDay } from "@/lib/user-data/stats-display";

export type CumulativePoint = { i: number; t: string; y: number };

export type DailyBar = { date: string; pnl: number };

export type WeeklyPoint = { weekStart: string; label: string; total: number };

export type MonthlyBlock = { key: string; label: string; total: number };

export type SessionPnlRow = {
  session: ForexSessionLabel | "Between";
  totalPnl: number;
  entries: number;
  winEntries: number;
};

export type WeeklyReflectionStat = {
  week_start: string;
};

export type MoodBreakdown = {
  calm: number;
  focused: number;
  hesitant: number;
  tilted: number;
};

export type CorrelationStat = {
  label: string;
  sample: number;
  avgPnl: number;
};

export type TradingStatsSnapshot = {
  cumulative: CumulativePoint[];
  dailyBars: DailyBar[];
  weekly: WeeklyPoint[];
  winDays: number;
  lossDays: number;
  flatDays: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  smallestGreenDay: { date: string; pnl: number } | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  streakLabel: string;
  monthly: MonthlyBlock[];
  /** P&L by FX session (UTC windows), one bucket per entry */
  sessionPnl: SessionPnlRow[];
  avgDisciplineScore: number | null;
  thisWeekDisciplineScore: number | null;
  bestWeekQuality: { weekStart: string; score: number } | null;
  moodBreakdown: MoodBreakdown;
  correlationHints: CorrelationStat[];
  /** Winning trades / (winning + losing); breakeven and non-numeric P&amp;L excluded */
  winRateTrades: number | null;
  maxDrawdown: number | null;
  profitFactor: number | null;
  weekdayPerformance: Array<{
    weekday: string;
    totalPnl: number;
    averagePnl: number | null;
    tradedDays: number;
  }>;
  bestWeekday: string | null;
  weakestWeekday: string | null;
  symbolPerformance: Array<{
    symbol: string;
    totalPnl: number;
    averagePnl: number | null;
    entries: number;
  }>;
  bestSymbol: string | null;
  mostTradedSymbol: string | null;
  setupPerformance: Array<{
    setup: string;
    totalPnl: number;
    averagePnl: number | null;
    entries: number;
  }>;
  bestSetup: string | null;
  mostCommonMistake: string | null;
  mistakeCost: number | null;
  stopRespectedAvg: number | null;
  stopNotRespectedAvg: number | null;
  noRevengeAvg: number | null;
  revengeAvg: number | null;
};

function weekLabel(weekStart: string) {
  const d = new Date(`${weekStart}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const SESSION_PNL_ORDER: (ForexSessionLabel | "Between")[] = [
  "Sydney",
  "Tokyo",
  "London",
  "New York",
  "Between",
];

export function computeSessionPnlBreakdown(journal: JournalRow[]): SessionPnlRow[] {
  const map = new Map<ForexSessionLabel | "Between", { sum: number; n: number; wins: number }>();
  for (const s of SESSION_PNL_ORDER) {
    map.set(s, { sum: 0, n: 0, wins: 0 });
  }
  for (const row of journal) {
    const p = parsePnlAmount(row.r);
    if (p === null) continue;
    const moment = journalEntryMoment(row);
    const session = primaryForexSessionUTC(moment);
    const bucket = map.get(session);
    if (!bucket) continue;
    bucket.sum += p;
    bucket.n += 1;
    if (p > 0) bucket.wins += 1;
  }
  return SESSION_PNL_ORDER.map((session) => {
    const b = map.get(session)!;
    return {
      session,
      totalPnl: b.sum,
      entries: b.n,
      winEntries: b.wins,
    };
  });
}

function clamp100(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function dayDisciplineScore(row: JournalRow): number | null {
  const { completed, total } = rowDisciplineChecks(row);
  if (total === 0) return null;
  return Math.round((completed / total) * 100);
}

/** Aggregate P&L by calendar day (multiple rows same day sum). */
export function computeTradingStats(
  journal: JournalRow[],
  weeklyReflections: WeeklyReflectionStat[] = [],
): TradingStatsSnapshot {
  const dayMap = new Map<string, number>();
  const dayDisciplineMap = new Map<string, { sum: number; count: number }>();
  const dayMoodMap = new Map<string, JournalRow["moodState"]>();
  const moodBreakdown: MoodBreakdown = { calm: 0, focused: 0, hesitant: 0, tilted: 0 };
  const calmPnl: number[] = [];
  const focusedPnl: number[] = [];
  const tiltedPnl: number[] = [];
  const planTrue: number[] = [];
  const planFalse: number[] = [];
  const stopTrue: number[] = [];
  const stopFalse: number[] = [];
  const noRevengeTrue: number[] = [];
  const noRevengeFalse: number[] = [];
  const setupMap = new Map<string, { sum: number; count: number }>();
  const mistakeMap = new Map<string, { count: number; sum: number; lossSum: number }>();
  const symbolMap = new Map<string, { sum: number; count: number }>();

  for (const row of journal) {
    const key = dayKeyFromRow(row.entryDate, row.createdAt);
    const p = parsePnlAmount(row.r);

    const score = dayDisciplineScore(row);
    if (score !== null) {
      const d = dayDisciplineMap.get(key);
      dayDisciplineMap.set(key, d ? { sum: d.sum + score, count: d.count + 1 } : { sum: score, count: 1 });
    }
    if (row.moodState) {
      dayMoodMap.set(key, row.moodState);
    }

    if (p === null) continue;
    dayMap.set(key, (dayMap.get(key) ?? 0) + p);

    if (row.moodState === "Calm") calmPnl.push(p);
    if (row.moodState === "Focused") focusedPnl.push(p);
    if (row.moodState === "Tilted") tiltedPnl.push(p);
    if (row.followedPlan) planTrue.push(p);
    else planFalse.push(p);
    if (row.respectedStop) stopTrue.push(p);
    else stopFalse.push(p);
    if (row.noRevengeTrade) noRevengeTrue.push(p);
    else noRevengeFalse.push(p);

    const setupKey = String(row.setup ?? "Other").trim() || "Other";
    const setupPrev = setupMap.get(setupKey) ?? { sum: 0, count: 0 };
    setupMap.set(setupKey, { sum: setupPrev.sum + p, count: setupPrev.count + 1 });

    const symbolKey = String(row.sym ?? "—").trim().toUpperCase() || "—";
    const symbolPrev = symbolMap.get(symbolKey) ?? { sum: 0, count: 0 };
    symbolMap.set(symbolKey, { sum: symbolPrev.sum + p, count: symbolPrev.count + 1 });

    const mistakeKey = String(row.tag ?? "None").trim() || "None";
    const mistakePrev = mistakeMap.get(mistakeKey) ?? { count: 0, sum: 0, lossSum: 0 };
    mistakeMap.set(mistakeKey, {
      count: mistakePrev.count + 1,
      sum: mistakePrev.sum + p,
      lossSum: mistakePrev.lossSum + (p < 0 ? p : 0),
    });
  }

  const dates = [...dayMap.keys()].sort((a, b) => a.localeCompare(b));
  const dailyBars: DailyBar[] = dates.map((date) => ({ date, pnl: dayMap.get(date) ?? 0 }));

  const cumulative: CumulativePoint[] = [];
  let cum = 0;
  if (dates.length === 0) {
    cumulative.push({ i: 0, t: "", y: 0 });
  } else {
    cumulative.push({ i: 0, t: dates[0], y: 0 });
    for (let i = 0; i < dates.length; i++) {
      const t = dates[i];
      cum += dayMap.get(t) ?? 0;
      cumulative.push({ i: i + 1, t, y: cum });
    }
  }

  const weekMap = new Map<string, number>();
  const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekdayMap = new Map<string, { sum: number; count: number }>();
  for (const day of weekdayOrder) weekdayMap.set(day, { sum: 0, count: 0 });
  for (const d of dailyBars) {
    const base = new Date(`${d.date}T12:00:00`);
    const ws = startOfWeekMonday(base);
    const wk = toDayKey(ws);
    weekMap.set(wk, (weekMap.get(wk) ?? 0) + d.pnl);
    const weekday = base.toLocaleDateString("en-GB", { weekday: "short" });
    const prev = weekdayMap.get(weekday) ?? { sum: 0, count: 0 };
    weekdayMap.set(weekday, { sum: prev.sum + d.pnl, count: prev.count + 1 });
  }
  const weekKeys = [...weekMap.keys()].sort((a, b) => a.localeCompare(b));
  const weekly: WeeklyPoint[] = weekKeys.map((weekStart) => ({
    weekStart,
    label: weekLabel(weekStart),
    total: weekMap.get(weekStart) ?? 0,
  }));

  let wins = 0;
  let losses = 0;
  let flats = 0;
  const greens: number[] = [];
  const reds: number[] = [];
  for (const d of dailyBars) {
    if (d.pnl > 0) {
      wins += 1;
      greens.push(d.pnl);
    } else if (d.pnl < 0) {
      losses += 1;
      reds.push(d.pnl);
    } else {
      flats += 1;
    }
  }

  const bestDay = pickBestDay(dailyBars);
  const worstDay = pickWorstLossDay(dailyBars);
  const smallestGreenDay = pickSmallestGreenDay(dailyBars);

  const avgGreenDay = greens.length ? greens.reduce((a, b) => a + b, 0) / greens.length : null;
  const avgRedDay = reds.length ? reds.reduce((a, b) => a + b, 0) / reds.length : null;
  const winRateTrades = tradeWinRatePercent(journal);

  let peak = 0;
  let equity = 0;
  let maxDrawdown = 0;
  for (const d of dailyBars) {
    equity += d.pnl;
    if (equity > peak) peak = equity;
    const drawdown = equity - peak;
    if (drawdown < maxDrawdown) maxDrawdown = drawdown;
  }

  const grossProfit = dailyBars.filter((d) => d.pnl > 0).reduce((sum, d) => sum + d.pnl, 0);
  const grossLossAbs = Math.abs(dailyBars.filter((d) => d.pnl < 0).reduce((sum, d) => sum + d.pnl, 0));
  const profitFactor = grossLossAbs > 0 ? grossProfit / grossLossAbs : null;

  const orderedDesc = [...dailyBars].sort((a, b) => b.date.localeCompare(a.date));
  let streakLabel = "No streak";
  if (orderedDesc.length > 0) {
    const first = orderedDesc[0];
    if (first.pnl === 0) {
      streakLabel = "Flat day";
    } else {
      const positive = first.pnl > 0;
      let count = 0;
      for (const d of orderedDesc) {
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
      streakLabel = `${count} ${positive ? "green" : "red"} day${count === 1 ? "" : "s"}`;
    }
  }

  const monthMap = new Map<string, number>();
  for (const d of dailyBars) {
    const key = d.date.slice(0, 7);
    monthMap.set(key, (monthMap.get(key) ?? 0) + d.pnl);
  }
  const monthKeys = [...monthMap.keys()].sort((a, b) => a.localeCompare(b));
  const monthly: MonthlyBlock[] = monthKeys.map((key) => {
    const [y, m] = key.split("-").map(Number);
    const label = new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
    return { key, label, total: monthMap.get(key) ?? 0 };
  });

  const sessionPnl = computeSessionPnlBreakdown(journal);

  let disciplineTotal = 0;
  let disciplineDays = 0;
  for (const [dayKey, v] of dayDisciplineMap.entries()) {
    const dayScore = Math.round(v.sum / Math.max(v.count, 1));
    disciplineTotal += dayScore;
    disciplineDays += 1;
    const mood = dayMoodMap.get(dayKey);
    if (mood === "Calm") moodBreakdown.calm += 1;
    if (mood === "Focused") moodBreakdown.focused += 1;
    if (mood === "Hesitant") moodBreakdown.hesitant += 1;
    if (mood === "Tilted") moodBreakdown.tilted += 1;
  }
  const avgDisciplineScore = computeDisciplineScorePercent(journal);

  const reflectionWeeks = new Set(weeklyReflections.map((r) => r.week_start));
  const weekDiscipline = new Map<string, { sum: number; count: number }>();
  for (const [dayKey, v] of dayDisciplineMap.entries()) {
    const ws = toDayKey(startOfWeekMonday(new Date(`${dayKey}T12:00:00`)));
    const ds = Math.round(v.sum / Math.max(v.count, 1));
    const prev = weekDiscipline.get(ws);
    weekDiscipline.set(ws, prev ? { sum: prev.sum + ds, count: prev.count + 1 } : { sum: ds, count: 1 });
  }

  let bestWeekQuality: { weekStart: string; score: number } | null = null;
  for (const [weekStart, v] of weekDiscipline.entries()) {
    const base = v.sum / Math.max(v.count, 1);
    const withBonus = clamp100(Math.round(base + (reflectionWeeks.has(weekStart) ? 5 : 0)));
    if (!bestWeekQuality || withBonus > bestWeekQuality.score) {
      bestWeekQuality = { weekStart, score: withBonus };
    }
  }

  const thisWeekKey = toDayKey(startOfWeekMonday(new Date()));
  const thisWeekEntries = journal.filter((row) => {
    const key = dayKeyFromRow(row.entryDate, row.createdAt);
    return toDayKey(startOfWeekMonday(new Date(`${key}T12:00:00`))) === thisWeekKey;
  });
  const thisWeekBase = computeDisciplineScorePercent(thisWeekEntries);
  const thisWeekDisciplineScore =
    thisWeekBase === null
      ? null
      : clamp100(Math.round(thisWeekBase + (reflectionWeeks.has(thisWeekKey) ? 5 : 0)));

  const correlationHints: CorrelationStat[] = [];
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  if (calmPnl.length >= 3) correlationHints.push({ label: "Avg P&L on Calm days", sample: calmPnl.length, avgPnl: avg(calmPnl) });
  if (focusedPnl.length >= 3) correlationHints.push({ label: "Avg P&L on Focused days", sample: focusedPnl.length, avgPnl: avg(focusedPnl) });
  if (tiltedPnl.length >= 3) correlationHints.push({ label: "Avg P&L on Tilted days", sample: tiltedPnl.length, avgPnl: avg(tiltedPnl) });
  if (planTrue.length >= 3 && planFalse.length >= 3) {
    correlationHints.push({ label: "Avg P&L when Followed plan = true", sample: planTrue.length, avgPnl: avg(planTrue) });
    correlationHints.push({ label: "Avg P&L when Followed plan = false", sample: planFalse.length, avgPnl: avg(planFalse) });
  }

  const weekdayPerformance = weekdayOrder.map((weekday) => {
    const bucket = weekdayMap.get(weekday) ?? { sum: 0, count: 0 };
    return {
      weekday,
      totalPnl: bucket.sum,
      averagePnl: bucket.count > 0 ? bucket.sum / bucket.count : null,
      tradedDays: bucket.count,
    };
  });
  const weekdayWithTrades = weekdayPerformance.filter((w) => w.tradedDays > 0);
  const bestWeekday = weekdayWithTrades.length > 0
    ? weekdayWithTrades.reduce((a, b) => (b.totalPnl > a.totalPnl ? b : a)).weekday
    : null;
  const weakestWeekday = weekdayWithTrades.length > 0
    ? weekdayWithTrades.reduce((a, b) => (b.totalPnl < a.totalPnl ? b : a)).weekday
    : null;

  const symbolPerformance = [...symbolMap.entries()]
    .map(([symbol, value]) => ({
      symbol,
      totalPnl: value.sum,
      averagePnl: value.count > 0 ? value.sum / value.count : null,
      entries: value.count,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
  const bestSymbol = symbolPerformance.length > 0 ? symbolPerformance[0].symbol : null;
  const mostTradedSymbol = symbolPerformance.length > 0
    ? symbolPerformance.reduce((a, b) => (b.entries > a.entries ? b : a)).symbol
    : null;

  const setupPerformance = [...setupMap.entries()]
    .map(([setup, value]) => ({
      setup,
      totalPnl: value.sum,
      averagePnl: value.count > 0 ? value.sum / value.count : null,
      entries: value.count,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
  const bestSetup = setupPerformance.length > 0
    ? setupPerformance.reduce((a, b) => ((b.averagePnl ?? -Infinity) > (a.averagePnl ?? -Infinity) ? b : a)).setup
    : null;

  const mistakeRows = [...mistakeMap.entries()].filter(([mistake]) => mistake.toLowerCase() !== "none");
  const mostCommonMistake = mistakeRows.length > 0
    ? mistakeRows.reduce((a, b) => (b[1].count > a[1].count ? b : a))[0]
    : null;
  const mistakeCost = mistakeRows.length > 0
    ? mistakeRows.reduce((sum, [, value]) => sum + value.lossSum, 0)
    : null;

  const avgOrNull = (arr: number[]) => (arr.length > 0 ? arr.reduce((s, n) => s + n, 0) / arr.length : null);
  const stopRespectedAvg = avgOrNull(stopTrue);
  const stopNotRespectedAvg = avgOrNull(stopFalse);
  const noRevengeAvg = avgOrNull(noRevengeTrue);
  const revengeAvg = avgOrNull(noRevengeFalse);

  return {
    cumulative,
    dailyBars,
    weekly,
    winDays: wins,
    lossDays: losses,
    flatDays: flats,
    bestDay,
    worstDay,
    smallestGreenDay,
    avgGreenDay,
    avgRedDay,
    streakLabel,
    monthly,
    sessionPnl,
    avgDisciplineScore,
    thisWeekDisciplineScore,
    bestWeekQuality,
    moodBreakdown,
    correlationHints,
    winRateTrades,
    maxDrawdown: dailyBars.length > 0 ? maxDrawdown : null,
    profitFactor,
    weekdayPerformance,
    bestWeekday,
    weakestWeekday,
    symbolPerformance,
    bestSymbol,
    mostTradedSymbol,
    setupPerformance,
    bestSetup,
    mostCommonMistake,
    mistakeCost,
    stopRespectedAvg,
    stopNotRespectedAvg,
    noRevengeAvg,
    revengeAvg,
  };
}
