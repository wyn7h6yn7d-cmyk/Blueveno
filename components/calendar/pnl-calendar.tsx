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
  if (v > 0) return "border-emerald-400/30 bg-emerald-500/12 text-emerald-200";
  if (v < 0) return "border-rose-400/30 bg-rose-500/12 text-rose-200";
  return "border-white/[0.08] bg-white/[0.02] text-zinc-300";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">Calendar</p>
          <p className="font-display mt-1 text-2xl tracking-tight text-zinc-50">{monthLabel(cursor)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))}
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "border-white/[0.12] bg-white/[0.03]")}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))}
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "border-white/[0.12] bg-white/[0.03]")}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[oklch(0.1_0.02_260/0.75)] p-3 ring-1 ring-white/[0.03]">
        <div className="grid min-w-[840px] grid-cols-8 gap-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              {d}
            </div>
          ))}
          <div className="px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Week</div>

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
                        "flex h-[98px] flex-col justify-between rounded-xl border p-2.5 transition",
                        dayClasses,
                        day.inMonth ? "" : "opacity-45",
                      )}
                    >
                      <p className="font-mono text-[11px]">{day.date.getDate()}</p>
                      {hasData ? (
                        <div className="text-right">
                          <div className="font-mono text-[14px] font-semibold tabular-nums">{money(agg!.total)}</div>
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

                  if (agg?.latestEntryId) {
                    return (
                      <Link key={day.key} href={`/app/journal/${agg.latestEntryId}`} className="block">
                        {content}
                      </Link>
                    );
                  }
                  return <div key={day.key}>{content}</div>;
                })}

                <div
                  className={cn(
                    "flex h-[98px] flex-col items-center justify-center rounded-xl border p-2 text-center",
                    toneClass(weekly),
                  )}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-500">Week {i + 1}</p>
                  <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums">{money(weekly)}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-zinc-500">{weekDateRangeLabel(week)}</p>
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
