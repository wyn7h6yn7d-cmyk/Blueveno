import type { JournalRow } from "@/lib/user-data/types";
import { parsePnlAmount } from "@/lib/user-data/kpi";

export type DayPnlRow = { date: string; pnl: number };

export function safeNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  return value;
}

export function pickBestDay(rows: DayPnlRow[]): DayPnlRow | null {
  if (rows.length === 0) return null;
  return rows.reduce((a, b) => {
    if (b.pnl > a.pnl) return b;
    if (b.pnl === a.pnl && b.date > a.date) return b;
    return a;
  });
}

export function pickWorstLossDay(rows: DayPnlRow[]): DayPnlRow | null {
  const losses = rows.filter((d) => d.pnl < 0);
  if (losses.length === 0) return null;
  return losses.reduce((a, b) => (b.pnl < a.pnl ? b : a));
}

export function pickSmallestGreenDay(rows: DayPnlRow[]): DayPnlRow | null {
  const greens = rows.filter((d) => d.pnl > 0);
  if (greens.length === 0) return null;
  return greens.reduce((a, b) => (b.pnl < a.pnl ? b : a));
}

export function worstDayLabel(rows: DayPnlRow[]): "Worst day" | "Smallest green day" {
  return pickWorstLossDay(rows) ? "Worst day" : "Smallest green day";
}

export function pickWorstOrSmallestGreenDay(
  rows: DayPnlRow[],
): { date: string; pnl: number; label: "Worst day" | "Smallest green day" } | null {
  const worst = pickWorstLossDay(rows);
  if (worst) return { ...worst, label: "Worst day" };
  const smallest = pickSmallestGreenDay(rows);
  if (smallest) return { ...smallest, label: "Smallest green day" };
  return null;
}

/** Count of discipline checks marked true for display (e.g. 2/3). */
export function entryDisciplineFraction(row: JournalRow): string {
  const checks = [row.followedPlan, row.respectedStop, row.noRevengeTrade].filter((v) => v !== undefined);
  if (checks.length === 0) return "—";
  const done = checks.filter(Boolean).length;
  return `${done}/${checks.length}`;
}

export function monthKeyFromRow(row: JournalRow, dayKey: string): string {
  if (row.entryDate && /^\d{4}-\d{2}-\d{2}$/.test(row.entryDate)) return row.entryDate.slice(0, 7);
  return dayKey.slice(0, 7);
}

export function pickMonthKeyFromEntries(
  entries: JournalRow[],
  dayKeyForRow: (row: JournalRow) => string,
  preferredMonthKey?: string,
): string {
  if (preferredMonthKey && /^\d{4}-\d{2}$/.test(preferredMonthKey)) return preferredMonthKey;
  const keys = entries
    .map((row) => {
      const day = dayKeyForRow(row);
      return day.length >= 7 ? day.slice(0, 7) : "";
    })
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));
  if (keys[0]) return keys[0];
  return new Date().toISOString().slice(0, 7);
}
