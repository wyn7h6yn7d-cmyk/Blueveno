"use client";

import Link from "next/link";
import type { JournalRow } from "@/lib/user-data/types";

type Props = {
  rows: JournalRow[];
};

function dayLabel(row: JournalRow): string {
  if (row.entryDate) return row.entryDate;
  if (row.createdAt) return new Date(row.createdAt).toISOString().slice(0, 10);
  return "—";
}

export function JournalDayList({ rows }: Props) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition-colors hover:border-white/[0.1] hover:bg-white/[0.025]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{dayLabel(row)}</p>
              <p className="mt-1.5 font-display text-[1.05rem] font-medium tracking-tight text-zinc-100">{row.sym}</p>
            </div>
            <p className="font-mono text-[15px] tabular-nums tracking-tight text-zinc-100">{row.r}</p>
          </div>

          {row.note ? <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">{row.note}</p> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {row.tag ? (
                <span className="rounded border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                  {row.tag}
                </span>
              ) : null}
              {row.tradingViewUrl ? (
                <a
                  href={row.tradingViewUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[11px] text-[oklch(0.78_0.1_250)] underline-offset-4 hover:underline"
                >
                  Chart
                </a>
              ) : null}
            </div>

            <Link
              href={`/app/journal/${row.id}`}
              className="font-mono text-[11px] text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline"
            >
              Details
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
