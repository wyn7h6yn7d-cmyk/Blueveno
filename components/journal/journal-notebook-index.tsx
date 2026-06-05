"use client";

import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/v2/data";

type JournalNotebookIndexProps = {
  rows: JournalRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  displayCurrency: string;
  highlightDate?: string;
};

function dayKey(row: JournalRow): string {
  if (row.entryDate) return row.entryDate;
  if (row.createdAt) return new Date(row.createdAt).toISOString().slice(0, 10);
  return "";
}

function formatDayLabel(dayKey: string): string {
  if (!dayKey) return "—";
  const date = new Date(`${dayKey}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(date);
}

function notePreview(note: string | undefined, max = 72): string {
  const text = note?.trim() ?? "";
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function JournalNotebookIndex({
  rows,
  selectedId,
  onSelect,
  displayCurrency,
  highlightDate,
}: JournalNotebookIndexProps) {
  return (
    <div className="blueveno-scrollbar max-h-[min(28rem,55vh)] space-y-2 overflow-y-auto pr-0.5 lg:max-h-none lg:overflow-visible lg:pr-0">
      {rows.map((row) => {
        const key = dayKey(row);
        const pnl = parsePnlAmount(row.r);
        const pnlLabel = pnl !== null ? formatSignedPnlAmount(pnl, displayCurrency) : row.r?.trim() || "—";
        const selected = row.id === selectedId;
        const preview = notePreview(row.note);

        return (
          <button
            key={row.id}
            type="button"
            onClick={() => onSelect(row.id)}
            data-journal-date={key}
            className={cn(
              "relative w-full rounded-xl border px-3.5 py-3 text-left transition-[border-color,background,box-shadow]",
              selected
                ? "border-bv-blue-accent/45 bg-bv-blue-accent/10 shadow-[inset_3px_0_0_0_oklch(0.62_0.13_252/0.85),inset_0_0_0_1px_oklch(0.55_0.12_252/0.22)]"
                : "border-white/[0.09] bg-white/[0.025] hover:border-white/[0.15] hover:bg-white/[0.04]",
              highlightDate && key === highlightDate && !selected && "ring-1 ring-bv-blue-accent/30",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">{formatDayLabel(key)}</p>
                <p className="mt-0.5 truncate font-medium text-zinc-100">{row.sym?.trim() || "—"}</p>
              </div>
              <p
                className={cn(
                  "shrink-0 font-mono text-[12px] tabular-nums",
                  pnl !== null && pnl > 0 ? "text-emerald-200" : pnl !== null && pnl < 0 ? "text-rose-200" : "text-zinc-300",
                )}
              >
                {pnlLabel}
              </p>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {row.setup ? (
                <StatusPill tone="neutral" size="sm">
                  {String(row.setup)}
                </StatusPill>
              ) : null}
              {row.moodState ? (
                <StatusPill tone="info" size="sm">
                  {row.moodState}
                </StatusPill>
              ) : null}
              {row.tag && row.tag !== "None" ? (
                <StatusPill tone="warning" size="sm">
                  {row.tag}
                </StatusPill>
              ) : null}
            </div>

            {preview ? (
              <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-zinc-500">{preview}</p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
