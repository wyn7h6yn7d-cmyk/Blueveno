"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  entries: JournalRow[];
  displayCurrency: string;
  weeklyReflections?: WeeklyReflectionSummary[];
  filterControls?: ReactNode;
};

type DayCell = {
  key: string;
  date: Date;
  inMonth: boolean;
};

type DayAggregate = {
  total: number;
  latestEntryId: string | null;
  count: number;
  latestNote: string | null;
  hasChartLink: boolean;
};

type WeeklyReflectionSummary = {
  weekStart: string;
  accountId?: string | null;
  whatWorked: string | null;
  whatSlipped: string | null;
  nextWeekFocus: string | null;
  nextWeekRule?: string | null;
  confidenceScore?: number | null;
};

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Weekend"] as const;

type DisplayCell = {
  key: string;
  inMonth: boolean;
  label: string;
  sourceKeys: string[];
  dateKeyForLink: string | null;
  isWeekend: boolean;
};

function monthStartMonday(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function keyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfGridMonth(month: Date): Date {
  const first = monthStartMonday(month);
  const day = (first.getDay() + 6) % 7;
  return addDays(first, -day);
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

/** Day cell: green / red / neutral — strong, readable states */
function dayCellClasses(total: number, hasData: boolean, inMonth: boolean): string {
  if (!hasData) {
    return cn(
      "border border-white/[0.08] bg-[linear-gradient(165deg,oklch(0.11_0.028_264/0.58),oklch(0.07_0.022_268/0.54))] text-zinc-600",
      !inMonth && "opacity-38",
    );
  }
  if (total > 0) {
    return cn(
      "border border-emerald-400/58 bg-[linear-gradient(155deg,oklch(0.29_0.11_155/0.62),oklch(0.13_0.06_160/0.5))] text-emerald-50",
      "shadow-[inset_0_1px_0_0_oklch(0.9_0.08_155/0.24),0_0_0_1px_oklch(0.5_0.14_155/0.16)]",
      !inMonth && "opacity-58",
    );
  }
  if (total < 0) {
    return cn(
      "border border-rose-400/56 bg-[linear-gradient(155deg,oklch(0.31_0.11_18/0.6),oklch(0.13_0.06_22/0.5))] text-rose-50",
      "shadow-[inset_0_1px_0_0_oklch(0.92_0.07_15/0.16),0_0_0_1px_oklch(0.5_0.15_15/0.14)]",
      !inMonth && "opacity-58",
    );
  }
  return cn("border border-white/[0.14] bg-white/[0.06] text-zinc-300", !inMonth && "opacity-48");
}

function weekRailClasses(total: number): string {
  if (total > 0) {
    return cn(
      "border border-emerald-400/45 bg-[linear-gradient(160deg,oklch(0.24_0.09_155/0.55),oklch(0.1_0.04_160/0.48))] text-emerald-50",
      "shadow-[inset_0_1px_0_0_oklch(0.88_0.08_155/0.18),0_0_0_1px_oklch(0.42_0.14_155/0.15)]",
    );
  }
  if (total < 0) {
    return cn(
      "border border-rose-400/42 bg-[linear-gradient(160deg,oklch(0.26_0.08_15/0.5),oklch(0.11_0.04_18/0.42))] text-rose-50",
      "shadow-[inset_0_1px_0_0_oklch(0.9_0.05_15/0.12),0_0_0_1px_oklch(0.42_0.14_15/0.12)]",
    );
  }
  return "border border-white/[0.14] bg-[linear-gradient(165deg,oklch(0.14_0.04_262/0.65),oklch(0.09_0.03_266/0.58))] text-zinc-300";
}

function weekAccent(total: number): string {
  if (total > 0) return "bg-emerald-400/80";
  if (total < 0) return "bg-rose-400/80";
  return "bg-zinc-500/50";
}

function weekNumber(weekStart: Date): number {
  const date = new Date(Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function weekDateRangeLabel(week: DayCell[]): string {
  const start = week[0].date.getDate();
  const end = week[6].date.getDate();
  return `${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")}`;
}

function startOfWeekMonday(date: Date): Date {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

function weekSummaryFromReflection(reflection?: WeeklyReflectionSummary): string | null {
  if (!reflection) return null;
  const pick = [reflection.nextWeekFocus, reflection.nextWeekRule, reflection.whatWorked, reflection.whatSlipped]
    .map((value) => value?.trim() ?? "")
    .find((value) => value.length > 0);
  return pick ?? null;
}

function weekReflectionLines(reflection?: WeeklyReflectionSummary): { label: string; value: string }[] {
  if (!reflection) return [];
  const rows = [
    { label: "Worked", value: reflection.whatWorked?.trim() ?? "" },
    { label: "Slipped", value: reflection.whatSlipped?.trim() ?? "" },
    { label: "Focus for next week", value: reflection.nextWeekFocus?.trim() ?? "" },
  ].filter((row) => row.value.length > 0);
  return rows;
}

function weekQualityScore(week: DayCell[], aggregates: Map<string, DayAggregate>): number {
  let green = 0;
  let red = 0;
  let active = 0;
  for (const day of week) {
    const total = aggregates.get(day.key)?.total ?? 0;
    if (total === 0) continue;
    active += 1;
    if (total > 0) green += 1;
    if (total < 0) red += 1;
  }
  if (active === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((green / active) * 100 - red * 4)));
}

function reflectionStatus(rows: { label: string; value: string }[]): { label: string; tone: string } {
  if (rows.length >= 3) return { label: "Reflection saved", tone: "text-emerald-200" };
  if (rows.length > 0) return { label: "In progress", tone: "text-amber-200" };
  return { label: "Review ready", tone: "text-zinc-400" };
}

export function PnlCalendar({ entries, displayCurrency, weeklyReflections = [], filterControls = null }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(() => keyFromDate(new Date()));
  const todayKey = useMemo(() => keyFromDate(new Date()), []);

  const aggregates = useMemo(() => {
    const map = new Map<string, DayAggregate>();
    for (const row of entries) {
      const key = row.entryDate ?? keyFromDate(row.createdAt ? new Date(row.createdAt) : new Date());
      const val = parsePnlAmount(row.r) ?? 0;
      const rowNote = row.note?.trim() ? row.note.trim() : null;
      const hasChart = Boolean(row.chartLinkUrl);
      const prev = map.get(key);
      if (!prev) {
        map.set(key, { total: val, latestEntryId: row.id, count: 1, latestNote: rowNote, hasChartLink: hasChart });
        continue;
      }
      map.set(key, {
        total: prev.total + val,
        latestEntryId: prev.latestEntryId ?? row.id,
        count: prev.count + 1,
        latestNote: prev.latestNote ?? rowNote,
        hasChartLink: prev.hasChartLink || hasChart,
      });
    }
    return map;
  }, [entries]);

  const weeks = useMemo(() => {
    const start = startOfGridMonth(cursor);
    const out: DayCell[][] = [];
    for (let w = 0; w < 6; w += 1) {
      const week: DayCell[] = [];
      for (let d = 0; d < 7; d += 1) {
        const date = addDays(start, w * 7 + d);
        week.push({
          key: keyFromDate(date),
          date,
          inMonth: date.getMonth() === cursor.getMonth(),
        });
      }
      out.push(week);
    }
    return out;
  }, [cursor]);

  const monthSummary = useMemo(() => {
    const monthIndex = cursor.getMonth();
    const year = cursor.getFullYear();
    const monthEntries = entries.filter((row) => {
      const d = row.entryDate ? new Date(`${row.entryDate}T12:00:00`) : row.createdAt ? new Date(row.createdAt) : null;
      if (!d || Number.isNaN(d.getTime())) return false;
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    });

    const dayTotals = new Map<string, number>();
    let checksDone = 0;
    let checksTotal = 0;
    for (const row of monthEntries) {
      const key = row.entryDate ?? keyFromDate(row.createdAt ? new Date(row.createdAt) : new Date());
      const pnl = parsePnlAmount(row.r) ?? 0;
      dayTotals.set(key, (dayTotals.get(key) ?? 0) + pnl);
      checksTotal += 3;
      if (row.followedPlan) checksDone += 1;
      if (row.respectedStop) checksDone += 1;
      if (row.noRevengeTrade) checksDone += 1;
    }

    const tradedDays = dayTotals.size;
    const dayValues = [...dayTotals.values()];
    const monthPnl = dayValues.reduce((sum, value) => sum + value, 0);
    const winDays = dayValues.filter((value) => value > 0).length;
    const winRate = tradedDays > 0 ? Math.round((winDays / tradedDays) * 100) : null;
    const disciplineScore = checksTotal > 0 ? Math.round((checksDone / checksTotal) * 100) : null;

    const weekTotals = new Map<string, number>();
    for (const [dayKey, total] of dayTotals.entries()) {
      const ws = keyFromDate(startOfWeekMonday(new Date(`${dayKey}T12:00:00`)));
      weekTotals.set(ws, (weekTotals.get(ws) ?? 0) + total);
    }
    const weekRows = [...weekTotals.entries()].map(([weekStart, total]) => ({ weekStart, total }));
    const bestWeek = weekRows.length > 0 ? weekRows.reduce((a, b) => (b.total > a.total ? b : a)) : null;
    const weakestWeek = weekRows.length > 0 ? weekRows.reduce((a, b) => (b.total < a.total ? b : a)) : null;

    return { tradedDays, monthPnl, winRate, bestWeek, weakestWeek, disciplineScore };
  }, [cursor, entries]);

  const weeklyReflectionsByWeekStart = useMemo(() => {
    const map = new Map<string, WeeklyReflectionSummary>();
    for (const reflection of weeklyReflections) {
      map.set(reflection.weekStart, reflection);
    }
    return map;
  }, [weeklyReflections]);

  /** Mobile: 6 day columns only. Week rail appears from sm+. */
  const calendarGridCols = cn(
    "[grid-template-columns:repeat(6,minmax(0,1fr))]",
    "sm:[grid-template-columns:repeat(6,minmax(0,1fr))_minmax(11rem,14rem)]",
    "lg:[grid-template-columns:repeat(6,minmax(0,1fr))_minmax(12.75rem,16.5rem)]",
    "xl:[grid-template-columns:repeat(6,minmax(0,1fr))_minmax(13.5rem,18rem)]",
  );

  const headerBox =
    "flex min-h-[2.55rem] items-center justify-center rounded-lg border border-white/[0.12] bg-black/40 px-0.5 py-1.5 text-center shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:min-h-[3.4rem] sm:rounded-xl sm:px-1 sm:py-2.5";

  return (
    <div className="min-w-0 space-y-6">
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[oklch(0.52_0.12_252/0.22)] bg-[linear-gradient(168deg,oklch(0.12_0.04_262/0.85),oklch(0.07_0.03_266/0.88))] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:gap-4 sm:rounded-2xl sm:p-6",
        )}
      >
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[oklch(0.65_0.11_252)]">Month</p>
          <p className="font-display text-[1.35rem] font-semibold tracking-[-0.04em] text-zinc-50 sm:text-[2rem] lg:text-[2.15rem]">
            {monthLabel(cursor)}
          </p>
        </div>
        <div className="w-full max-w-full space-y-2 sm:w-auto sm:min-w-[18rem]">
          <div className="flex items-center justify-end gap-1.5 rounded-xl border border-white/[0.1] bg-black/40 p-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]">
            <button
              type="button"
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "h-9 w-9 rounded-lg border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.1] sm:h-10 sm:w-10",
              )}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon-sm" }),
                "h-9 w-9 rounded-lg border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.1] sm:h-10 sm:w-10",
              )}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          {filterControls}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6" aria-label="Month summary">
        {[
          { label: "Month P&L", value: monthSummary.tradedDays > 0 ? formatSignedPnlAmount(monthSummary.monthPnl, displayCurrency) : "—", tone: monthSummary.monthPnl },
          { label: "Win rate", value: monthSummary.winRate !== null ? `${monthSummary.winRate}%` : "—", tone: 0 },
          { label: "Traded days", value: String(monthSummary.tradedDays), tone: 0 },
          {
            label: "Best week",
            value: monthSummary.bestWeek ? formatSignedPnlAmount(monthSummary.bestWeek.total, displayCurrency) : "—",
            tone: monthSummary.bestWeek?.total ?? 0,
          },
          {
            label: "Weakest week",
            value: monthSummary.weakestWeek ? formatSignedPnlAmount(monthSummary.weakestWeek.total, displayCurrency) : "—",
            tone: monthSummary.weakestWeek?.total ?? 0,
          },
          { label: "Discipline score", value: monthSummary.disciplineScore !== null ? `${monthSummary.disciplineScore}%` : "—", tone: 0 },
        ].map((item) => (
          <div
            key={item.label}
            className="flex min-h-[5rem] flex-col justify-between rounded-xl border border-white/[0.08] bg-[linear-gradient(160deg,oklch(0.13_0.03_262/0.9),oklch(0.085_0.026_266/0.9))] px-3.5 py-3"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{item.label}</p>
            <p
              className={cn(
                "mt-1.5 font-display text-[1rem] tabular-nums tracking-[-0.02em]",
                item.tone > 0 && "text-emerald-200",
                item.tone < 0 && "text-rose-200",
                item.tone === 0 && "text-zinc-100",
              )}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {monthSummary.tradedDays === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-zinc-500">
          Your month will fill as you log trading days.
        </div>
      ) : null}

      <div className="w-full min-w-0 overflow-x-auto overflow-y-visible pb-1 [-webkit-overflow-scrolling:touch]">
        <div className="flex w-full min-w-0 justify-center sm:justify-center xl:justify-start">
          <div
            className={cn(
              "w-full min-w-0 max-w-full sm:max-w-none",
              "rounded-xl border border-[oklch(0.52_0.12_252/0.32)] sm:rounded-[1.35rem]",
              "bg-[linear-gradient(168deg,oklch(0.12_0.036_262/0.98),oklch(0.065_0.03_264/0.97))]",
              "p-2.5 shadow-[inset_0_1px_0_oklch(1_0_0_/0.06),0_36px_110px_-44px_rgba(0,0,0,0.74)] sm:p-4.5 lg:p-6",
            )}
          >
            <div
              className={cn(
                "rounded-lg border border-white/[0.08] bg-black/25 p-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)] sm:rounded-xl sm:p-3 lg:p-3.5",
              )}
            >
              <div
                className={cn(
                  "grid min-w-0 w-full gap-1.5 sm:gap-3 lg:gap-3.5",
                  calendarGridCols,
                )}
              >
            {WEEKDAY_HEADERS.map((d) => (
              <div
                key={d}
                className={cn(
                  headerBox,
                  "min-w-0 font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-400 sm:text-[10px] sm:tracking-[0.18em]",
                )}
              >
                <span className="sm:hidden">{d === "Weekend" ? "WE" : d.slice(0, 1)}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
            <div
              className={cn(
                headerBox,
                "hidden min-w-0 font-mono text-[8px] uppercase tracking-[0.12em] text-[oklch(0.78_0.12_252)] sm:flex sm:text-[10px] sm:tracking-[0.18em] lg:text-[11px]",
              )}
            >
              <span className="sm:hidden">Σ</span>
              <span className="hidden sm:inline">Week</span>
            </div>

            {weeks.map((week, i) => {
              const weekly = week.reduce((acc, day) => {
                const agg = aggregates.get(day.key);
                return acc + (agg?.total ?? 0);
              }, 0);
              const displayCells: DisplayCell[] = [
                ...week.slice(0, 5).map((day) => ({
                  key: day.key,
                  inMonth: day.inMonth,
                  label: String(day.date.getDate()),
                  sourceKeys: [day.key],
                  dateKeyForLink: day.key,
                  isWeekend: false,
                })),
                {
                  key: `weekend-${week[5]!.key}`,
                  inMonth: week[5]!.inMonth || week[6]!.inMonth,
                  label: "Weekend",
                  sourceKeys: [week[5]!.key, week[6]!.key],
                  dateKeyForLink: null,
                  isWeekend: true,
                },
              ];
              const weekStartKey = keyFromDate(startOfWeekMonday(week[0].date));
              const weeklyReflection = weeklyReflectionsByWeekStart.get(weekStartKey);
              const weeklySummary = weekSummaryFromReflection(weeklyReflection);
              const weeklyReflectionRows = weekReflectionLines(weeklyReflection);

              return (
                <Fragment key={`week-row-${i}`}>
                  {displayCells.map((cell) => {
                    const aggregateRows = cell.sourceKeys.map((k) => aggregates.get(k)).filter(Boolean) as DayAggregate[];
                    const total = aggregateRows.reduce((sum, row) => sum + row.total, 0);
                    const count = aggregateRows.reduce((sum, row) => sum + row.count, 0);
                    const latestEntryId = aggregateRows[aggregateRows.length - 1]?.latestEntryId ?? null;
                    const notePreview = aggregateRows.find((row) => row.latestNote)?.latestNote ?? null;
                    const hasChartLink = aggregateRows.some((row) => row.hasChartLink);
                    const hasData = count > 0;
                    const cellClasses = dayCellClasses(total, hasData, cell.inMonth);
                    const isSelected = cell.key === selectedDayKey;
                    const isToday = cell.sourceKeys.includes(todayKey);

                    const hrefForDay = hasData
                      ? count === 1 && latestEntryId
                        ? `/app/journal/${latestEntryId}`
                        : cell.isWeekend
                          ? "/app/journal"
                          : `/app/journal?date=${encodeURIComponent(cell.dateKeyForLink ?? "")}`
                      : null;

                    const content = (
                      <div
                        className={cn(
                          "group relative box-border flex h-full min-h-[82px] min-w-0 flex-col justify-between overflow-hidden rounded-lg p-2 transition duration-200 sm:min-h-[188px] sm:rounded-xl sm:p-4.5 lg:min-h-[206px] lg:p-5",
                          cellClasses,
                          cell.isWeekend && !hasData && "border-white/[0.06] bg-[linear-gradient(160deg,oklch(0.105_0.024_264/0.5),oklch(0.07_0.02_268/0.45))] text-zinc-600",
                          isSelected &&
                            "ring-2 ring-[oklch(0.72_0.14_252/0.72)] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08),0_0_0_1px_oklch(0.72_0.14_252/0.5)]",
                          hasData && "hover:brightness-[1.05] hover:ring-2 hover:ring-[oklch(0.58_0.12_252/0.5)]",
                        )}
                      >
                        <div className="flex min-w-0 flex-col items-stretch gap-0.5 self-stretch">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={cn(
                                "font-mono text-[10px] tabular-nums sm:text-[12px]",
                                hasData
                                  ? "text-white/90"
                                  : cell.inMonth
                                    ? "text-zinc-300"
                                    : "text-zinc-500",
                              )}
                            >
                              {cell.label}
                            </span>
                            {isToday ? (
                              <span className="rounded-full border border-[oklch(0.72_0.14_252/0.55)] bg-[oklch(0.72_0.14_252/0.18)] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[oklch(0.84_0.1_252)]">
                                Today
                              </span>
                            ) : null}
                          </div>
                          {hasChartLink ? (
                            <span className="w-fit max-w-full truncate rounded border border-[oklch(0.58_0.12_252/0.35)] bg-[oklch(0.58_0.12_252/0.15)] px-1 py-0.5 font-mono text-[7px] text-zinc-200 sm:px-1.5 sm:text-[9px]">
                              Linked chart
                            </span>
                          ) : null}
                          {hasData && count > 1 ? (
                            <span className="w-fit max-w-full truncate rounded border border-white/[0.1] bg-black/35 px-1 py-0.5 font-mono text-[8px] text-white/85 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:px-1.5 sm:text-[9px]">
                              {count}×
                            </span>
                          ) : null}
                          {hasData && notePreview ? (
                            <span
                              className="mt-0.5 hidden w-fit max-w-full truncate rounded border border-white/[0.1] bg-black/35 px-1 py-0.5 font-mono text-[8px] text-white/80 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:block sm:px-1.5 sm:text-[9px]"
                              title={notePreview}
                            >
                              {notePreview}
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0 max-w-full self-stretch overflow-hidden text-right">
                          {hasData ? (
                            <>
                              <div
                                className={cn(
                                  "font-display font-semibold leading-[1.15] tabular-nums tracking-[-0.03em]",
                                  "text-[9px] sm:text-[clamp(0.76rem,1.45vw,1.06rem)] lg:text-[clamp(0.9rem,1.25vw,1.24rem)] lg:tracking-[-0.045em]",
                                )}
                              >
                                <span
                                  className="block w-full whitespace-nowrap text-right text-white"
                                  title={formatSignedPnlAmount(total, displayCurrency)}
                                >
                                  {formatSignedPnlAmount(total, displayCurrency)}
                                </span>
                              </div>
                            <div className="mt-1 font-mono text-[7px] uppercase tracking-[0.08em] text-white/45 sm:mt-1.5 sm:text-[9px] sm:tracking-[0.12em]">
                                Day
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-mono text-[11px] tabular-nums text-zinc-600/85 sm:text-[13px]">—</div>
                            </>
                          )}
                        </div>
                      </div>
                    );

                    if (hasData && hrefForDay) {
                      return (
                        <Link
                          key={cell.key}
                          href={hrefForDay}
                          onClick={() => setSelectedDayKey(cell.key)}
                          className="block min-h-0 min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]"
                        >
                          {content}
                        </Link>
                      );
                    }
                    return (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() => setSelectedDayKey(cell.key)}
                        className="min-h-0 min-w-0 rounded-xl text-left"
                        aria-label={`Select day ${cell.key}`}
                      >
                        {content}
                      </button>
                    );
                  })}

                  {(() => {
                    const quality = weekQualityScore(week, aggregates);
                    const status = reflectionStatus(weeklyReflectionRows);
                    const nextFocusPreview = weeklyReflection?.nextWeekFocus?.trim() || "Not set";
                    const weekNum = weekNumber(new Date(`${weekStartKey}T12:00:00`));
                    return (
                  <Link
                    href={`/app/journal?week=${encodeURIComponent(weekStartKey)}#weekly-review`}
                    className={cn(
                      "relative hidden box-border min-h-[142px] min-w-0 flex-col justify-between gap-2.5 overflow-hidden rounded-lg p-2.5 text-left outline-none transition hover:brightness-[1.04] focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.12_252/0.55)] sm:flex sm:min-h-[188px] sm:gap-1 sm:rounded-xl sm:p-5 lg:min-h-[206px] lg:p-5.5",
                      weekRailClasses(weekly),
                    )}
                  >
                    <div className={cn("absolute left-0 top-2 bottom-2 w-[2px] rounded-full sm:top-3 sm:bottom-3 sm:w-[3px] lg:w-1", weekAccent(weekly))} />
                    <div className="flex min-w-0 flex-col gap-2 pl-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:pl-3">
                      <div className="flex shrink-0 items-baseline gap-2 sm:flex-col sm:items-start sm:gap-0">
                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/55 sm:text-[9px] sm:tracking-[0.2em]">
                          Wk {weekNum}
                        </p>
                        <p className="font-mono text-[8px] tabular-nums text-white/65 sm:mt-1 sm:text-[10px] sm:text-white/70">
                          {weekDateRangeLabel(week)}
                        </p>
                        <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/55 sm:text-[9px] sm:tracking-[0.18em]">
                          Quality{" "}
                          <span className="font-semibold text-white/85">{quality}%</span>
                        </p>
                      </div>
                      <div
                        className="min-w-0 w-full rounded-lg border border-white/[0.16] bg-black/35 px-2.5 py-2 sm:max-w-[80%] sm:rounded-xl sm:px-3.5 sm:py-2.5"
                        title={weeklySummary ?? "No weekly reflection"}
                      >
                        <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/60 sm:text-[9px] sm:tracking-[0.18em]">
                          Reflection
                        </p>
                        <p className={cn("mt-1 font-mono text-[9px] uppercase tracking-[0.16em]", status.tone)}>
                          {status.label}
                        </p>
                        <p className="mt-1 break-words text-[11px] leading-snug text-white/85 [overflow-wrap:anywhere] sm:text-[12px] line-clamp-2">
                          Next focus: {nextFocusPreview}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0 overflow-hidden pl-2 sm:pl-3">
                      <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/40 sm:text-[9px] sm:tracking-[0.2em]">
                        Σ
                      </p>
                      <p className="font-display text-[0.8rem] font-semibold leading-[1.08] tabular-nums tracking-[-0.03em] sm:text-[clamp(1.08rem,3vw,1.58rem)] sm:leading-none md:text-[1.74rem] lg:text-[clamp(1.24rem,2.4vw,2.08rem)] lg:tracking-[-0.045em]">
                        <span
                          className="block min-w-0 w-full truncate whitespace-nowrap"
                          title={formatSignedPnlAmount(weekly, displayCurrency)}
                        >
                          {formatSignedPnlAmount(weekly, displayCurrency)}
                        </span>
                      </p>
                    </div>
                  </Link>
                    );
                  })()}
                </Fragment>
              );
            })}
              </div>
            </div>
          </div>
          <div className="mt-3 grid gap-2.5 sm:hidden">
            <p className="px-1 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Weekly summary</p>
            {weeks.map((week, i) => {
              const weekly = week.reduce((acc, day) => {
                const agg = aggregates.get(day.key);
                return acc + (agg?.total ?? 0);
              }, 0);
              const weekStartKey = keyFromDate(startOfWeekMonday(week[0].date));
              const weeklyReflection = weeklyReflectionsByWeekStart.get(weekStartKey);
              const weeklySummary = weekSummaryFromReflection(weeklyReflection);
              const weeklyReflectionRows = weekReflectionLines(weeklyReflection);
              const quality = weekQualityScore(week, aggregates);
              const status = reflectionStatus(weeklyReflectionRows);
              const nextFocusPreview = weeklyReflection?.nextWeekFocus?.trim() || "Not set";
              const weekNum = weekNumber(new Date(`${weekStartKey}T12:00:00`));

              return (
                <Link
                  key={`mobile-week-${i}`}
                  href={`/app/journal?week=${encodeURIComponent(weekStartKey)}#weekly-review`}
                  className={cn(
                    "rounded-lg border px-3 py-2.5",
                    "bg-[linear-gradient(165deg,oklch(0.13_0.03_262/0.88),oklch(0.08_0.02_266/0.88))]",
                    "border-white/[0.1]",
                    "min-h-[7.25rem]",
                  )}
                  title={weeklySummary ?? "No weekly reflection"}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">Wk {weekNum}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{weekDateRangeLabel(week)}</p>
                    </div>
                    <p className={cn("font-display text-[1rem] tabular-nums", weekly >= 0 ? "text-emerald-200" : "text-rose-200")}>
                      {formatSignedPnlAmount(weekly, displayCurrency)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-[11px] text-zinc-300">Quality: <span className="text-zinc-100">{quality}%</span></p>
                  <p className={cn("mt-1 font-mono text-[9px] uppercase tracking-[0.12em]", status.tone)}>{status.label}</p>
                  <p className="mt-1 text-[11px] text-zinc-300 line-clamp-2">Next focus: {nextFocusPreview}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
