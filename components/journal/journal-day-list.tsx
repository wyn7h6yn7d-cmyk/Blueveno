"use client";

import Link from "next/link";
import { LayoutDashboard, Pencil } from "lucide-react";
import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  rows: JournalRow[];
  highlightDate?: string;
  displayCurrency: string;
  /** When false, edit form is read-only — link still opens the edit page with upgrade copy. */
  canWriteJournal?: boolean;
};

function formatRowPnl(raw: string, currency: string): string {
  const n = parsePnlAmount(raw);
  if (n !== null) return formatSignedPnlAmount(n, currency);
  return raw.trim() || "—";
}

function dayLabel(row: JournalRow): string {
  if (row.entryDate) return row.entryDate;
  if (row.createdAt) return new Date(row.createdAt).toISOString().slice(0, 10);
  return "—";
}

/** YYYY-MM-DD for matching calendar ?date= links */
function rowDateKey(row: JournalRow): string {
  if (row.entryDate) return row.entryDate;
  if (row.createdAt) return new Date(row.createdAt).toISOString().slice(0, 10);
  return "";
}

export function JournalDayList({
  rows,
  highlightDate,
  displayCurrency,
  canWriteJournal = true,
}: Props) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <article
          key={row.id}
          data-journal-date={rowDateKey(row)}
          className={cn(
            "rounded-xl border bg-white/[0.02] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition-colors hover:border-white/[0.1] hover:bg-white/[0.025]",
            highlightDate && rowDateKey(row) === highlightDate
              ? "border-[oklch(0.58_0.12_252/0.55)] ring-1 ring-[oklch(0.55_0.12_252/0.35)]"
              : "border-white/[0.08]",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{dayLabel(row)}</p>
              <p className="mt-1.5 font-display text-[1.05rem] font-medium tracking-tight text-zinc-100">{row.sym}</p>
            </div>
            <p className="font-mono text-[15px] tabular-nums tracking-tight text-zinc-100">
              {formatRowPnl(row.r, displayCurrency)}
            </p>
          </div>

          {row.note ? <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">{row.note}</p> : null}

          <div className="mt-4 space-y-3 border-t border-white/[0.05] pt-4">
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

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/app"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-3.5 text-[12px] font-medium text-zinc-300 hover:bg-white/[0.06]",
                )}
              >
                <LayoutDashboard className="mr-1.5 size-3.5 opacity-90" strokeWidth={1.75} />
                Overview
              </Link>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/app/journal/${row.id}/edit`}
                  prefetch
                  title={
                    canWriteJournal
                      ? "Edit entry — add notes or a TradingView link"
                      : "Read-only — upgrade to edit entries"
                  }
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-[oklch(0.78_0.1_250)] underline-offset-4 transition hover:text-[oklch(0.85_0.08_250)] hover:underline"
                >
                  <Pencil className="size-3" strokeWidth={2} aria-hidden />
                  Edit
                </Link>
                <Link
                  href={`/app/journal/${row.id}`}
                  prefetch
                  className="font-mono text-[11px] text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
