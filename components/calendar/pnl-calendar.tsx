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
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function monthStartMonday(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function keyFromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
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
      "border border-white/[0.14] bg-[linear-gradient(165deg,oklch(0.11_0.03_264/0.72),oklch(0.07_0.025_268/0.62))] text-zinc-500",
      !inMonth && "opacity-38",
    );
  }
  if (total > 0) {
    return cn(
      "border border-emerald-400/48 bg-[linear-gradient(155deg,oklch(0.26_0.1_155/0.52),oklch(0.12_0.05_160/0.42))] text-emerald-50",
      "shadow-[inset_0_1px_0_0_oklch(0.88_0.08_155/0.2),0_0_0_1px_oklch(0.45_0.12_155/0.12)]",
      !inMonth && "opacity-58",
    );
  }
  if (total < 0) {
    return cn(
      "border border-rose-400/42 bg-[linear-gradient(155deg,oklch(0.28_0.09_18/0.48),oklch(0.12_0.05_22/0.38))] text-rose-50",
      "shadow-[inset_0_1px_0_0_oklch(0.9_0.06_15/0.12),0_0_0_1px_oklch(0.45_0.14_15/0.1)]",
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

function weekDateRangeLabel(week: DayCell[]): string {
  const start = week[0].date.getDate();
  const end = week[6].date.getDate();
  return `${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")}`;
}

export function PnlCalendar({ entries, displayCurrency }: Props) {
  const [cursor, setCursor] = useState(() => new Date());

  const aggregates = useMemo(() => {
    const map = new Map<string, DayAggregate>();
    for (const row of entries) {
      const key = row.entryDate ?? keyFromDate(row.createdAt ? new Date(row.createdAt) : new Date());
      const val = parsePnlAmount(row.r) ?? 0;
      const prev = map.get(key);
      if (!prev) {
        map.set(key, { total: val, latestEntryId: row.id, count: 1 });
        continue;
      }
      map.set(key, {
        total: prev.total + val,
        latestEntryId: prev.latestEntryId ?? row.id,
        count: prev.count + 1,
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

  /** Tight week rail on small screens so the grid fits without huge horizontal scroll */
  const calendarGridCols = cn(
    "[grid-template-columns:repeat(7,minmax(0,1fr))_minmax(3.75rem,4.5rem)]",
    "sm:[grid-template-columns:repeat(7,minmax(0,1fr))_minmax(10.5rem,15rem)]",
    "lg:[grid-template-columns:repeat(7,minmax(0,1fr))_minmax(13.5rem,19rem)]",
  );

  const headerBox =
    "flex min-h-[2.35rem] items-center justify-center rounded-lg border border-white/[0.12] bg-black/40 px-0.5 py-1.5 text-center shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:min-h-[3.1rem] sm:rounded-xl sm:px-1 sm:py-2.5";

  return (
    <div className="min-w-0 space-y-5">
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

      <div className="w-full min-w-0 overflow-x-auto overflow-y-visible pb-1 [-webkit-overflow-scrolling:touch]">
        <div className="flex w-full min-w-0 justify-center sm:justify-center xl:justify-start">
          <div
            className={cn(
              "w-full min-w-0 max-w-full sm:max-w-none",
              "rounded-xl border border-[oklch(0.52_0.12_252/0.32)] sm:rounded-[1.35rem]",
              "bg-[linear-gradient(168deg,oklch(0.12_0.036_262/0.98),oklch(0.065_0.03_264/0.97))]",
              "p-2 shadow-[inset_0_1px_0_oklch(1_0_0_/0.06),0_32px_100px_-44px_rgba(0,0,0,0.72)] sm:p-3.5 lg:p-5",
            )}
          >
            <div
              className={cn(
                "rounded-lg border border-white/[0.08] bg-black/25 p-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)] sm:rounded-xl sm:p-2.5 lg:p-3",
              )}
            >
              <div className={cn("grid w-full min-w-0 gap-1 sm:gap-2.5 lg:gap-3", calendarGridCols)}>
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className={cn(
                  headerBox,
                  "min-w-0 font-mono text-[8px] uppercase tracking-[0.1em] text-zinc-400 sm:text-[10px] sm:tracking-[0.18em]",
                )}
              >
                <span className="sm:hidden">{d.slice(0, 1)}</span>
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

              return (
                <Fragment key={`week-row-${i}`}>
                  {week.map((day) => {
                    const agg = aggregates.get(day.key);
                    const hasData = Boolean(agg && agg.count > 0);
                    const total = agg?.total ?? 0;
                    const cellClasses = dayCellClasses(total, hasData, day.inMonth);

                    const hrefForDay =
                      hasData && agg
                        ? agg.count === 1 && agg.latestEntryId
                          ? `/app/journal/${agg.latestEntryId}`
                          : `/app/journal?date=${encodeURIComponent(day.key)}`
                        : null;

                    const content = (
                      <div
                        className={cn(
                          "group relative box-border flex h-full min-h-[86px] min-w-0 flex-col justify-between rounded-lg p-1.5 transition duration-200 sm:min-h-[148px] sm:rounded-xl sm:p-3.5 lg:min-h-[160px] lg:p-4",
                          cellClasses,
                          hasData && "hover:brightness-[1.05] hover:ring-2 hover:ring-[oklch(0.58_0.12_252/0.5)]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={cn(
                              "font-mono text-[10px] tabular-nums sm:text-[12px]",
                              hasData ? "text-white/75" : "text-zinc-500",
                            )}
                          >
                            {day.date.getDate()}
                          </span>
                          {hasData && agg!.count > 1 ? (
                            <span className="shrink-0 rounded border border-white/[0.1] bg-black/35 px-1 py-0.5 font-mono text-[8px] text-white/75 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:px-1.5 sm:text-[9px]">
                              {agg!.count}×
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0 max-w-full self-stretch overflow-hidden text-right">
                          {hasData ? (
                            <>
                              <div
                                className={cn(
                                  "font-display font-semibold leading-[1.15] tabular-nums tracking-[-0.03em]",
                                  "text-[10px] sm:text-[clamp(0.625rem,2.1vw,1.0625rem)] lg:text-[clamp(0.75rem,1.9vw,1.125rem)] lg:tracking-[-0.035em]",
                                )}
                              >
                                <span
                                  className="block min-w-0 w-full truncate"
                                  title={formatSignedPnlAmount(agg!.total, displayCurrency)}
                                >
                                  {formatSignedPnlAmount(agg!.total, displayCurrency)}
                                </span>
                              </div>
                              <div className="mt-1 font-mono text-[7px] uppercase tracking-[0.08em] text-white/45 sm:mt-1.5 sm:text-[9px] sm:tracking-[0.12em]">
                                Day
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-mono text-[11px] tabular-nums text-zinc-600 sm:text-[13px]">—</div>
                              <div className="mt-0.5 font-mono text-[7px] text-zinc-600 sm:mt-1 sm:text-[9px]">No trade</div>
                            </>
                          )}
                        </div>
                      </div>
                    );

                    if (hasData && hrefForDay) {
                      return (
                        <Link
                          key={day.key}
                          href={hrefForDay}
                          className="block min-h-0 min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.5)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]"
                        >
                          {content}
                        </Link>
                      );
                    }
                    return (
                      <div key={day.key} className="min-h-0 min-w-0 rounded-xl">
                        {content}
                      </div>
                    );
                  })}

                  <div
                    className={cn(
                      "relative box-border flex min-h-[86px] min-w-0 flex-col justify-between overflow-hidden rounded-lg p-2 text-left sm:min-h-[148px] sm:rounded-xl sm:p-4 lg:min-h-[160px] lg:p-4",
                      weekRailClasses(weekly),
                    )}
                  >
                    <div className={cn("absolute left-0 top-2 bottom-2 w-[2px] rounded-full sm:top-3 sm:bottom-3 sm:w-[3px] lg:w-1", weekAccent(weekly))} />
                    <div className="min-w-0 pl-2 sm:pl-3">
                      <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/45 sm:text-[9px] sm:tracking-[0.2em]">
                        Wk {i + 1}
                      </p>
                      <p className="mt-0.5 hidden font-mono text-[9px] tabular-nums text-white/70 sm:mt-1 sm:block sm:text-[10px]">
                        {weekDateRangeLabel(week)}
                      </p>
                    </div>
                    <div className="min-w-0 overflow-hidden pl-2 sm:pl-3">
                      <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/40 sm:text-[9px] sm:tracking-[0.2em]">
                        Σ
                      </p>
                      <p className="font-display text-[0.7rem] font-semibold leading-[1.1] tabular-nums tracking-[-0.03em] sm:text-[clamp(0.85rem,3.5vw,1.35rem)] sm:leading-none md:text-2xl lg:text-[clamp(1rem,2.8vw,1.85rem)] lg:tracking-[-0.045em]">
                        <span
                          className="block min-w-0 w-full truncate"
                          title={formatSignedPnlAmount(weekly, displayCurrency)}
                        >
                          {formatSignedPnlAmount(weekly, displayCurrency)}
                        </span>
                      </p>
                    </div>
                  </div>
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
