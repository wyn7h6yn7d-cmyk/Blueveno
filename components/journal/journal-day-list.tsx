"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { JournalRow } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
  rows: JournalRow[];
  highlightDate?: string;
  displayCurrency: string;
  expandNotes?: boolean;
  /** When false, edit form is read-only — link still opens the edit page with upgrade copy. */
  canWriteJournal?: boolean;
  /** Deletes the row in Supabase and updates local workspace state. */
  onDeleteRow?: (id: string) => Promise<{ ok: boolean; error?: string }>;
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
  onDeleteRow,
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
          onDeleteRow={onDeleteRow}
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
  onDeleteRow,
}: {
  row: JournalRow;
  highlightDate?: string;
  displayCurrency: string;
  expandNotes: boolean;
  canWriteJournal: boolean;
  onDeleteRow?: (id: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!onDeleteRow) return;
    setDeleteError(null);
    setDeleting(true);
    const result = await onDeleteRow(row.id);
    setDeleting(false);
    if (!result.ok) {
      setDeleteError(result.error ?? "Could not delete the journal entry.");
      return;
    }
    setConfirmOpen(false);
  };

  return (
    <>
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
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{dayLabel(row)}</p>
            <p className="mt-1 font-display text-[1.02rem] font-medium tracking-tight text-zinc-100">{row.sym}</p>
          </div>
          <p className="font-mono text-[15px] tabular-nums tracking-tight text-zinc-100">
            {formatRowPnl(row.r, displayCurrency)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {row.moodState ? (
            <span className="rounded border border-[oklch(0.52_0.12_252/0.3)] bg-[oklch(0.16_0.06_262/0.65)] px-2 py-0.5 font-mono text-[10px] text-zinc-300">
              {row.moodState}
            </span>
          ) : null}
          <span className="font-mono text-[10px] text-zinc-500">
            Discipline {Number(Boolean(row.followedPlan)) + Number(Boolean(row.respectedStop)) + Number(Boolean(row.noRevengeTrade))}/3
          </span>
          {row.chartLinkUrl ? (
            <a
              href={row.chartLinkUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[11px] text-[oklch(0.78_0.1_250)] underline-offset-4 hover:underline"
            >
              Chart
            </a>
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
              className="inline-flex h-8 items-center rounded-lg px-2.5 font-mono text-[11px] text-zinc-400 underline-offset-4 transition hover:text-zinc-200 hover:underline"
            >
              Open entry
            </Link>
          </div>

          {canWriteJournal && onDeleteRow ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]"
                aria-label="Open entry actions"
              >
                <MoreHorizontal className="size-4" strokeWidth={1.8} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="min-w-[10rem] rounded-xl border border-white/[0.09] bg-[oklch(0.125_0.028_262)] p-1.5 text-zinc-100 shadow-bv-float ring-1 ring-white/[0.04]"
              >
                <DropdownMenuItem
                  className="cursor-pointer rounded-lg px-2.5 py-2 text-[13px] text-rose-200 outline-none focus-visible:bg-rose-500/[0.2]"
                  onClick={() => setConfirmOpen(true)}
                  disabled={deleting}
                >
                  <Trash2 className="mr-2 size-4 text-rose-300" />
                  {deleting ? "Deleting…" : "Delete entry"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        {deleteError ? (
          <p className="mt-2 text-[12px] text-rose-300/95" role="alert">
            {deleteError}
          </p>
        ) : null}
      </article>
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => {
          if (deleting) return;
          setConfirmOpen(false);
        }}
        onConfirm={() => void handleDelete()}
        destructive
        pending={deleting}
        title="Delete journal entry?"
        description="This action is permanent and cannot be undone."
        confirmLabel="Delete entry"
      />
    </>
  );
}
