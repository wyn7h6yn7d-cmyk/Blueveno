"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { StatusPill } from "@/components/v2/data";
import { PnlCell } from "@/components/v2/tables";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { formatTradeDayLabel } from "@/lib/trades/map-trade-row";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import type { JournalRow } from "@/lib/user-data/types";
import { displaySessionLabel } from "@/lib/session";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

export type RelatedWeeklyReview = {
  weekLabel: string;
  whatWorked: string | null;
  whatSlipped: string | null;
  nextWeekFocus: string | null;
  nextWeekRule: string | null;
  confidenceScore: number | null;
};

type JournalEntryDetailPanelProps = {
  row: JournalRow;
  currency: string;
  userTimezone?: string | null;
  canWriteJournal?: boolean;
  weekReviewed?: boolean;
  weekLabel?: string;
  relatedWeeklyReview?: RelatedWeeklyReview | null;
  onOpenWeekReview?: () => void;
};

function DisciplineTile({ label, value }: { label: string; value: boolean | undefined }) {
  if (value === undefined) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] text-zinc-500">
        <p>{label}</p>
        <p className="mt-1">Not logged</p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 text-[12px]",
        value
          ? "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-100"
          : "border-rose-400/20 bg-rose-500/[0.06] text-rose-100",
      )}
    >
      <p>{label}</p>
      <p className="mt-1 font-medium text-zinc-100">{value ? "Yes" : "No"}</p>
    </div>
  );
}

function ContextPill({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value || value === "—" || value === "None") return null;
  return (
    <StatusPill tone="neutral" size="sm">
      <span className="text-zinc-500">{label}:</span> {value}
    </StatusPill>
  );
}

export function JournalEntryDetailPanel({
  row,
  currency,
  userTimezone,
  canWriteJournal = true,
  weekReviewed,
  weekLabel,
  relatedWeeklyReview,
  onOpenWeekReview,
}: JournalEntryDetailPanelProps) {
  const dayKey = dayKeyFromRow(row.entryDate, row.createdAt);
  const pnl = parsePnlAmount(row.r);
  const sessionLabel = displaySessionLabel(row, userTimezone);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-white/[0.08] bg-[linear-gradient(165deg,oklch(0.11_0.035_262/0.45),oklch(0.08_0.028_266/0.2))] px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Result summary</p>
            <h2 className="mt-1 font-display text-xl font-medium tracking-tight text-zinc-50">
              {row.sym?.trim() || "—"}
            </h2>
            <p className="mt-1 text-[13px] text-zinc-500">
              {formatTradeDayLabel(dayKey)} · {row.time || "Day close"}
            </p>
          </div>
          <PnlCell value={pnl} currency={currency} className="text-[20px]" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ContextPill label="Setup" value={String(row.setup ?? "")} />
        <ContextPill label="Mistake" value={row.tag ? String(row.tag) : null} />
        <ContextPill label="Session" value={sessionLabel} />
        <ContextPill label="Market" value={row.marketCondition} />
        {row.moodState ? (
          <StatusPill tone="info" size="sm">
            Mood: {row.moodState}
          </StatusPill>
        ) : null}
      </div>

      <div>
        <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">Behavior checklist</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <DisciplineTile label="Followed plan" value={row.followedPlan} />
          <DisciplineTile label="Respected stop" value={row.respectedStop} />
          <DisciplineTile label="No revenge" value={row.noRevengeTrade} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">Note</h3>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-200">
            {row.note?.trim() || "No note added."}
          </p>
        </article>
        <article className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">Lesson</h3>
          <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-zinc-200">
            {row.lessonLearned?.trim() || "No lesson added."}
          </p>
        </article>
      </div>

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">Linked chart</h3>
        {row.chartLinkUrl?.trim() ? (
          <a
            href={row.chartLinkUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(appSecondaryCta, "mt-3 inline-flex items-center gap-1.5")}
          >
            Open chart
            <ExternalLink className="size-3.5" />
          </a>
        ) : (
          <p className="mt-2 text-[13px] text-zinc-600">No chart linked to this entry.</p>
        )}
      </div>

      {weekLabel ? (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-500">Weekly review</h3>
              <StatusPill tone={weekReviewed ? "success" : "neutral"} size="sm">
                {weekReviewed ? "Reviewed" : "Not reviewed"}
              </StatusPill>
            </div>
            {onOpenWeekReview ? (
              <button type="button" onClick={onOpenWeekReview} className="text-[12px] text-bv-ice hover:underline">
                Open weekly review
              </button>
            ) : null}
          </div>
          {relatedWeeklyReview ? (
            <div className="mt-3 space-y-3 text-[13px] leading-relaxed text-zinc-300">
              <p className="text-[12px] text-zinc-500">{relatedWeeklyReview.weekLabel}</p>
              {relatedWeeklyReview.whatWorked ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-emerald-400/80">What worked</p>
                  <p className="mt-1">{relatedWeeklyReview.whatWorked}</p>
                </div>
              ) : null}
              {relatedWeeklyReview.whatSlipped ? (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.08em] text-amber-400/80">What slipped</p>
                  <p className="mt-1">{relatedWeeklyReview.whatSlipped}</p>
                </div>
              ) : null}
              {relatedWeeklyReview.nextWeekFocus ? (
                <p>
                  <span className="text-zinc-500">Next focus:</span> {relatedWeeklyReview.nextWeekFocus}
                </p>
              ) : null}
              {relatedWeeklyReview.nextWeekRule ? (
                <p>
                  <span className="text-zinc-500">Rule:</span> {relatedWeeklyReview.nextWeekRule}
                </p>
              ) : null}
              {relatedWeeklyReview.confidenceScore !== null ? (
                <p>
                  <span className="text-zinc-500">Confidence:</span> {relatedWeeklyReview.confidenceScore}/5
                </p>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-[13px] text-zinc-600">No weekly reflection saved for this entry&apos;s week yet.</p>
          )}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
        {canWriteJournal ? (
          <Link href={`/app/journal/${row.id}/edit`} className={cn(appSecondaryCta, "inline-flex items-center gap-1.5")}>
            <Pencil className="size-3.5" />
            Edit entry
          </Link>
        ) : null}
        <Link href={`/app/trades/${row.id}`} className={appSecondaryCta}>
          Open in Trades
        </Link>
        <Link href={`/app/journal/${row.id}`} className="text-[12px] text-zinc-500 hover:text-zinc-300">
          Full journal view
        </Link>
      </div>
    </div>
  );
}
