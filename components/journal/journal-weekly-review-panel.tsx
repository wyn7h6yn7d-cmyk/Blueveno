"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineFeedback } from "@/components/app/inline-feedback";
import { ReadOnlyBlockedNotice } from "@/components/access/read-only-blocked-notice";
import { DashboardCard } from "@/components/app/dashboard-card";
import { formatWeekHeadline } from "@/lib/user-data/week-labels";
import { appFormControl, appFormLabel } from "@/lib/ui/app-form";
import { cn } from "@/lib/utils";

type JournalWeeklyReviewPanelProps = {
  weekAnchorDate: string;
  onWeekAnchorDateChange: (value: string) => void;
  weekStartKey: string;
  weeklyWorked: string;
  onWeeklyWorkedChange: (value: string) => void;
  weeklySlipped: string;
  onWeeklySlippedChange: (value: string) => void;
  weeklyFocus: string;
  onWeeklyFocusChange: (value: string) => void;
  weeklyRule: string;
  onWeeklyRuleChange: (value: string) => void;
  weeklyConfidence: number | null;
  onWeeklyConfidenceChange: (value: number) => void;
  weeklyNote: string;
  onWeeklyNoteChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  canWriteJournal: boolean;
  weeklySaving: boolean;
  weeklyLoading: boolean;
  weeklyUnavailable: boolean;
  weeklySaved: boolean;
  weeklyMsg: string | null;
  activeAccountId: string | null;
  selectedEntryWeekStart?: string | null;
  onAlignWeekToEntry?: () => void;
};

const labelCls = appFormLabel;
const inputCls = appFormControl;

export function JournalWeeklyReviewPanel({
  weekAnchorDate,
  onWeekAnchorDateChange,
  weekStartKey,
  weeklyWorked,
  onWeeklyWorkedChange,
  weeklySlipped,
  onWeeklySlippedChange,
  weeklyFocus,
  onWeeklyFocusChange,
  weeklyRule,
  onWeeklyRuleChange,
  weeklyConfidence,
  onWeeklyConfidenceChange,
  weeklyNote,
  onWeeklyNoteChange,
  onSubmit,
  canWriteJournal,
  weeklySaving,
  weeklyLoading,
  weeklyUnavailable,
  weeklySaved,
  weeklyMsg,
  activeAccountId,
  selectedEntryWeekStart,
  onAlignWeekToEntry,
}: JournalWeeklyReviewPanelProps) {
  return (
    <div id="weekly-review">
    <DashboardCard
      eyebrow="Weekly review"
      title="Close the week"
      description="Capture what happened and set one rule for next week."
      className="min-w-0"
    >
      {selectedEntryWeekStart ? (
        <div className="mb-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <p className="text-[12px] text-zinc-400">
            Selected entry week:{" "}
            <span className="text-zinc-200">{formatWeekHeadline(selectedEntryWeekStart)}</span>
            {weekStartKey === selectedEntryWeekStart ? " · anchor aligned" : ""}
          </p>
          {weekStartKey !== selectedEntryWeekStart && onAlignWeekToEntry ? (
            <button type="button" className="mt-2 text-[12px] text-bv-ice hover:underline" onClick={onAlignWeekToEntry}>
              Align week anchor to selected entry
            </button>
          ) : null}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:items-center">
          <Label htmlFor="jr-week" className={labelCls}>
            Week anchor date
          </Label>
          <Input
            id="jr-week"
            type="date"
            value={weekAnchorDate}
            onChange={(e) => onWeekAnchorDateChange(e.target.value)}
            disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
            className={cn(inputCls, "disabled:opacity-45")}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="jr-worked" className={labelCls}>
              What worked?
            </Label>
            <textarea
              id="jr-worked"
              value={weeklyWorked}
              onChange={(e) => onWeeklyWorkedChange(e.target.value)}
              rows={4}
              disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
              className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jr-slipped" className={labelCls}>
              What slipped?
            </Label>
            <textarea
              id="jr-slipped"
              value={weeklySlipped}
              onChange={(e) => onWeeklySlippedChange(e.target.value)}
              rows={4}
              disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
              className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jr-focus" className={labelCls}>
              Next focus
            </Label>
            <textarea
              id="jr-focus"
              value={weeklyFocus}
              onChange={(e) => onWeeklyFocusChange(e.target.value)}
              rows={4}
              disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
              className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
            />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="jr-rule" className={cn(labelCls, "text-zinc-200")}>
              Rule for next week
            </Label>
            <textarea
              id="jr-rule"
              value={weeklyRule}
              onChange={(e) => onWeeklyRuleChange(e.target.value)}
              rows={2}
              placeholder="One non-negotiable rule for next week."
              disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
              className="w-full resize-none rounded-xl border border-[oklch(0.58_0.12_252/0.28)] bg-[oklch(0.11_0.03_266/0.6)] px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-500 disabled:opacity-45"
            />
          </div>
          <div className="space-y-2">
            <Label className={labelCls}>Confidence for next week</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => onWeeklyConfidenceChange(score)}
                  disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-full border text-[13px] font-semibold transition",
                    weeklyConfidence === score
                      ? "border-[oklch(0.62_0.12_252/0.65)] bg-[oklch(0.58_0.12_252/0.22)] text-zinc-100"
                      : "border-white/[0.12] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08]",
                  )}
                  aria-label={`Confidence score ${score}`}
                >
                  {score}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-zinc-500">1 = uncertain, 5 = very clear and committed.</p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="jr-note" className={labelCls}>
            Optional weekly note
          </Label>
          <textarea
            id="jr-note"
            value={weeklyNote}
            onChange={(e) => onWeeklyNoteChange(e.target.value)}
            rows={2}
            placeholder="Anything else worth carrying into next week."
            disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
            className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[14px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={!canWriteJournal || weeklySaving || weeklyLoading || weeklyUnavailable} className="h-10 rounded-xl px-4">
            {weeklySaving
              ? "Saving…"
              : weeklyLoading
                ? "Loading…"
                : weeklyUnavailable
                  ? "Weekly review unavailable"
                  : weeklySaved
                    ? "Update weekly review"
                    : "Save weekly review"}
          </Button>
          {weeklySaved && !weeklySaving && !weeklyLoading ? (
            <span
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-400/35 bg-[linear-gradient(180deg,oklch(0.22_0.09_160/0.4),oklch(0.16_0.08_160/0.28))] px-4 text-[13px] font-medium text-emerald-100"
              role="status"
            >
              <Check className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
              Saved for this week
            </span>
          ) : null}
          {!canWriteJournal ? <ReadOnlyBlockedNotice compact context="saving weekly reflections" /> : null}
          {canWriteJournal && weeklyUnavailable ? (
            <p className="text-[13px] text-zinc-500">Weekly review is not available yet.</p>
          ) : null}
          {canWriteJournal && !activeAccountId ? (
            <p className="text-[13px] text-zinc-500">Select an active account to save weekly review.</p>
          ) : null}
          <InlineFeedback message={weeklyMsg && !weeklySaved ? weeklyMsg : null} tone={weeklyMsg?.toLowerCase().includes("saved") ? "success" : "error"} />
        </div>
      </form>
    </DashboardCard>
    </div>
  );
}
