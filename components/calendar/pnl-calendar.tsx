"use client";

import { useMemo, useState } from "react";
import { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { JournalRow } from "@/lib/user-data/types";
import { parseR } from "@/lib/user-data/kpi";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  entries: JournalRow[];
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

function money(v: number): string {
  const sign = v > 0 ? "+" : v < 0 ? "−" : "";
  return `${sign}$${Math.abs(v).toFixed(0)}`;
}

function toneClass(v: number): string {
  if (v > 0) return "border-emerald-400/35 bg-emerald-500/14 text-emerald-100";
  if (v < 0) return "border-rose-400/35 bg-rose-500/14 text-rose-100";
  return "border-white/[0.09] bg-white/[0.03] text-zinc-300";
}

function weekDateRangeLabel(week: DayCell[]): string {
  const start = week[0].date.getDate();
  const end = week[6].date.getDate();
  return `${String(start).padStart(2, "0")}–${String(end).padStart(2, "0")}`;
}

export function PnlCalendar({ entries }: Props) {
  const [cursor, setCursor] = useState(() => new Date());

  const aggregates = useMemo(() => {
    const map = new Map<string, DayAggregate>();
    for (const row of entries) {
      const key = row.entryDate ?? keyFromDate(row.createdAt ? new Date(row.createdAt) : new Date());
      const val = parseR(row.r) ?? 0;
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[oklch(0.62_0.11_252)]">Month</p>
          <p className="font-display mt-1 text-[1.45rem] font-semibold tracking-[-0.03em] text-zinc-50 sm:text-2xl">
            {monthLabel(cursor)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              "h-10 w-10 rounded-xl border-white/[0.11] bg-white/[0.035] hover:bg-white/[0.07]",
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
              "h-10 w-10 rounded-xl border-white/[0.11] bg-white/[0.035] hover:bg-white/[0.07]",
            )}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto overflow-y-visible pb-1 [scrollbar-gutter:stable]">
        <div className="min-w-[min(100%,840px)] rounded-2xl border border-[oklch(0.52_0.12_252/0.22)] bg-[linear-gradient(165deg,oklch(0.14_0.032_262/0.92),oklch(0.095_0.028_264/0.9))] p-3 shadow-[inset_0_1px_0_oklch(1_0_0_/0.05),0_24px_80px_-40px_rgba(0,0,0,0.65)] ring-1 ring-[oklch(0.52_0.12_252/0.08)] sm:min-w-[840px]">
          <div className="grid min-w-[min(100%,840px)] grid-cols-8 gap-1.5 sm:gap-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="px-1 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 sm:px-2">
                {d}
              </div>
            ))}
            <div className="px-1 py-1.5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.72_0.11_252)] sm:px-2">
              Week Σ
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
                  const dayClasses = hasData ? toneClass(agg!.total) : "border-white/[0.06] bg-white/[0.015] text-zinc-500";
                  const content = (
                    <div
                      className={cn(
                        "flex h-[102px] flex-col justify-between rounded-xl border p-2.5 transition duration-200",
                        dayClasses,
                        day.inMonth ? "" : "opacity-45",
                      )}
                    >
                      <p className="font-mono text-[11px]">{day.date.getDate()}</p>
                      {hasData ? (
                        <div className="text-right">
                          <div className="font-mono text-[15px] font-semibold tabular-nums">{money(agg!.total)}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-zinc-400">
                            {agg!.count} {agg!.count === 1 ? "entry" : "entries"}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="font-mono text-[13px] tabular-nums text-zinc-500">$0</div>
                          <div className="mt-0.5 font-mono text-[10px] text-zinc-600">no entries</div>
                        </div>
                      )}
                    </div>
                  );

                  if (hasData) {
                    return (
                      <Link key={day.key} href={`/app/journal?date=${encodeURIComponent(day.key)}`} className="block">
                        {content}
                      </Link>
                    );
                  }
                  return <div key={day.key}>{content}</div>;
                })}

                <div
                  className={cn(
                    "flex h-[102px] min-w-[5.5rem] flex-col items-center justify-center rounded-xl border p-2 text-center shadow-[inset_0_1px_0_oklch(1_0_0_/0.04)] sm:min-w-[6.25rem]",
                    toneClass(weekly),
                  )}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">W{i + 1}</p>
                  <p className="font-display mt-1 text-lg font-bold tabular-nums tracking-[-0.03em] sm:text-xl">{money(weekly)}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-zinc-500">{weekDateRangeLabel(week)}</p>
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
