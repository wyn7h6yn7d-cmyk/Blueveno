"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil } from "lucide-react";
import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { entryDisciplineFraction } from "@/lib/user-data/stats-display";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  rows: JournalRow[];
  highlightDate?: string;
  displayCurrency: string;
  expandNotes?: boolean;
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
  expandNotes = false,
  canWriteJournal = true,
}: Props) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <JournalDayCard
          key={row.id}
          row={row}
          highlightDate={highlightDate}
          displayCurrency={displayCurrency}
          expandNotes={expandNotes}
          canWriteJournal={canWriteJournal}
        />
      ))}
    </div>
  );
}

function JournalDayCard({
  row,
  highlightDate,
  displayCurrency,
  expandNotes,
  canWriteJournal,
}: {
  row: JournalRow;
  highlightDate?: string;
  displayCurrency: string;
  expandNotes: boolean;
  canWriteJournal: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyChartLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article
      data-journal-date={rowDateKey(row)}
      className={cn(
        "rounded-xl border bg-white/[0.02] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition-colors hover:border-white/[0.1] hover:bg-white/[0.025]",
        highlightDate && rowDateKey(row) === highlightDate
          ? "border-[oklch(0.58_0.12_252/0.55)] ring-1 ring-[oklch(0.55_0.12_252/0.35)]"
          : "border-white/[0.08]",
      )}
    >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="app-metric-label">{dayLabel(row)}</p>
            <p className="mt-1 font-display text-[1.02rem] font-medium tracking-tight text-zinc-100">{row.sym}</p>
          </div>
          <p className="font-mono text-[15px] tabular-nums tracking-tight text-zinc-100">
            {formatRowPnl(row.r, displayCurrency)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded border border-white/[0.1] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
            {row.setup || "Other"}
          </span>
          {row.tag ? (
            <span className="rounded border border-white/[0.08] bg-black/20 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
              Mistake: {row.tag}
            </span>
          ) : null}
          {row.moodState ? (
            <span className="rounded border border-[oklch(0.52_0.12_252/0.3)] bg-[oklch(0.16_0.06_262/0.65)] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
              {row.moodState}
            </span>
          ) : null}
          <span className="font-mono text-[10px] text-zinc-500">
            Discipline {entryDisciplineFraction(row)}
          </span>
          {row.chartLinkUrl ? (
            <span className="rounded border border-[oklch(0.58_0.12_252/0.35)] bg-[oklch(0.58_0.12_252/0.16)] px-2 py-0.5 font-mono text-[10px] text-zinc-200">
              Linked chart
            </span>
          ) : null}
        </div>

        {row.note ? (
          <p
            className={cn(
              "mt-3 text-[13px] leading-relaxed text-zinc-400",
              expandNotes ? "whitespace-pre-wrap break-words" : "line-clamp-2",
            )}
          >
            {row.note}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/app/journal/${row.id}/edit`}
              prefetch
              title={canWriteJournal ? "Edit entry" : "Read-only — upgrade to edit entries"}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 rounded-lg border-white/[0.12] bg-white/[0.03] px-3 text-[12px] font-medium text-zinc-200 hover:bg-white/[0.06]",
              )}
            >
              <Pencil className="mr-1.5 size-3.5 opacity-90" strokeWidth={1.75} />
              Edit
            </Link>
            <Link
              href={`/app/journal/${row.id}`}
              prefetch
              className="inline-flex h-8 items-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 font-mono text-[11px] text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-100"
            >
              Open entry
            </Link>
            {row.chartLinkUrl ? (
              <>
                <a
                  href={row.chartLinkUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-8 items-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 font-mono text-[11px] text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-100"
                >
                  Open chart
                </a>
                <button
                  type="button"
                  onClick={() => void copyChartLink(row.chartLinkUrl!)}
                  className="inline-flex h-8 items-center rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 font-mono text-[11px] text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-100"
                >
                  {copied ? "Copied" : "Copy link"}
                </button>
              </>
            ) : null}
          </div>
        </div>
    </article>
  );
}
