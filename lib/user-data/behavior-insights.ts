import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount, tradeWinRatePercent } from "@/lib/user-data/kpi";
import { summarizeDisciplineCoverage } from "@/lib/user-data/discipline-stats";

export type BehaviorInsight = { title: string; detail: string };

export type BehaviorInsightsResult = {
  insights: BehaviorInsight[];
  showEmptyState: boolean;
  emptyMessage: string;
  disciplineDataNote?: string;
};

export const BEHAVIOR_INSIGHT_MIN_TRADED_DAYS = 5;
export const BEHAVIOR_INSIGHT_MIN_ENTRIES = 10;
const MIN_INSIGHTS_WHEN_ELIGIBLE = 2;

type DailyAgg = { key: string; pnl: number };

type GetBehaviorInsightsParams = {
  entries: JournalRow[];
  activeAccountId?: string | null;
  timezone?: string | null;
  currency: string;
  maxItems?: number;
};

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

function aggregateDaily(entries: JournalRow[], timezone?: string | null): DailyAgg[] {
  const map = new Map<string, number>();
  for (const row of entries) {
    const key = rowDayKey(row, timezone);
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    map.set(key, (map.get(key) ?? 0) + pnl);
  }
  return [...map.entries()].map(([key, pnl]) => ({ key, pnl }));
}

function safeAvg(total: number, count: number): number | null {
  if (count <= 0) return null;
  const v = total / count;
  return Number.isFinite(v) ? v : null;
}

function meetsInsightThreshold(tradedDays: number, entryCount: number): boolean {
  return tradedDays >= BEHAVIOR_INSIGHT_MIN_TRADED_DAYS || entryCount >= BEHAVIOR_INSIGHT_MIN_ENTRIES;
}

function pushUnique(insights: BehaviorInsight[], insight: BehaviorInsight | null) {
  if (!insight) return;
  if (insights.some((item) => item.title === insight.title)) return;
  insights.push(insight);
}

function compareDiscipline(
  entries: JournalRow[],
  currency: string,
  title: string,
  yesLabel: string,
  noLabel: string,
  pick: (row: JournalRow) => boolean | undefined,
  minimumEdge = 5,
): BehaviorInsight | null {
  let yesTotal = 0;
  let yesCount = 0;
  let noTotal = 0;
  let noCount = 0;
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const picked = pick(row);
    if (picked === true) {
      yesTotal += pnl;
      yesCount += 1;
    } else if (picked === false) {
      noTotal += pnl;
      noCount += 1;
    }
  }
  if (yesCount < 2 || noCount < 2) return null;
  const yesAvg = yesTotal / yesCount;
  const noAvg = noTotal / noCount;
  if (!Number.isFinite(yesAvg) || !Number.isFinite(noAvg)) return null;
  if (yesAvg <= noAvg) return null;
  if (Math.abs(yesAvg - noAvg) < minimumEdge) return null;
  return {
    title,
    detail: `${yesLabel}: ${formatSignedPnlAmount(yesAvg, currency)} avg · ${noLabel}: ${formatSignedPnlAmount(noAvg, currency)} avg.`,
  };
}

function bestMoodInsight(
  entries: JournalRow[],
  currency: string,
): BehaviorInsight | null {
  const validMoods = new Set(["Calm", "Focused", "Hesitant", "Tilted"]);
  const moodBuckets = new Map<string, { total: number; count: number }>();
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const mood = row.moodState;
    if (!mood || !validMoods.has(mood)) continue;
    const prev = moodBuckets.get(mood) ?? { total: 0, count: 0 };
    moodBuckets.set(mood, { total: prev.total + pnl, count: prev.count + 1 });
  }
  const bestMood = [...moodBuckets.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([mood, v]) => ({ mood, avg: v.total / v.count, count: v.count }))
    .sort((a, b) => b.avg - a.avg)[0];
  if (!bestMood || !Number.isFinite(bestMood.avg)) return null;
  if (bestMood.avg <= 0) return null;
  return {
    title: `You trade best when you're ${bestMood.mood.toLowerCase()}`,
    detail: `About ${formatSignedPnlAmount(bestMood.avg, currency)} per entry across ${bestMood.count} logged trade${bestMood.count === 1 ? "" : "s"}.`,
  };
}

function revengeFreeStreakInsight(entries: JournalRow[], timezone?: string | null): BehaviorInsight | null {
  const byDay = new Map<string, { hasCheck: boolean; allTrue: boolean }>();
  for (const row of entries) {
    if (row.noRevengeTrade === undefined) continue;
    const key = rowDayKey(row, timezone);
    const prev = byDay.get(key) ?? { hasCheck: false, allTrue: true };
    byDay.set(key, {
      hasCheck: true,
      allTrue: prev.allTrue && row.noRevengeTrade,
    });
  }
  const orderedKeys = [...byDay.entries()]
    .filter(([, v]) => v.hasCheck)
    .map(([key]) => key)
    .sort((a, b) => b.localeCompare(a));
  if (orderedKeys.length < 3) return null;
  let revengeFreeStreak = 0;
  for (const key of orderedKeys) {
    if (byDay.get(key)?.allTrue) revengeFreeStreak += 1;
    else break;
  }
  if (revengeFreeStreak < 2) return null;
  return {
    title: "Revenge-free run",
    detail: `${revengeFreeStreak} day${revengeFreeStreak === 1 ? "" : "s"} in a row with no revenge trades logged.`,
  };
}

function bestWeekdayInsight(daily: DailyAgg[], currency: string): BehaviorInsight | null {
  const weekdayBuckets = new Map<string, { total: number; count: number }>();
  for (const d of daily) {
    const weekday = new Date(`${d.key}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short" });
    const prev = weekdayBuckets.get(weekday) ?? { total: 0, count: 0 };
    weekdayBuckets.set(weekday, { total: prev.total + d.pnl, count: prev.count + 1 });
  }
  const bestWeekday = [...weekdayBuckets.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([day, v]) => ({ day, total: v.total, count: v.count }))
    .sort((a, b) => b.total - a.total)[0];
  if (!bestWeekday || !Number.isFinite(bestWeekday.total) || bestWeekday.total <= 0) return null;
  return {
    title: `${bestWeekday.day} is your strongest day`,
    detail: `${formatSignedPnlAmount(bestWeekday.total, currency)} total across ${bestWeekday.count} day${bestWeekday.count === 1 ? "" : "s"}.`,
  };
}

function tagBucketInsight(
  entries: JournalRow[],
  currency: string,
  label: string,
  pickTag: (row: JournalRow) => string | undefined,
  minCount = 3,
  skip?: (tag: string) => boolean,
): BehaviorInsight | null {
  const buckets = new Map<string, { total: number; count: number }>();
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const tag = pickTag(row)?.trim();
    if (!tag || (skip?.(tag) ?? false)) continue;
    const prev = buckets.get(tag) ?? { total: 0, count: 0 };
    buckets.set(tag, { total: prev.total + pnl, count: prev.count + 1 });
  }
  const best = [...buckets.entries()]
    .filter(([, v]) => v.count >= minCount)
    .map(([tag, v]) => ({ tag, avg: v.total / v.count, count: v.count }))
    .sort((a, b) => b.avg - a.avg)[0];
  if (!best || !Number.isFinite(best.avg)) return null;
  return {
    title: `${label}: ${best.tag}`,
    detail: `${formatSignedPnlAmount(best.avg, currency)} avg per entry across ${best.count} trade${best.count === 1 ? "" : "s"}.`,
  };
}

function greenRedDayInsight(daily: DailyAgg[], currency: string): BehaviorInsight | null {
  const greens = daily.filter((d) => d.pnl > 0);
  const reds = daily.filter((d) => d.pnl < 0);
  if (greens.length < 2 || reds.length < 2) return null;
  const avgGreen = safeAvg(
    greens.reduce((s, d) => s + d.pnl, 0),
    greens.length,
  );
  const avgRed = safeAvg(
    reds.reduce((s, d) => s + d.pnl, 0),
    reds.length,
  );
  if (avgGreen === null || avgRed === null) return null;
  return {
    title: "Green days vs red days",
    detail: `Avg green day ${formatSignedPnlAmount(avgGreen, currency)} · avg red day ${formatSignedPnlAmount(avgRed, currency)} (${greens.length} green · ${reds.length} red).`,
  };
}

function activitySnapshotInsight(
  tradedDays: number,
  entryCount: number,
  winRate: number | null,
): BehaviorInsight | null {
  if (tradedDays < BEHAVIOR_INSIGHT_MIN_TRADED_DAYS && entryCount < BEHAVIOR_INSIGHT_MIN_ENTRIES) return null;
  const winRatePart =
    winRate !== null && Number.isFinite(winRate) ? `${winRate}% trade win rate` : "win rate needs more +/− trades";
  return {
    title: `${tradedDays} traded day${tradedDays === 1 ? "" : "s"} in view`,
    detail: `${entryCount} journal ${entryCount === 1 ? "entry" : "entries"} · ${winRatePart}.`,
  };
}

function symbolInsight(entries: JournalRow[], currency: string): BehaviorInsight | null {
  return tagBucketInsight(
    entries,
    currency,
    "Strongest symbol",
    (row) => (row.sym?.trim() ? row.sym.trim().toUpperCase() : undefined),
    3,
    (sym) => sym === "—" || sym === "-",
  );
}

function mistakeInsight(entries: JournalRow[], currency: string): BehaviorInsight | null {
  const buckets = new Map<string, { total: number; count: number }>();
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const tag = row.tag?.trim();
    if (!tag || tag === "None" || tag === "—" || tag === "Manual") continue;
    const prev = buckets.get(tag) ?? { total: 0, count: 0 };
    buckets.set(tag, { total: prev.total + pnl, count: prev.count + 1 });
  }
  const worst = [...buckets.entries()]
    .filter(([, v]) => v.count >= 2)
    .map(([tag, v]) => ({ tag, avg: v.total / v.count, count: v.count }))
    .sort((a, b) => a.avg - b.avg)[0];
  if (!worst || !Number.isFinite(worst.avg) || worst.avg >= 0) return null;
  return {
    title: `Mistake tag to watch: ${worst.tag}`,
    detail: `${formatSignedPnlAmount(worst.avg, currency)} avg per entry across ${worst.count} trade${worst.count === 1 ? "" : "s"}.`,
  };
}

export function getBehaviorInsights({
  entries,
  activeAccountId,
  timezone,
  currency,
  maxItems = 5,
}: GetBehaviorInsightsParams): BehaviorInsightsResult {
  void activeAccountId;
  const emptyMessage = "Log a few more trading days to unlock behavior insights.";
  if (entries.length === 0) {
    return { insights: [], showEmptyState: true, emptyMessage };
  }

  const daily = aggregateDaily(entries, timezone);
  const tradedDays = daily.length;
  const entryCount = entries.length;
  const disciplineCoverage = summarizeDisciplineCoverage(entries);
  const disciplineDataNote =
    disciplineCoverage.entriesTotal >= 5 && disciplineCoverage.checksRecorded === 0
      ? "Most entries are missing discipline checks."
      : disciplineCoverage.entriesTotal >= 5 &&
          disciplineCoverage.entriesWithChecks / disciplineCoverage.entriesTotal <
            0.5
        ? "Most entries are missing discipline checks."
        : undefined;

  if (!meetsInsightThreshold(tradedDays, entryCount)) {
    return {
      insights: [],
      showEmptyState: true,
      emptyMessage,
      disciplineDataNote,
    };
  }

  const insights: BehaviorInsight[] = [];
  const winRate = tradeWinRatePercent(entries);

  pushUnique(insights, bestMoodInsight(entries, currency));
  pushUnique(
    insights,
    compareDiscipline(entries, currency, "Following your plan lifts results", "Plan followed", "Plan missed", (r) =>
      r.followedPlan === undefined ? undefined : r.followedPlan,
    ),
  );
  pushUnique(
    insights,
    compareDiscipline(entries, currency, "Respecting your stop pays off", "Stop respected", "Stop broken", (r) =>
      r.respectedStop === undefined ? undefined : r.respectedStop,
    ),
  );
  pushUnique(
    insights,
    compareDiscipline(entries, currency, "Staying revenge-free helps", "No revenge", "Revenge taken", (r) =>
      r.noRevengeTrade === undefined ? undefined : r.noRevengeTrade,
    ),
  );
  pushUnique(insights, revengeFreeStreakInsight(entries, timezone));
  pushUnique(insights, bestWeekdayInsight(daily, currency));
  pushUnique(insights, symbolInsight(entries, currency));
  pushUnique(
    insights,
    tagBucketInsight(entries, currency, "Best setup", (row) => row.setup, 3, (tag) => tag === "—"),
  );
  pushUnique(
    insights,
    mistakeInsight(entries, currency),
  );
  pushUnique(
    insights,
    tagBucketInsight(entries, currency, "Best session", (row) => row.sessionTag, 3, (tag) => tag === "Other"),
  );
  pushUnique(
    insights,
    tagBucketInsight(entries, currency, "Best market condition", (row) => row.marketCondition, 3, (tag) => tag === "Other"),
  );
  pushUnique(insights, greenRedDayInsight(daily, currency));
  pushUnique(insights, activitySnapshotInsight(tradedDays, entryCount, winRate));

  while (insights.length < MIN_INSIGHTS_WHEN_ELIGIBLE) {
    const before = insights.length;
    pushUnique(insights, activitySnapshotInsight(tradedDays, entryCount, winRate));
    pushUnique(insights, greenRedDayInsight(daily, currency));
    pushUnique(insights, bestWeekdayInsight(daily, currency));
    if (insights.length === before) break;
  }

  const sliced = insights.slice(0, maxItems);
  return {
    insights: sliced,
    showEmptyState: sliced.length === 0,
    emptyMessage:
      sliced.length === 0
        ? "Add mood, tags, or discipline checks on more entries to surface patterns."
        : emptyMessage,
    disciplineDataNote,
  };
}
