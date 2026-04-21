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

/** Day cell: green / red / neutral with depth */
function dayCellClasses(total: number, hasData: boolean, inMonth: boolean): string {
  if (!hasData) {
    return cn(
      "border-white/[0.07] bg-[linear-gradient(165deg,oklch(0.1_0.02_264/0.55),oklch(0.065_0.02_268/0.45))] text-zinc-500",
      !inMonth && "opacity-40",
    );
  }
  if (total > 0) {
    return cn(
      "border-emerald-400/25 bg-[linear-gradient(155deg,oklch(0.22_0.08_155/0.35),oklch(0.1_0.04_160/0.25))] text-emerald-50",
      "shadow-[inset_0_1px_0_0_oklch(0.85_0.06_155/0.12)]",
      !inMonth && "opacity-55",
    );
  }
  if (total < 0) {
    return cn(
      "border-rose-400/22 bg-[linear-gradient(155deg,oklch(0.24_0.07_15/0.32),oklch(0.11_0.04_20/0.28))] text-rose-50",
      "shadow-[inset_0_1px_0_0_oklch(0.9_0.05_15/0.08)]",
      !inMonth && "opacity-55",
    );
  }
  return cn("border-white/[0.1] bg-white/[0.04] text-zinc-300", !inMonth && "opacity-45");
}

function weekRailClasses(total: number): string {
  if (total > 0) {
    return cn(
      "border-emerald-400/30 bg-[linear-gradient(160deg,oklch(0.2_0.07_155/0.4),oklch(0.09_0.03_160/0.35))] text-emerald-50",
      "shadow-[inset_0_1px_0_0_oklch(0.85_0.06_155/0.12)]",
    );
  }
  if (total < 0) {
    return cn(
      "border-rose-400/28 bg-[linear-gradient(160deg,oklch(0.22_0.06_15/0.38),oklch(0.1_0.03_18/0.32))] text-rose-50",
      "shadow-[inset_0_1px_0_0_oklch(0.9_0.04_15/0.08)]",
    );
  }
  return "border-white/[0.09] bg-[linear-gradient(165deg,oklch(0.12_0.035_262/0.5),oklch(0.085_0.03_266/0.45))] text-zinc-300";
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

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[oklch(0.62_0.11_252)]">Month</p>
          <p className="font-display text-[1.6rem] font-semibold tracking-[-0.035em] text-zinc-50 sm:text-[1.85rem]">
            {monthLabel(cursor)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "h-10 w-10 rounded-xl border-white/[0.11] bg-white/[0.035] hover:bg-white/[0.08]",
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
              "h-10 w-10 rounded-xl border-white/[0.11] bg-white/[0.035] hover:bg-white/[0.08]",
            )}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="w-full min-w-0 overflow-x-hidden pb-1">
        <div
          className={cn(
            "w-full min-w-0 rounded-2xl border border-[oklch(0.52_0.12_252/0.22)]",
            "bg-[linear-gradient(168deg,oklch(0.125_0.034_262/0.96),oklch(0.088_0.028_264/0.94))]",
            "p-2 shadow-[inset_0_1px_0_oklch(1_0_0_/0.05),0_28px_90px_-40px_rgba(0,0,0,0.65)] ring-1 ring-[oklch(0.52_0.12_252/0.1)] sm:p-3",
          )}
        >
          <div className="grid w-full min-w-0 grid-cols-8 gap-1.5 sm:gap-2.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="min-w-0 px-0.5 py-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500 sm:px-1 sm:text-[10px] sm:tracking-[0.18em]"
              >
                {d}
              </div>
            ))}
            <div className="min-w-0 px-0.5 py-2 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[oklch(0.72_0.11_252)] sm:px-1 sm:text-[10px] sm:tracking-[0.2em]">
              Week
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

                    const content = (
                      <div
                        className={cn(
                          "group relative flex min-h-[100px] min-w-0 flex-col justify-between rounded-xl border p-2 transition duration-200 sm:min-h-[118px] sm:p-3",
                          cellClasses,
                          hasData && "hover:ring-1 hover:ring-[oklch(0.55_0.12_252/0.35)]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={cn(
                              "font-mono text-[11px] tabular-nums",
                              hasData ? "text-white/75" : "text-zinc-500",
                            )}
                          >
                            {day.date.getDate()}
                          </span>
                          {hasData && agg!.count > 1 ? (
                            <span className="rounded-md bg-black/20 px-1.5 py-0.5 font-mono text-[9px] text-white/70">
                              {agg!.count}×
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0 text-right">
                          {hasData ? (
                            <>
                              <div className="break-words font-display text-[0.75rem] font-semibold leading-tight tabular-nums tracking-[-0.03em] sm:text-[1.05rem] md:text-[1.15rem]">
                                {formatSignedPnlAmount(agg!.total, displayCurrency)}
                              </div>
                              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
                                Day
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-mono text-[13px] tabular-nums text-zinc-600">—</div>
                              <div className="mt-1 font-mono text-[9px] text-zinc-600">No trade</div>
                            </>
                          )}
                        </div>
                      </div>
                    );

                    if (hasData) {
                      return (
                        <Link
                          key={day.key}
                          href={`/app/journal?date=${encodeURIComponent(day.key)}`}
                          className="block min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]"
                        >
                          {content}
                        </Link>
                      );
                    }
                    return (
                      <div key={day.key} className="min-w-0">
                        {content}
                      </div>
                    );
                  })}

                  <div
                    className={cn(
                      "relative flex min-h-[100px] min-w-0 flex-col justify-between overflow-hidden rounded-xl border p-2 text-left sm:min-h-[118px] sm:p-3",
                      weekRailClasses(weekly),
                    )}
                  >
                    <div className={cn("absolute left-0 top-2 bottom-2 w-[3px] rounded-full", weekAccent(weekly))} />
                    <div className="min-w-0 pl-1.5 sm:pl-2">
                      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/45 sm:text-[9px] sm:tracking-[0.2em]">
                        Wk {i + 1}
                      </p>
                      <p className="mt-0.5 font-mono text-[9px] text-white/70 sm:mt-1 sm:text-[10px]">{weekDateRangeLabel(week)}</p>
                    </div>
                    <div className="min-w-0 pl-1.5 sm:pl-2">
                      <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/40 sm:text-[9px] sm:tracking-[0.2em]">
                        Σ
                      </p>
                      <p className="break-words font-display text-[0.75rem] font-semibold leading-tight tabular-nums tracking-[-0.04em] sm:text-lg md:text-xl lg:text-2xl">
                        {formatSignedPnlAmount(weekly, displayCurrency)}
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
  );
}
