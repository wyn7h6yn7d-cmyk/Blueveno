"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Fragment } from "react";
import Link from "next/link";
import { CalendarDayDrawer } from "@/components/calendar/calendar-day-drawer";
import { ChevronLeft, ChevronRight, LineChart } from "lucide-react";
import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { computeDisciplineScorePercent, formatDisciplinePercent } from "@/lib/user-data/discipline-stats";
import { dayKeyFromRow, toDayKey } from "@/lib/user-data/journal-metrics";
import { parsePnlAmount, tradeWinRatePercent } from "@/lib/user-data/kpi";
import { pickBestWorstWeeks } from "@/lib/user-data/week-aggregation";
import { formatWeekHeadline, isoWeekNumberFromDayKey } from "@/lib/user-data/week-labels";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  entries: JournalRow[];
  summaryEntries?: JournalRow[];
  summaryWinRate?: number | null;
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

export function PnlCalendar({ entries, summaryEntries, summaryWinRate, displayCurrency, weeklyReflections = [], filterControls = null }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDayKeys, setDrawerDayKeys] = useState<string[]>([]);
  const todayKey = useMemo(() => keyFromDate(new Date()), []);

  const openDayDrawer = (cell: DisplayCell) => {
    setSelectedCellKey(cell.key);
    setDrawerDayKeys(cell.sourceKeys);
    setDrawerOpen(true);
  };

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
    for (const row of monthEntries) {
      const key = dayKeyFromRow(row.entryDate, row.createdAt);
      const pnl = parsePnlAmount(row.r) ?? 0;
      dayTotals.set(key, (dayTotals.get(key) ?? 0) + pnl);
    }

    const tradedDays = dayTotals.size;
    const dayValues = [...dayTotals.values()];
    const monthPnl = dayValues.reduce((sum, value) => sum + value, 0);
    const winRate = tradeWinRatePercent(monthEntries);
    const disciplineScore = computeDisciplineScorePercent(monthEntries);

    const weekTotals = new Map<string, number>();
    for (const [dayKey, total] of dayTotals.entries()) {
      const ws = toDayKey(startOfWeekMonday(new Date(`${dayKey}T12:00:00`)));
      weekTotals.set(ws, (weekTotals.get(ws) ?? 0) + total);
    }
    const weekRows = [...weekTotals.entries()].map(([weekStart, pnl]) => ({ weekStart, pnl }));
    const { bestWeek: bestWeekRaw, weakestWeek } = pickBestWorstWeeks(weekRows);
    const bestWeek = bestWeekRaw ? { weekStart: bestWeekRaw.weekStart, total: bestWeekRaw.pnl } : null;
    const weakestWeekDisplay = weakestWeek ? { weekStart: weakestWeek.weekStart, total: weakestWeek.pnl } : null;
    const weeksWithTrades = weekRows.filter(({ weekStart }) =>
      [...dayTotals.keys()].some(
        (dayKey) => toDayKey(startOfWeekMonday(new Date(`${dayKey}T12:00:00`))) === weekStart,
      ),
    );
    const onlyOneActiveWeek = weeksWithTrades.length <= 1;

    return {
      tradedDays,
      monthPnl,
      winRate,
      bestWeek,
      weakestWeek: weakestWeekDisplay,
      disciplineScore,
      onlyOneActiveWeek,
    };
  }, [cursor, entries]);

  const scopeSummary = useMemo(() => {
    if (summaryWinRate !== undefined) {
      return { winRate: summaryWinRate };
    }
    const source = summaryEntries ?? entries;
    const winRate = tradeWinRatePercent(source);
    return { winRate };
  }, [entries, summaryEntries, summaryWinRate]);

  const weeklyReflectionsByWeekStart = useMemo(() => {
    const map = new Map<string, WeeklyReflectionSummary>();
    for (const reflection of weeklyReflections) {
      map.set(reflection.weekStart, reflection);
    }
    return map;
  }, [weeklyReflections]);

  /** Mobile: 5 weekdays + full-width week bar. sm+: weekend. lg+: week # column + week summary rail. */
  const calendarGridCols =
    "grid w-full min-w-0 grid-cols-5 gap-2 sm:grid-cols-6 sm:gap-2.5 lg:grid-cols-[2.75rem_repeat(6,minmax(0,1fr))_minmax(13.5rem,1fr)] lg:gap-3";

  type MonthSummaryCard =
    | { label: string; value: string; tone: number }
    | { label: string; weekStart: string; pnl: number; tone: number };

  const monthSummaryCards: MonthSummaryCard[] = [
    {
      label: "Month P&L",
      value: monthSummary.tradedDays > 0 ? formatSignedPnlAmount(monthSummary.monthPnl, displayCurrency) : "—",
      tone: monthSummary.monthPnl,
    },
    {
      label: "Trade win",
      value: scopeSummary.winRate !== null ? `${scopeSummary.winRate}%` : "—",
      tone: 0,
    },
    { label: "Traded days", value: String(monthSummary.tradedDays), tone: 0 },
    monthSummary.onlyOneActiveWeek
      ? {
          label: "Only active week",
          weekStart: monthSummary.bestWeek?.weekStart ?? "",
          pnl: monthSummary.bestWeek?.total ?? 0,
          tone: monthSummary.bestWeek?.total ?? 0,
        }
      : {
          label: "Best week",
          weekStart: monthSummary.bestWeek?.weekStart ?? "",
          pnl: monthSummary.bestWeek?.total ?? 0,
          tone: monthSummary.bestWeek?.total ?? 0,
        },
    ...(monthSummary.onlyOneActiveWeek
      ? []
      : [
          {
            label: "Weakest week",
            weekStart: monthSummary.weakestWeek?.weekStart ?? "",
            pnl: monthSummary.weakestWeek?.total ?? 0,
            tone: monthSummary.weakestWeek?.total ?? 0,
          },
        ]),
    { label: "Discipline score", value: formatDisciplinePercent(monthSummary.disciplineScore), tone: 0 },
  ];

  const headerBox =
    "flex min-h-[2rem] items-center justify-center rounded-lg border border-white/[0.12] bg-black/40 px-1 py-1 text-center text-[11px] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:min-h-[3.4rem] sm:rounded-xl sm:px-1 sm:py-2.5 sm:text-[12px]";

  return (
    <div className="min-w-0 space-y-6">
      <div
        className={cn(
          "grid gap-3 rounded-xl border border-[oklch(0.52_0.12_252/0.22)] bg-[linear-gradient(168deg,oklch(0.12_0.04_262/0.85),oklch(0.07_0.03_266/0.88))] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:gap-4 sm:rounded-2xl sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto]",
        )}
      >
        <div className="min-w-0 space-y-1.5">
          <p className="app-eyebrow">Month</p>
          <p className="truncate font-display text-[1.35rem] font-semibold tracking-[-0.04em] text-zinc-50 sm:text-[2rem] lg:text-[2.15rem]">
            {monthLabel(cursor)}
          </p>
        </div>
        <div className="w-full min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.1] bg-black/40 p-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]">
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
            <div className="min-w-0 flex-1">
              {filterControls}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 auto-rows-fr gap-2 sm:gap-3 xl:grid-cols-6" aria-label="Month summary">
        {monthSummaryCards.map((item) => (
          <div
            key={item.label}
            className="flex h-full min-h-[4.5rem] flex-col justify-center rounded-xl border border-white/[0.08] bg-[linear-gradient(160deg,oklch(0.13_0.03_262/0.9),oklch(0.085_0.026_266/0.9))] px-3 py-2.5 sm:min-h-[5rem] sm:justify-between sm:px-3.5 sm:py-3"
          >
            <p className="app-kicker text-[11px]">{item.label}</p>
            {"weekStart" in item && item.weekStart ? (
              <div className="mt-1 space-y-0.5 sm:mt-1.5">
                <p className="font-display text-[0.82rem] leading-snug text-zinc-100 sm:text-[0.92rem]">
                  {formatWeekHeadline(item.weekStart)}
                </p>
                <p
                  className={cn(
                    "font-display text-[0.95rem] tabular-nums tracking-[-0.02em] sm:text-[1rem]",
                    item.tone > 0 && "text-emerald-200",
                    item.tone < 0 && "text-rose-200",
                    item.tone === 0 && "text-zinc-100",
                  )}
                >
                  {formatSignedPnlAmount(item.pnl, displayCurrency)}
                </p>
              </div>
            ) : (
              <p
                className={cn(
                  "font-display text-[0.95rem] tabular-nums tracking-[-0.02em] sm:mt-1.5 sm:text-[1rem]",
                  item.tone > 0 && "text-emerald-200",
                  item.tone < 0 && "text-rose-200",
                  item.tone === 0 && "text-zinc-100",
                )}
              >
                {"value" in item ? item.value : "—"}
              </p>
            )}
          </div>
        ))}
      </div>

      {monthSummary.tradedDays === 0 ? (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-zinc-500">
          Your month will fill as you log trading days.
        </div>
      ) : null}

      <div className="w-full min-w-0 overflow-x-hidden overflow-y-visible pb-1">
        <div className="w-full min-w-0">
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
              <div className={calendarGridCols}>
            <div className={cn(headerBox, "hidden min-w-0 app-kicker lg:flex")}>Wk</div>
            {WEEKDAY_HEADERS.map((d) => (
              <div
                key={d}
                className={cn(
                  headerBox,
                  "min-w-0 app-kicker font-medium",
                  d === "Weekend" && "hidden sm:flex",
                )}
              >
                <span className="sm:hidden">{d === "Weekend" ? "Sat–Sun" : d.slice(0, 3)}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
            <div
              className={cn(headerBox, "hidden min-w-0 app-kicker lg:flex")}
            >
              Week
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
              const weeklyReflectionRows = weekReflectionLines(weeklyReflection);
              const weeklyStatus = reflectionStatus(weeklyReflectionRows);
              const weeklyQuality = weekQualityScore(week, aggregates);
              return (
                <Fragment key={`week-row-${i}`}>
                  <div
                    className={cn(
                      headerBox,
                      "hidden min-h-[4.25rem] flex-col gap-0.5 border-white/[0.1] bg-black/30 lg:flex lg:min-h-[6.25rem]",
                    )}
                    aria-hidden
                  >
                    <span className="app-kicker text-[9px]">Wk</span>
                    <span className="font-display text-[0.95rem] tabular-nums text-zinc-100">
                      {isoWeekNumberFromDayKey(weekStartKey)}
                    </span>
                  </div>
                  {displayCells.map((cell) => {
                    const aggregateRows = cell.sourceKeys.map((k) => aggregates.get(k)).filter(Boolean) as DayAggregate[];
                    const total = aggregateRows.reduce((sum, row) => sum + row.total, 0);
                    const count = aggregateRows.reduce((sum, row) => sum + row.count, 0);
                    const hasChartLink = aggregateRows.some((row) => row.hasChartLink);
                    const hasData = count > 0;
                    const cellClasses = dayCellClasses(total, hasData, cell.inMonth);
                    const isSelected = cell.key === selectedCellKey && drawerOpen;
                    const isToday = cell.sourceKeys.includes(todayKey);

                    return (
                      <button
                        key={cell.key}
                        type="button"
                        onClick={() => openDayDrawer(cell)}
                        className={cn(
                          "min-h-0 min-w-0 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]",
                          cell.isWeekend && "hidden sm:block",
                        )}
                        aria-label={`${cell.label}, ${hasData ? formatSignedPnlAmount(total, displayCurrency) : "no trades"}`}
                      >
                        <div
                          className={cn(
                            "relative box-border flex h-full min-h-[4.25rem] min-w-0 flex-col justify-between overflow-hidden rounded-lg p-2.5 transition duration-200 sm:min-h-[5.75rem] sm:rounded-xl sm:p-3 lg:min-h-[6.25rem]",
                            cellClasses,
                            cell.isWeekend && !hasData && "border-white/[0.06] bg-[linear-gradient(160deg,oklch(0.105_0.024_264/0.5),oklch(0.07_0.02_268/0.45))] text-zinc-600",
                            isSelected &&
                              "ring-2 ring-[oklch(0.72_0.14_252/0.72)] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08),0_0_0_1px_oklch(0.72_0.14_252/0.5)]",
                            "hover:brightness-[1.04] hover:ring-1 hover:ring-[oklch(0.58_0.12_252/0.35)]",
                          )}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className={cn(
                                "font-mono text-[11px] tabular-nums sm:text-[12px]",
                                hasData ? "text-white/90" : cell.inMonth ? "text-zinc-400" : "text-zinc-600",
                                isToday && "font-semibold text-[oklch(0.84_0.1_252)]",
                              )}
                            >
                              {cell.label}
                            </span>
                            <div className="flex shrink-0 items-center gap-1">
                              {hasData && count > 0 ? (
                                <span
                                  className="flex size-5 items-center justify-center rounded-full border border-white/[0.14] bg-black/40 font-mono text-[9px] font-medium text-zinc-100"
                                  title={`${count} entr${count === 1 ? "y" : "ies"}`}
                                >
                                  {count}
                                </span>
                              ) : null}
                              {hasChartLink ? (
                                <span
                                  className="hidden size-5 items-center justify-center rounded-full border border-[oklch(0.58_0.12_252/0.4)] bg-[oklch(0.58_0.12_252/0.2)] text-[oklch(0.82_0.1_252)] sm:flex"
                                  title="Linked chart"
                                >
                                  <LineChart className="size-3" strokeWidth={2} />
                                </span>
                              ) : null}
                            </div>
                          </div>
                          <p
                            className={cn(
                              "w-full truncate text-right font-display text-[10px] font-semibold tabular-nums leading-none tracking-[-0.02em] sm:text-[13px]",
                              hasData ? "text-white" : "text-zinc-600",
                            )}
                            title={hasData ? formatSignedPnlAmount(total, displayCurrency) : undefined}
                          >
                            {hasData ? formatSignedPnlAmount(total, displayCurrency) : "—"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                  <Link
                    href={`/app/journal?week=${encodeURIComponent(weekStartKey)}#weekly-review`}
                    className="col-span-5 flex min-h-[3.25rem] items-center justify-between gap-3 overflow-hidden rounded-lg border border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.13_0.03_262/0.9),oklch(0.085_0.026_266/0.9))] px-3 py-2.5 text-left sm:col-span-6 sm:hidden lg:hidden"
                    title={weekSummaryFromReflection(weeklyReflection) ?? "No weekly reflection"}
                  >
                    <div className="min-w-0">
                      <p className="app-kicker text-[11px]">{formatWeekHeadline(weekStartKey)}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">Week total</p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 font-display text-[15px] tabular-nums tracking-[-0.02em]",
                        weekly >= 0 ? "text-emerald-200" : "text-rose-200",
                      )}
                    >
                      {formatSignedPnlAmount(weekly, displayCurrency)}
                    </p>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-zinc-400">
                        Quality <span className="text-zinc-200">{weeklyQuality}%</span>
                      </p>
                      <p className={cn("text-[11px] font-medium", weeklyStatus.tone)}>{weeklyStatus.label}</p>
                    </div>
                  </Link>
                  <Link
                    href={`/app/journal?week=${encodeURIComponent(weekStartKey)}#weekly-review`}
                    className="relative hidden min-h-[5.75rem] rounded-xl border border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.13_0.03_262/0.9),oklch(0.085_0.026_266/0.9))] px-3.5 py-3.5 text-left lg:flex lg:min-h-[6.25rem] lg:flex-col lg:justify-between"
                    title={weekSummaryFromReflection(weeklyReflection) ?? "No weekly reflection"}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="app-kicker">{formatWeekHeadline(weekStartKey)}</p>
                      <p className={cn("font-display text-[1.2rem] tabular-nums tracking-[-0.03em]", weekly >= 0 ? "text-emerald-200" : "text-rose-200")}>
                        {formatSignedPnlAmount(weekly, displayCurrency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[12px] text-zinc-300">
                        Quality: <span className="text-zinc-100">{weeklyQuality}%</span>
                      </p>
                      <p className={cn("mt-1 font-mono text-[10px] uppercase tracking-[0.14em]", weeklyStatus.tone)}>{weeklyStatus.label}</p>
                    </div>
                  </Link>

                </Fragment>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CalendarDayDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        dayKeys={drawerDayKeys}
        entries={entries}
        displayCurrency={displayCurrency}
      />
    </div>
  );
}
