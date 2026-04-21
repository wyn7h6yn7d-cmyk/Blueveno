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
    <div className="space-y-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-2xl border border-white/[0.08] bg-[oklch(0.1_0.02_260/0.8)] p-4 ring-1 ring-white/[0.03]"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">{dayLabel(row)}</p>
              <p className="mt-1 text-lg font-medium text-zinc-100">{row.sym}</p>
            </div>
            <p className="font-mono text-base tabular-nums text-zinc-100">{row.r}</p>
          </div>

          {row.note ? <p className="mt-3 text-sm leading-relaxed text-zinc-400">{row.note}</p> : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {row.tag ? (
                <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                  {row.tag}
                </span>
              ) : null}
              {row.tradingViewUrl ? (
                <a
                  href={row.tradingViewUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-[11px] text-[oklch(0.8_0.1_248)] hover:underline"
                >
                  Open chart
                </a>
              ) : null}
            </div>

            <Link href={`/app/journal/${row.id}`} className="font-mono text-[11px] text-zinc-300 hover:underline">
              Open day detail
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
