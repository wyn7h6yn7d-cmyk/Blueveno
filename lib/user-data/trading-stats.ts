import type { ForexSessionLabel } from "@/lib/trading-session";
import { primaryForexSessionUTC } from "@/lib/trading-session";
import type { JournalRow } from "@/lib/user-data/types";
import { journalEntryMoment } from "@/lib/user-data/journal-entry-time";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { dayKeyFromRow, startOfWeekMonday, toDayKey } from "@/lib/user-data/journal-metrics";

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

export type TradingStatsSnapshot = {
  cumulative: CumulativePoint[];
  dailyBars: DailyBar[];
  weekly: WeeklyPoint[];
  winDays: number;
  lossDays: number;
  flatDays: number;
  bestDay: { date: string; pnl: number } | null;
  worstDay: { date: string; pnl: number } | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  streakLabel: string;
  monthly: MonthlyBlock[];
  /** P&L by FX session (UTC windows), one bucket per entry */
  sessionPnl: SessionPnlRow[];
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

function computeSessionPnlBreakdown(journal: JournalRow[]): SessionPnlRow[] {
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

/** Aggregate P&L by calendar day (multiple rows same day sum). */
export function computeTradingStats(journal: JournalRow[]): TradingStatsSnapshot {
  const dayMap = new Map<string, number>();
  for (const row of journal) {
    const key = dayKeyFromRow(row.entryDate, row.createdAt);
    const p = parsePnlAmount(row.r);
    if (p === null) continue;
    dayMap.set(key, (dayMap.get(key) ?? 0) + p);
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
  for (const d of dailyBars) {
    const base = new Date(`${d.date}T12:00:00`);
    const ws = startOfWeekMonday(base);
    const wk = toDayKey(ws);
    weekMap.set(wk, (weekMap.get(wk) ?? 0) + d.pnl);
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

  let bestDay: { date: string; pnl: number } | null = null;
  let worstDay: { date: string; pnl: number } | null = null;
  for (const d of dailyBars) {
    if (!bestDay || d.pnl > bestDay.pnl) bestDay = { date: d.date, pnl: d.pnl };
    if (!worstDay || d.pnl < worstDay.pnl) worstDay = { date: d.date, pnl: d.pnl };
  }

  const avgGreenDay = greens.length ? greens.reduce((a, b) => a + b, 0) / greens.length : null;
  const avgRedDay = reds.length ? reds.reduce((a, b) => a + b, 0) / reds.length : null;

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

  return {
    cumulative,
    dailyBars,
    weekly,
    winDays: wins,
    lossDays: losses,
    flatDays: flats,
    bestDay,
    worstDay,
    avgGreenDay,
    avgRedDay,
    streakLabel,
    monthly,
    sessionPnl,
  };
}
