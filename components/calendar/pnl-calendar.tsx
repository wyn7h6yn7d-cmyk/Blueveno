"use client";

import { useMemo, useState } from "react";
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
  /** When set, day/week cell tint uses P&amp;L ÷ balance (approx. % return on starting balance). */
  referenceBalance?: number | null;
  weeklyReflections?: WeeklyReflectionSummary[];
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
};

type WeeklyReflectionSummary = {
  weekStart: string;
  whatWorked: string | null;
  whatSlipped: string | null;
  nextWeekFocus: string | null;
};

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

type PerformanceBand =
  | "major_loss"
  | "moderate_loss"
  | "minor_loss"
  | "flat"
  | "minor_gain"
  | "moderate_gain"
  | "major_gain"
  | "none";

type DisplayCell = {
  key: string;
  inMonth: boolean;
  label: string;
  sourceKeys: string[];
  dateKeyForLink: string | null;
};

function monthStartSundayGrid(month: Date): Date {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const dow = first.getDay();
  return addDays(first, -dow);
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
  return monthStartSundayGrid(month);
}

function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function pctReturnOnBalance(pnl: number, balance: number | null | undefined): number | null {
  if (balance === null || balance === undefined || balance <= 0 || !Number.isFinite(balance)) return null;
  return (pnl / balance) * 100;
}

/** Buckets tuned to match common journal heatmaps; requires reference balance for % bands. */
function bandFromPct(pct: number | null, total: number, hasData: boolean): PerformanceBand {
  if (!hasData) return "none";
  if (pct !== null && Number.isFinite(pct)) {
    if (pct <= -42.4) return "major_loss";
    if (pct <= -7) return "moderate_loss";
    if (pct < 0) return "minor_loss";
    if (pct === 0) return "flat";
    if (pct < 7) return "minor_gain";
    if (pct < 42.4) return "moderate_gain";
    return "major_gain";
  }
  if (total > 0) return "moderate_gain";
  if (total < 0) return "moderate_loss";
  return "flat";
}

function dayCellClasses(band: PerformanceBand, hasData: boolean, inMonth: boolean): string {
  if (!hasData || band === "none") {
    return cn(
      "border border-white/[0.14] bg-[linear-gradient(165deg,oklch(0.12_0.032_264/0.76),oklch(0.075_0.026_268/0.66))] text-zinc-500",
      !inMonth && "opacity-38",
    );
  }
  switch (band) {
    case "major_loss":
      return cn(
        "border border-rose-500/52 bg-[linear-gradient(155deg,oklch(0.34_0.14_18/0.62),oklch(0.13_0.06_22/0.52))] text-rose-50",
        "shadow-[inset_0_1px_0_0_oklch(0.92_0.06_15/0.14),0_0_0_1px_oklch(0.52_0.18_15/0.14)]",
        !inMonth && "opacity-58",
      );
    case "moderate_loss":
      return cn(
        "border border-rose-400/56 bg-[linear-gradient(155deg,oklch(0.31_0.11_18/0.6),oklch(0.13_0.06_22/0.5))] text-rose-50",
        "shadow-[inset_0_1px_0_0_oklch(0.92_0.07_15/0.16),0_0_0_1px_oklch(0.5_0.15_15/0.14)]",
        !inMonth && "opacity-58",
      );
    case "minor_loss":
      return cn(
        "border border-rose-400/42 bg-[linear-gradient(155deg,oklch(0.22_0.07_22/0.48),oklch(0.11_0.04_22/0.42))] text-rose-100",
        !inMonth && "opacity-58",
      );
    case "flat":
      return cn("border border-white/[0.14] bg-white/[0.06] text-zinc-300", !inMonth && "opacity-48");
    case "minor_gain":
      return cn(
        "border border-emerald-400/44 bg-[linear-gradient(155deg,oklch(0.2_0.07_155/0.46),oklch(0.11_0.05_160/0.42))] text-emerald-100",
        !inMonth && "opacity-58",
      );
    case "moderate_gain":
      return cn(
        "border border-emerald-400/58 bg-[linear-gradient(155deg,oklch(0.29_0.11_155/0.62),oklch(0.13_0.06_160/0.5))] text-emerald-50",
        "shadow-[inset_0_1px_0_0_oklch(0.9_0.08_155/0.24),0_0_0_1px_oklch(0.5_0.14_155/0.16)]",
        !inMonth && "opacity-58",
      );
    case "major_gain":
      return cn(
        "border border-emerald-400/62 bg-[linear-gradient(155deg,oklch(0.34_0.13_155/0.66),oklch(0.14_0.06_160/0.54))] text-emerald-50",
        "shadow-[inset_0_1px_0_0_oklch(0.92_0.09_155/0.26),0_0_0_1px_oklch(0.52_0.16_155/0.18)]",
        !inMonth && "opacity-58",
      );
    default:
      return cn("border border-white/[0.14] bg-white/[0.06] text-zinc-300", !inMonth && "opacity-48");
  }
}

function weekRailClasses(band: PerformanceBand, weeklyTotal: number): string {
  if (band !== "none") {
    return dayCellClasses(band, true, true);
  }
  if (weeklyTotal > 0) {
    return cn(
      "border border-emerald-400/45 bg-[linear-gradient(160deg,oklch(0.24_0.09_155/0.55),oklch(0.1_0.04_160/0.48))] text-emerald-50",
      "shadow-[inset_0_1px_0_0_oklch(0.88_0.08_155/0.18),0_0_0_1px_oklch(0.42_0.14_155/0.15)]",
    );
  }
  if (weeklyTotal < 0) {
    return cn(
      "border border-rose-400/42 bg-[linear-gradient(160deg,oklch(0.26_0.08_15/0.5),oklch(0.11_0.04_18/0.42))] text-rose-50",
      "shadow-[inset_0_1px_0_0_oklch(0.9_0.05_15/0.12),0_0_0_1px_oklch(0.42_0.14_15/0.12)]",
    );
  }
  return "border border-white/[0.14] bg-[linear-gradient(165deg,oklch(0.14_0.04_262/0.65),oklch(0.09_0.03_266/0.58))] text-zinc-300";
}

function weekAccentFromBand(band: PerformanceBand, weeklyTotal: number): string {
  if (band !== "none") {
    switch (band) {
      case "major_loss":
      case "moderate_loss":
      case "minor_loss":
        return "bg-rose-400/80";
      case "major_gain":
      case "moderate_gain":
      case "minor_gain":
        return "bg-emerald-400/80";
      case "flat":
        return "bg-zinc-500/55";
      default:
        return "bg-zinc-500/50";
    }
  }
  if (weeklyTotal > 0) return "bg-emerald-400/80";
  if (weeklyTotal < 0) return "bg-rose-400/80";
  return "bg-zinc-500/50";
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
  const pick = [reflection.whatWorked, reflection.whatSlipped, reflection.nextWeekFocus]
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
  if (rows.length >= 3) return { label: "Complete", tone: "text-emerald-200" };
  if (rows.length > 0) return { label: "Partial", tone: "text-amber-200" };
  return { label: "Empty", tone: "text-zinc-400" };
}

export function PnlCalendar({ entries, displayCurrency, referenceBalance = null, weeklyReflections = [] }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(() => keyFromDate(new Date()));
  const todayKey = useMemo(() => keyFromDate(new Date()), []);

  const aggregates = useMemo(() => {
    const map = new Map<string, DayAggregate>();
    for (const row of entries) {
      const key = row.entryDate ?? keyFromDate(row.createdAt ? new Date(row.createdAt) : new Date());
      const val = parsePnlAmount(row.r) ?? 0;
      const rowNote = row.note?.trim() ? row.note.trim() : null;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, { total: val, latestEntryId: row.id, count: 1, latestNote: rowNote });
        continue;
      }
      map.set(key, {
        total: prev.total + val,
        latestEntryId: prev.latestEntryId ?? row.id,
        count: prev.count + 1,
        latestNote: prev.latestNote ?? rowNote,
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

  const weeklyReflectionsByWeekStart = useMemo(() => {
    const map = new Map<string, WeeklyReflectionSummary>();
    for (const reflection of weeklyReflections) {
      map.set(reflection.weekStart, reflection);
    }
    return map;
  }, [weeklyReflections]);

  /** Below sm: 7 weekday cols + week rail (scroll horizontally). sm+: fluid tracks. */
  const calendarGridCols = cn(
    "[grid-template-columns:repeat(7,minmax(3.35rem,1fr))_minmax(9.25rem,11rem)]",
    "sm:[grid-template-columns:repeat(7,minmax(0,1fr))_minmax(10.5rem,13.5rem)]",
    "lg:[grid-template-columns:repeat(7,minmax(0,1fr))_minmax(12rem,15.5rem)]",
    "xl:[grid-template-columns:repeat(7,minmax(0,1fr))_minmax(13rem,17rem)]",
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
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-black/30 px-3 py-3 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:px-4 sm:py-3.5">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Legend</p>
        <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 sm:text-[12px]">
          Cell tint is driven by{" "}
          <span className="text-zinc-400">
            day P&amp;L as % of your active account starting balance
          </span>
          {referenceBalance != null && referenceBalance > 0 ? (
            <>
              {" "}
              ({formatSignedPnlAmount(referenceBalance, displayCurrency)} baseline in Settings → Trading accounts).
            </>
          ) : (
            <> — add a starting balance there to unlock the full heatmap.</>
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
          {(
            [
              ["Major loss", "≤−42.4%", "major_loss"],
              ["Moderate loss", "−42.4% to −7%", "moderate_loss"],
              ["Minor loss", "−7% to 0%", "minor_loss"],
              ["Flat", "0%", "flat"],
              ["Minor gain", "0–7%", "minor_gain"],
              ["Moderate gain", "7–42.4%", "moderate_gain"],
              ["Major gain", "≥42.4%", "major_gain"],
            ] as const
          ).map(([label, range, band]) => (
            <div key={band} className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "size-6 shrink-0 rounded-md border sm:size-7",
                  dayCellClasses(band as PerformanceBand, true, true),
                )}
                aria-hidden
              />
              <span className="min-w-0 font-mono text-[9px] leading-tight text-zinc-400 sm:text-[10px]">
                <span className="block text-zinc-300">{label}</span>
                <span className="block text-zinc-500">{range}</span>
              </span>
            </div>
          ))}
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn("size-6 shrink-0 rounded-md border sm:size-7", dayCellClasses("none", false, true))}
              aria-hidden
            />
            <span className="min-w-0 font-mono text-[9px] leading-tight text-zinc-400 sm:text-[10px]">
              <span className="block text-zinc-300">No trades</span>
              <span className="block text-zinc-500">No journal day</span>
            </span>
          </div>
        </div>
      </div>

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
                  "grid min-w-0 gap-1.5 max-sm:w-max max-sm:min-w-full sm:w-full sm:gap-3 lg:gap-3.5",
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
                <span className="sm:hidden">{d.slice(0, 2)}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
            <div
              className={cn(
                headerBox,
                "min-w-0 font-mono text-[8px] uppercase tracking-[0.12em] text-[oklch(0.78_0.12_252)] sm:text-[10px] sm:tracking-[0.18em] lg:text-[11px]",
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
              const weeklyPct = pctReturnOnBalance(weekly, referenceBalance);
              const weeklyBand = bandFromPct(weeklyPct, weekly, week.some((d) => (aggregates.get(d.key)?.count ?? 0) > 0));
              const weekTradeCount = week.reduce((acc, d) => acc + (aggregates.get(d.key)?.count ?? 0), 0);
              const displayCells: DisplayCell[] = week.map((day) => ({
                key: day.key,
                inMonth: day.inMonth,
                label: String(day.date.getDate()),
                sourceKeys: [day.key],
                dateKeyForLink: day.key,
              }));
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
                    const hasData = count > 0;
                    const dayPct = pctReturnOnBalance(total, referenceBalance);
                    const dayBand = bandFromPct(dayPct, total, hasData);
                    const cellClasses = dayCellClasses(dayBand, hasData, cell.inMonth);
                    const isSelected = cell.key === selectedDayKey;
                    const isToday = cell.sourceKeys.includes(todayKey);

                    const hrefForDay = hasData
                      ? count === 1 && latestEntryId
                        ? `/app/journal/${latestEntryId}`
                        : `/app/journal?date=${encodeURIComponent(cell.dateKeyForLink ?? "")}`
                      : null;

                    const content = (
                      <div
                        className={cn(
                          "group relative box-border flex h-full min-h-[112px] min-w-0 flex-col justify-between overflow-hidden rounded-lg p-2.5 transition duration-200 sm:min-h-[188px] sm:rounded-xl sm:p-4.5 lg:min-h-[206px] lg:p-5",
                          cellClasses,
                          isSelected &&
                            "ring-2 ring-[oklch(0.72_0.14_252/0.72)] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.08),0_0_0_1px_oklch(0.72_0.14_252/0.5)]",
                          hasData && "hover:brightness-[1.05] hover:ring-2 hover:ring-[oklch(0.58_0.12_252/0.5)]",
                        )}
                      >
                        <div className="flex min-w-0 flex-col items-stretch gap-0.5 self-stretch">
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={cn(
                                "font-mono text-[11px] tabular-nums sm:text-[12px]",
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
                          {hasData && count > 1 ? (
                            <span className="w-fit max-w-full truncate rounded border border-white/[0.1] bg-black/35 px-1 py-0.5 font-mono text-[8px] text-white/85 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:px-1.5 sm:text-[9px]">
                              {count}×
                            </span>
                          ) : null}
                          {hasData && notePreview ? (
                            <span
                              className="mt-0.5 block w-fit max-w-full truncate rounded border border-white/[0.1] bg-black/35 px-1 py-0.5 font-mono text-[8px] text-white/80 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:px-1.5 sm:text-[9px]"
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
                                  "text-[10px] sm:text-[clamp(0.76rem,1.45vw,1.06rem)] lg:text-[clamp(0.9rem,1.25vw,1.24rem)] lg:tracking-[-0.045em]",
                                )}
                              >
                                <span
                                  className="block w-full whitespace-nowrap text-right text-white"
                                  title={formatSignedPnlAmount(total, displayCurrency)}
                                >
                                  {formatSignedPnlAmount(total, displayCurrency)}
                                </span>
                              </div>
                              <div className="mt-1 flex flex-col items-end gap-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-white/45 sm:mt-1.5 sm:text-[9px] sm:tracking-[0.12em]">
                                <span>Day</span>
                                {dayPct !== null ? (
                                  <span className="normal-case tracking-normal text-white/55">
                                    {dayPct >= 0 ? "+" : ""}
                                    {dayPct.toFixed(1)}% vs balance
                                  </span>
                                ) : null}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-mono text-[11px] tabular-nums text-zinc-500/85 sm:text-[13px]">—</div>
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
                    return (
                  <div
                    className={cn(
                      "relative box-border flex min-h-[142px] min-w-0 flex-col justify-between gap-2.5 overflow-hidden rounded-lg p-2.5 text-left sm:min-h-[188px] sm:gap-1 sm:rounded-xl sm:p-5 lg:min-h-[206px] lg:p-5.5",
                      weekRailClasses(weeklyBand, weekly),
                    )}
                  >
                    <div
                      className={cn(
                        "absolute left-0 top-2 bottom-2 w-[2px] rounded-full sm:top-3 sm:bottom-3 sm:w-[3px] lg:w-1",
                        weekAccentFromBand(weeklyBand, weekly),
                      )}
                    />
                    <div className="flex min-w-0 flex-col gap-2 pl-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:pl-3">
                      <div className="flex shrink-0 items-baseline gap-2 sm:flex-col sm:items-start sm:gap-0">
                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/55 sm:text-[9px] sm:tracking-[0.2em]">
                          Wk {i + 1}
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
                        {weeklyReflectionRows.length === 0 ? (
                          <p className="mt-1 text-[11px] leading-snug text-white/55 sm:text-[12px]">
                            —
                          </p>
                        ) : (
                          <p className="mt-1 break-words text-[11px] leading-snug text-white/85 [overflow-wrap:anywhere] sm:text-[12px] line-clamp-2">
                            {weeklySummary}
                          </p>
                        )}
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
                      <p className="mt-1 font-mono text-[9px] tabular-nums text-white/55 sm:text-[10px]">
                        {weekTradeCount} {weekTradeCount === 1 ? "trade" : "trades"}
                        {weeklyPct !== null ? (
                          <>
                            {" "}
                            · {weeklyPct >= 0 ? "+" : ""}
                            {weeklyPct.toFixed(1)}% vs balance
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                    );
                  })()}
                </Fragment>
              );
            })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
