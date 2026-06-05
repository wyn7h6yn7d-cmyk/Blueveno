"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Pencil } from "lucide-react";
import { ReadOnlyBlockedNotice } from "@/components/access/read-only-blocked-notice";
import { PageHeader } from "@/components/v2/layout";
import { SectionCard, InsightCard } from "@/components/v2/cards";
import { LabelValueRow, StatStrip } from "@/components/v2";
import { StatusPill } from "@/components/v2/data";
import { EmptyState } from "@/components/v2/design-system";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { compareJournalRecency } from "@/lib/user-data/journal-metrics";
import { mapJournalRowToTradeRow, type TradeAccountLookup } from "@/lib/trades/map-trade-row";
import {
  buildTradeComparisonInsight,
  findWeeklyReflectionForEntry,
} from "@/lib/trades/trade-insights";
import { buildTradeRuleAdherence, type PersonalRuleRef } from "@/lib/trades/trade-rule-adherence";
import type { JournalRow } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type TradeDetailViewProps = {
  entry: JournalRow;
  siblings: JournalRow[];
  currency: string;
  weeklyReflections: Array<{
    week_start: string;
    what_worked?: string | null;
    what_slipped?: string | null;
    next_week_focus?: string | null;
    next_week_rule?: string | null;
    confidence_score?: number | null;
  }>;
  personalRules?: PersonalRuleRef[];
  accountLookup?: TradeAccountLookup;
  canWriteJournal?: boolean;
  userTimezone?: string | null;
};

function DisciplineTile({ label, value }: { label: string; value: boolean | undefined }) {
  if (value === undefined) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-[12px] text-zinc-500">
        <p>{label}</p>
        <p className="mt-1.5">Not logged</p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3 text-[12px]",
        value
          ? "border-emerald-400/25 bg-emerald-500/[0.08] text-emerald-100"
          : "border-rose-400/20 bg-rose-500/[0.06] text-rose-100",
      )}
    >
      <p>{label}</p>
      <p className="mt-1.5 font-medium text-zinc-100">{value ? "Yes" : "No"}</p>
    </div>
  );
}

function RulePills({ title, items, tone }: { title: string; items: string[]; tone: "success" | "warning" }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-zinc-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <StatusPill key={item} tone={tone} size="sm">
            {item}
          </StatusPill>
        ))}
      </div>
    </div>
  );
}

export function TradeDetailView({
  entry,
  siblings,
  currency,
  weeklyReflections,
  personalRules = [],
  accountLookup,
  canWriteJournal = true,
  userTimezone,
}: TradeDetailViewProps) {
  const router = useRouter();
  const trade = useMemo(
    () => mapJournalRowToTradeRow(entry, currency, accountLookup, userTimezone),
    [entry, currency, accountLookup, userTimezone],
  );
  const comparison = buildTradeComparisonInsight(entry, siblings, currency);
  const weekContext = findWeeklyReflectionForEntry(entry, weeklyReflections);
  const ruleAdherence = buildTradeRuleAdherence(entry, personalRules);

  const ordered = [...siblings].sort(compareJournalRecency);
  const currentIdx = ordered.findIndex((r) => r.id === entry.id);
  const prevEntry = currentIdx > 0 ? ordered[currentIdx - 1] : null;
  const nextEntry = currentIdx >= 0 && currentIdx < ordered.length - 1 ? ordered[currentIdx + 1] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Trade detail"
        title={`${trade.symbol} · ${trade.entryDateLabel}`}
        description={`${trade.accountName} · ${trade.entryTime}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/app/trades" className={appSecondaryCta}>
              <ArrowLeft className="mr-1.5 size-3.5" />
              All trades
            </Link>
            {canWriteJournal ? (
              <Link href={`/app/journal/${entry.id}/edit`} className={appSecondaryCta}>
                <Pencil className="mr-1.5 size-3.5" />
                Edit entry
              </Link>
            ) : null}
          </div>
        }
      />

      {!canWriteJournal ? <ReadOnlyBlockedNotice compact context="editing entries" /> : null}

      <StatStrip
        items={[
          {
            id: "pnl",
            label: "P&L",
            value: trade.pnl !== null ? formatSignedPnlAmount(trade.pnl, currency) : trade.pnlLabel,
            tone: trade.resultType === "win" ? "positive" : trade.resultType === "loss" ? "negative" : "neutral",
          },
          { id: "mood", label: "Mood", value: trade.mood ?? "—", tone: "neutral" },
          { id: "setup", label: "Setup", value: trade.setup, tone: "neutral" },
          {
            id: "disc",
            label: "Discipline",
            value: trade.disciplineScore !== null ? `${trade.disciplineScore}%` : "—",
            tone:
              trade.disciplineScore !== null && trade.disciplineScore >= 70
                ? "positive"
                : trade.disciplineScore !== null && trade.disciplineScore < 50
                  ? "caution"
                  : "neutral",
          },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard eyebrow="Context" title="Trade metadata">
          <div className="space-y-2">
            <LabelValueRow label="Date" value={trade.entryDateLabel} dense />
            <LabelValueRow label="Account" value={trade.accountName} dense />
            <LabelValueRow label="Symbol" value={trade.symbol} dense />
            <LabelValueRow label="Setup" value={trade.setup} dense />
            <LabelValueRow label="Mistake" value={trade.mistakeTag ?? "—"} dense />
            <LabelValueRow label="Mood" value={trade.mood ?? "—"} dense />
            <LabelValueRow label="Session" value={trade.session ?? "—"} dense />
            <LabelValueRow label="Market condition" value={trade.marketCondition ?? "—"} dense />
          </div>
        </SectionCard>

        <SectionCard eyebrow="Behavior" title="Discipline checks">
          <div className="grid gap-2 sm:grid-cols-3">
            <DisciplineTile label="Followed plan" value={trade.followedPlan} />
            <DisciplineTile label="Respected stop" value={trade.respectedStop} />
            <DisciplineTile label="No revenge" value={trade.noRevengeTrade} />
          </div>
        </SectionCard>
      </div>

      {personalRules.length > 0 ? (
        <SectionCard eyebrow="Rules" title="Personal rule adherence">
          <div className="space-y-4">
            <RulePills title="Followed" items={ruleAdherence.followed} tone="success" />
            <RulePills title="Broken" items={ruleAdherence.broken} tone="warning" />
            {ruleAdherence.followed.length === 0 && ruleAdherence.broken.length === 0 ? (
              <p className="text-[13px] text-zinc-500">No personal rule checks logged on this entry.</p>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard eyebrow="Journal" title="Note & lesson">
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">Note</p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
              {trade.note?.trim() || "No note added."}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">Lesson</p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
              {trade.lessonLearned?.trim() || "No lesson added."}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Chart" title="Linked chart">
        {trade.chartLinkUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            <a href={trade.chartLinkUrl} target="_blank" rel="noreferrer noopener" className={appSecondaryCta}>
              Open chart
              <ExternalLink className="ml-1.5 size-3.5" />
            </a>
          </div>
        ) : (
          <EmptyState
            title="No chart linked"
            description="Add a chart URL when editing this entry to keep visual context alongside the result."
            compact
          />
        )}
      </SectionCard>

      {comparison ? (
        <SectionCard eyebrow="Insight" title="Quick comparison">
          <InsightCard title={comparison.title} body={comparison.body} severity="info" tag="Pattern" />
        </SectionCard>
      ) : null}

      {weekContext ? (
        <SectionCard eyebrow="Weekly review" title={weekContext.weekLabel}>
          <div className="space-y-4">
            {weekContext.whatWorked ? (
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] text-emerald-400/80">What worked</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{weekContext.whatWorked}</p>
              </div>
            ) : null}
            {weekContext.whatSlipped ? (
              <div>
                <p className="text-[10px] uppercase tracking-[0.08em] text-amber-400/80">What slipped</p>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{weekContext.whatSlipped}</p>
              </div>
            ) : null}
            {!weekContext.whatWorked && !weekContext.whatSlipped ? (
              <p className="text-[13px] text-zinc-500">No weekly reflection notes for this trade&apos;s week.</p>
            ) : null}
          </div>
        </SectionCard>
      ) : null}

      {(prevEntry || nextEntry) && (
        <SectionCard eyebrow="Navigate" title="Adjacent entries">
          <div className="flex flex-wrap gap-2">
            {prevEntry ? (
              <button
                type="button"
                onClick={() => router.push(`/app/trades/${prevEntry.id}`)}
                className={appSecondaryCta}
              >
                <ArrowLeft className="mr-1.5 size-3.5" />
                Previous
              </button>
            ) : null}
            {nextEntry ? (
              <button
                type="button"
                onClick={() => router.push(`/app/trades/${nextEntry.id}`)}
                className={appSecondaryCta}
              >
                Next
                <ArrowRight className="ml-1.5 size-3.5" />
              </button>
            ) : null}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
