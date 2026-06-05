"use client";

import Link from "next/link";
import { ExternalLink, Pencil } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { InsightCard } from "@/components/v2/cards/insight-card";
import { LabelValueRow } from "@/components/v2";
import { StatusPill } from "@/components/v2/data";
import { PnlCell } from "@/components/v2/tables";
import type { TradeRow } from "@/lib/trades/map-trade-row";
import {
  buildTradeComparisonInsight,
  findWeeklyReflectionForEntry,
  type WeeklyReflectionContext,
} from "@/lib/trades/trade-insights";
import { buildTradeRuleAdherence, type PersonalRuleRef } from "@/lib/trades/trade-rule-adherence";
import type { JournalRow } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type TradeEntryDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trade: TradeRow | null;
  currency: string;
  siblings: JournalRow[];
  weeklyReflections: Array<{
    week_start: string;
    what_worked?: string | null;
    what_slipped?: string | null;
    next_week_focus?: string | null;
    next_week_rule?: string | null;
    confidence_score?: number | null;
  }>;
  personalRules?: PersonalRuleRef[];
  canWriteJournal?: boolean;
};

function DisciplineCheck({ label, value }: { label: string; value: boolean | undefined }) {
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

function RuleList({ title, items, tone }: { title: string; items: string[]; tone: "success" | "warning" | "neutral" }) {
  if (items.length === 0) return null;
  const pillTone = tone;
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-zinc-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <StatusPill key={item} tone={pillTone} size="sm">
            {item}
          </StatusPill>
        ))}
      </div>
    </div>
  );
}

function WeeklyContextBlock({ context }: { context: WeeklyReflectionContext }) {
  return (
    <div className="space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[12px] font-medium text-zinc-200">{context.weekLabel}</p>
        {context.confidenceScore !== null ? (
          <StatusPill tone="info" size="sm">
            Confidence {context.confidenceScore}/5
          </StatusPill>
        ) : null}
      </div>
      {context.whatWorked ? (
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">What worked</p>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-300">{context.whatWorked}</p>
        </div>
      ) : null}
      {context.whatSlipped ? (
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">What slipped</p>
          <p className="mt-1 text-[13px] leading-relaxed text-zinc-300">{context.whatSlipped}</p>
        </div>
      ) : null}
      {context.nextWeekFocus ? (
        <LabelValueRow label="Next focus" value={context.nextWeekFocus} dense align="stack" />
      ) : null}
      {context.nextWeekRule ? (
        <LabelValueRow label="Weekly rule" value={context.nextWeekRule} dense align="stack" />
      ) : null}
    </div>
  );
}

export function TradeEntryDrawer({
  open,
  onOpenChange,
  trade,
  currency,
  siblings,
  weeklyReflections,
  personalRules = [],
  canWriteJournal = true,
}: TradeEntryDrawerProps) {
  if (!trade) return null;

  const comparison = buildTradeComparisonInsight(trade.source, siblings, currency);
  const weekContext = findWeeklyReflectionForEntry(trade.source, weeklyReflections);
  const ruleAdherence = buildTradeRuleAdherence(trade.source, personalRules);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full max-w-md flex-col border-white/[0.08] bg-bv-surface p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-white/[0.06] px-5 py-4 text-left">
          <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Trade review</p>
          <SheetTitle className="font-display text-lg font-medium tracking-tight text-zinc-50">
            {trade.symbol} · {trade.entryDateLabel}
          </SheetTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PnlCell value={trade.pnl} currency={currency} className="text-[18px]" />
            {trade.disciplineScore !== null ? (
              <StatusPill tone={trade.disciplineScore >= 70 ? "success" : trade.disciplineScore < 50 ? "warning" : "neutral"} size="sm">
                Discipline {trade.disciplineScore}%
              </StatusPill>
            ) : null}
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-2 gap-3">
            <LabelValueRow label="Date" value={trade.entryDateLabel} dense align="stack" />
            <LabelValueRow label="Account" value={trade.accountName} dense align="stack" />
            <LabelValueRow label="Setup" value={trade.setup} dense align="stack" />
            <LabelValueRow label="Session" value={trade.session ?? "—"} dense align="stack" />
            <LabelValueRow label="Mood" value={trade.mood ?? "—"} dense align="stack" />
            <LabelValueRow label="Mistake" value={trade.mistakeTag ?? "—"} dense align="stack" />
            <LabelValueRow label="Market" value={trade.marketCondition ?? "—"} dense align="stack" />
          </div>

          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.08em] text-zinc-500">Discipline checks</p>
            <div className="grid grid-cols-3 gap-2">
              <DisciplineCheck label="Followed plan" value={trade.followedPlan} />
              <DisciplineCheck label="Respected stop" value={trade.respectedStop} />
              <DisciplineCheck label="No revenge" value={trade.noRevengeTrade} />
            </div>
          </div>

          {personalRules.length > 0 ? (
            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">Personal rules</p>
              <RuleList title="Followed" items={ruleAdherence.followed} tone="success" />
              <RuleList title="Broken" items={ruleAdherence.broken} tone="warning" />
              {ruleAdherence.followed.length === 0 && ruleAdherence.broken.length === 0 ? (
                <p className="text-[12px] text-zinc-500">No personal rule checks logged on this entry.</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-3">
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

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-[10px] uppercase tracking-[0.08em] text-zinc-500">Chart link</p>
            {trade.chartLinkUrl ? (
              <a
                href={trade.chartLinkUrl}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(appSecondaryCta, "mt-3 inline-flex items-center gap-1.5")}
              >
                Open chart
                <ExternalLink className="size-3.5" />
              </a>
            ) : (
              <p className="mt-2 text-[12px] text-zinc-500">No chart linked.</p>
            )}
          </div>

          {comparison ? (
            <InsightCard title={comparison.title} body={comparison.body} severity="info" tag="Comparison" />
          ) : null}

          {weekContext ? <WeeklyContextBlock context={weekContext} /> : null}
        </div>

        <div className="flex gap-2 border-t border-white/[0.06] px-5 py-4">
          <Link href={`/app/trades/${trade.id}`} className={cn(appSecondaryCta, "flex-1 justify-center")}>
            Full detail
          </Link>
          {canWriteJournal ? (
            <Link
              href={`/app/journal/${trade.id}/edit`}
              className={cn(appSecondaryCta, "inline-flex items-center justify-center gap-1.5")}
            >
              <Pencil className="size-3.5" />
              Edit
            </Link>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
