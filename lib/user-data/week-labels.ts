import { startOfWeekMonday, toDayKey } from "@/lib/user-data/journal-metrics";

/** ISO-style week number (Monday-based week containing the date). */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function isoWeekNumberFromDayKey(weekStartKey: string): number {
  return isoWeekNumber(new Date(`${weekStartKey}T12:00:00`));
}

export function formatWeekRangeFromDayKey(weekStartKey: string): string {
  const start = new Date(`${weekStartKey}T12:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  if (start.getMonth() === end.getMonth()) {
    const month = start.toLocaleDateString(undefined, { month: "short" });
    return `${month} ${start.getDate()}–${end.getDate()}`;
  }
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

/** e.g. "Week 20" */
export function formatWeekTitle(weekStartKey: string): string {
  return `Week ${isoWeekNumberFromDayKey(weekStartKey)}`;
}

/** e.g. "Week 20 · May 11–17" */
export function formatWeekHeadline(weekStartKey: string): string {
  return `${formatWeekTitle(weekStartKey)} · ${formatWeekRangeFromDayKey(weekStartKey)}`;
}

export function formatWeekRangeFromDates(weekDays: { date: Date }[], variant: "compact" | "full" = "full"): string {
  const weekStartKey = toDayKey(startOfWeekMonday(weekDays[0]!.date));
  if (variant === "compact") {
    return formatWeekHeadline(weekStartKey);
  }
  return formatWeekRangeFromDayKey(weekStartKey);
}
