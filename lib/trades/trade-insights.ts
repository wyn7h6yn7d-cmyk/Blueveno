import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { dayKeyFromRow, startOfWeekMonday, toDayKey } from "@/lib/user-data/journal-metrics";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";
import { formatWeekHeadline } from "@/lib/user-data/week-labels";

export type WeeklyReflectionContext = {
  weekStart: string;
  weekLabel: string;
  whatWorked: string | null;
  whatSlipped: string | null;
  nextWeekFocus: string | null;
  nextWeekRule: string | null;
  confidenceScore: number | null;
};

export type TradeComparisonInsight = {
  id: string;
  title: string;
  body: string;
};

function weekStartForEntry(row: JournalRow): string {
  const dayKey = dayKeyFromRow(row.entryDate, row.createdAt);
  return toDayKey(startOfWeekMonday(new Date(`${dayKey}T12:00:00`)));
}

function avgPnls(rows: JournalRow[]): number | null {
  const values = rows.map((r) => parsePnlAmount(r.r)).filter((n): n is number => n !== null);
  if (values.length === 0) return null;
  return values.reduce((s, n) => s + n, 0) / values.length;
}

export function buildTradeComparisonInsight(
  row: JournalRow,
  siblings: JournalRow[],
  currency: string,
): TradeComparisonInsight | null {
  const pnl = parsePnlAmount(row.r);
  if (pnl === null) return null;

  const setup = String(row.setup ?? "").trim();
  if (setup && setup !== "—") {
    const sameSetup = siblings.filter((r) => r.id !== row.id && String(r.setup ?? "").trim() === setup);
    const avg = avgPnls(sameSetup);
    if (avg !== null && sameSetup.length >= 2) {
      const delta = pnl - avg;
      return {
        id: "setup-compare",
        title: "Setup comparison",
        body: `This ${setup} entry is ${formatSignedPnlAmount(delta, currency)} vs your ${setup} average (${formatSignedPnlAmount(avg, currency)}).`,
      };
    }
  }

  const mood = row.moodState;
  if (mood) {
    const sameMood = siblings.filter((r) => r.id !== row.id && r.moodState === mood);
    const avg = avgPnls(sameMood);
    if (avg !== null && sameMood.length >= 2) {
      const delta = pnl - avg;
      return {
        id: "mood-compare",
        title: "Mindset comparison",
        body: `While ${mood}, this entry is ${formatSignedPnlAmount(delta, currency)} vs your ${mood} average.`,
      };
    }
  }

  return null;
}

export function findWeeklyReflectionForEntry(
  row: JournalRow,
  reflections: Array<{
    week_start: string;
    what_worked?: string | null;
    what_slipped?: string | null;
    next_week_focus?: string | null;
    next_week_rule?: string | null;
    confidence_score?: number | null;
  }>,
): WeeklyReflectionContext | null {
  const weekStart = weekStartForEntry(row);
  const match = reflections.find((r) => r.week_start === weekStart);
  if (!match) return null;
  return {
    weekStart,
    weekLabel: formatWeekHeadline(weekStart),
    whatWorked: match.what_worked ?? null,
    whatSlipped: match.what_slipped ?? null,
    nextWeekFocus: match.next_week_focus ?? null,
    nextWeekRule: match.next_week_rule ?? null,
    confidenceScore: match.confidence_score ?? null,
  };
}
