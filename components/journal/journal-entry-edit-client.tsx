"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { chartUrlForSave, isValidChartUrl, normalizeChartUrlInput } from "@/lib/chart-link";
import { useAccess } from "@/components/access/access-provider";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import {
  MARKET_CONDITION_OPTIONS,
  MISTAKE_TAG_OPTIONS,
  SESSION_TAG_OPTIONS,
  SETUP_TAG_OPTIONS,
} from "@/lib/user-data/journal-tags";
import { createClient } from "@/lib/supabase/client";

const labelCls = "text-[12px] font-medium tracking-wide text-zinc-400";
const inputCls =
  "h-11 rounded-xl border-white/[0.1] bg-black/25 text-[15px] shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] placeholder:text-zinc-600 focus-visible:ring-[oklch(0.55_0.12_252/0.35)]";
const MOOD_OPTIONS = ["Calm", "Focused", "Hesitant", "Tilted"] as const;

type Props = {
  userId: string;
  entryId: string;
  initialWorkspace: UserWorkspaceSnapshot;
  initialRow: JournalRow;
};

type PersonalRuleRow = {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
};

export function JournalEntryEditClient({ userId, entryId, initialWorkspace, initialRow }: Props) {
  const router = useRouter();
  const { canWriteJournal, displayCurrency } = useAccess();
  const { updateRow, removeRow, lastError } = useUserWorkspace(userId, { initialWorkspace });

  const [entryDate, setEntryDate] = useState(
    () => initialRow.entryDate ?? new Date(initialRow.createdAt ?? Date.now()).toISOString().slice(0, 10),
  );
  const [symbol, setSymbol] = useState(initialRow.sym);
  const [pnl, setPnl] = useState(initialRow.r);
  const [setupTag, setSetupTag] = useState<(typeof SETUP_TAG_OPTIONS)[number]>(
    SETUP_TAG_OPTIONS.includes(initialRow.setup as (typeof SETUP_TAG_OPTIONS)[number])
      ? (initialRow.setup as (typeof SETUP_TAG_OPTIONS)[number])
      : "Other",
  );
  const [mistakeTag, setMistakeTag] = useState<(typeof MISTAKE_TAG_OPTIONS)[number]>(
    MISTAKE_TAG_OPTIONS.includes(initialRow.tag as (typeof MISTAKE_TAG_OPTIONS)[number])
      ? (initialRow.tag as (typeof MISTAKE_TAG_OPTIONS)[number])
      : "Other",
  );
  const [sessionTag, setSessionTag] = useState<(typeof SESSION_TAG_OPTIONS)[number]>(
    SESSION_TAG_OPTIONS.includes(initialRow.sessionTag as (typeof SESSION_TAG_OPTIONS)[number])
      ? (initialRow.sessionTag as (typeof SESSION_TAG_OPTIONS)[number])
      : "Other",
  );
  const [marketCondition, setMarketCondition] = useState<(typeof MARKET_CONDITION_OPTIONS)[number]>(
    MARKET_CONDITION_OPTIONS.includes(initialRow.marketCondition as (typeof MARKET_CONDITION_OPTIONS)[number])
      ? (initialRow.marketCondition as (typeof MARKET_CONDITION_OPTIONS)[number])
      : "Other",
  );
  const [note, setNote] = useState(initialRow.note ?? "");
  const [lessonLearned, setLessonLearned] = useState(initialRow.lessonLearned ?? "");
  const [chartUrl, setChartUrl] = useState(initialRow.chartLinkUrl ?? "");
  const [moodState, setMoodState] = useState<(typeof MOOD_OPTIONS)[number]>(initialRow.moodState ?? "Focused");
  const [followedPlan, setFollowedPlan] = useState(Boolean(initialRow.followedPlan));
  const [respectedStop, setRespectedStop] = useState(Boolean(initialRow.respectedStop));
  const [noRevengeTrade, setNoRevengeTrade] = useState(Boolean(initialRow.noRevengeTrade));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [personalRules, setPersonalRules] = useState<PersonalRuleRow[]>([]);
  const [ruleChecks, setRuleChecks] = useState<Record<string, boolean>>(initialRow.ruleChecks ?? {});

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      await supabase.rpc("seed_default_personal_rules", { p_user_id: user.id });
      const { data: rows } = await supabase
        .from("personal_rules")
        .select("id,title,category,is_active")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const active = (rows ?? []) as PersonalRuleRow[];
      setPersonalRules(active);
      setRuleChecks((prev) => {
        const next = { ...prev };
        for (const r of active) {
          if (!(r.id in next)) next[r.id] = false;
        }
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (personalRules.length === 0) return;
    setRuleChecks((prev) => {
      const next = { ...prev };
      for (const rule of personalRules) {
        const t = rule.title.toLowerCase();
        if (t === "followed my plan") next[rule.id] = followedPlan;
        if (t === "respected my stop") next[rule.id] = respectedStop;
        if (t === "no revenge trade") next[rule.id] = noRevengeTrade;
      }
      return next;
    });
  }, [followedPlan, noRevengeTrade, personalRules, respectedStop]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) return;
    if (!entryDate.trim() || !symbol.trim() || !pnl.trim()) return;
    if (pnl.includes(".")) {
      setSaveError("Use comma for decimals (e.g. 100,80). Dot is not allowed.");
      return;
    }
    if (!isValidChartUrl(chartUrl)) {
      setUrlError("Use a valid chart URL (e.g. https://chart.example/session/...), or leave the field empty.");
      return;
    }
    setUrlError(null);
    setSaveError(null);
    setSaving(true);
    const result = await updateRow(entryId, {
      entryDate,
      time: initialRow.time,
      sym: symbol.trim().toUpperCase(),
      setup: setupTag,
      r: pnl.trim(),
      tag: mistakeTag,
      note: note.trim() || undefined,
      chartLinkUrl: chartUrlForSave(chartUrl),
      moodState,
      followedPlan,
      respectedStop,
      noRevengeTrade,
      sessionTag,
      marketCondition,
      lessonLearned: lessonLearned.trim() || undefined,
      ruleChecks,
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? lastError ?? "Could not update entry.");
      return;
    }
    router.push(`/app/journal/${entryId}`);
    router.refresh();
  };

  const onDelete = async () => {
    if (!canWriteJournal) return;
    setDeleteError(null);
    setDeleting(true);
    const result = await removeRow(entryId);
    setDeleting(false);
    if (result.ok) {
      setConfirmOpen(false);
      router.push("/app/journal");
      router.refresh();
      return;
    }
    setDeleteError(result.error);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Journal"
        title="Edit entry"
        description="Update the day’s fields — calendar and stats refresh from the same data."
        actions={
          <Link href={`/app/journal/${entryId}`} className={appSecondaryCta}>
            <ArrowLeft className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
            Back to detail
          </Link>
        }
      />

      {!canWriteJournal ? (
        <div
          className="flex flex-col gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between"
          role="status"
        >
          <div className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-amber-200">
              <Lock className="size-[18px]" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-200/80">Read-only</p>
              <p className="mt-1 text-[14px] leading-relaxed text-zinc-200">
                Upgrade to Premium to edit entries, add a linked chart, or change P&amp;L.
              </p>
            </div>
          </div>
          <Link
            href="/app/settings/billing"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/15 px-4 text-[13px] font-medium text-amber-100 transition hover:bg-amber-500/25"
          >
            View billing
          </Link>
        </div>
      ) : null}

      <DashboardCard
        eyebrow="Edit"
        title={initialRow.sym}
        description={
          canWriteJournal
            ? `Adjust P&L in ${displayCurrency} (set in Settings). Linked chart is optional.`
            : "Fields are locked until you upgrade — your saved values stay visible below."
        }
      >
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">1. Result</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="je-date" className={labelCls}>
                  Session date
                </Label>
                <Input
                  id="je-date"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  required
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "disabled:opacity-45")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="je-symbol" className={labelCls}>
                  Symbol
                </Label>
                <Input
                  id="je-symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. NQ"
                  required
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "disabled:opacity-45")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="je-pnl" className={labelCls}>
                Day P&L ({displayCurrency})
              </Label>
              <Input
                id="je-pnl"
                value={pnl}
                onChange={(e) => {
                  const next = e.target.value;
                  if (next.includes(".")) {
                    setSaveError("Use comma for decimals (e.g. 100,80). Dot is not allowed.");
                  } else if (saveError?.includes("comma for decimals")) {
                    setSaveError(null);
                  }
                  setPnl(next);
                }}
                placeholder="+120,80 or −40"
                required
                disabled={!canWriteJournal}
                className={cn(inputCls, "font-mono disabled:opacity-45")}
              />
            </div>
          </div>

          <div className="space-y-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">2. Context</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="je-setup" className={labelCls}>
                  Setup tag
                </Label>
                <select
                  id="je-setup"
                  value={setupTag}
                  onChange={(e) => setSetupTag(e.target.value as (typeof SETUP_TAG_OPTIONS)[number])}
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                >
                  {SETUP_TAG_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="je-mistake" className={labelCls}>
                  Mistake tag
                </Label>
                <select
                  id="je-mistake"
                  value={mistakeTag}
                  onChange={(e) => setMistakeTag(e.target.value as (typeof MISTAKE_TAG_OPTIONS)[number])}
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                >
                  {MISTAKE_TAG_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="je-session" className={labelCls}>
                  Session tag
                </Label>
                <select
                  id="je-session"
                  value={sessionTag}
                  onChange={(e) => setSessionTag(e.target.value as (typeof SESSION_TAG_OPTIONS)[number])}
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                >
                  {SESSION_TAG_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="je-market-condition" className={labelCls}>
                  Market condition
                </Label>
                <select
                  id="je-market-condition"
                  value={marketCondition}
                  onChange={(e) => setMarketCondition(e.target.value as (typeof MARKET_CONDITION_OPTIONS)[number])}
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                >
                  {MARKET_CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">3. Behavior</p>
            <div className="space-y-2">
              <Label htmlFor="je-mood" className={labelCls}>
                Mood / state
              </Label>
              <select
                id="je-mood"
                value={moodState}
                onChange={(e) => setMoodState(e.target.value as (typeof MOOD_OPTIONS)[number])}
                disabled={!canWriteJournal}
                className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
              >
                {MOOD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { id: "je-plan", label: "Followed my plan", checked: followedPlan, set: setFollowedPlan },
                { id: "je-stop", label: "Respected my stop", checked: respectedStop, set: setRespectedStop },
                { id: "je-revenge", label: "No revenge trade", checked: noRevengeTrade, set: setNoRevengeTrade },
              ].map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[13px] text-zinc-300"
                >
                  <input
                    type="checkbox"
                    checked={c.checked}
                    onChange={(e) => c.set(e.target.checked)}
                    disabled={!canWriteJournal}
                    className="size-4 rounded border-white/[0.2] bg-transparent"
                  />
                  {c.label}
                </label>
              ))}
            </div>
            {personalRules.length > 0 ? (
              <div className="space-y-2 pt-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Active rules</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {personalRules.map((rule) => (
                    <label
                      key={rule.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-[12px] text-zinc-300"
                    >
                      <span className="truncate">{rule.title}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(ruleChecks[rule.id])}
                        onChange={(e) => setRuleChecks((prev) => ({ ...prev, [rule.id]: e.target.checked }))}
                        disabled={!canWriteJournal}
                        className="size-4 rounded border-white/[0.2] bg-transparent"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">4. Review</p>
            <div className="space-y-2">
              <Label htmlFor="je-note" className={labelCls}>
                Note
              </Label>
              <textarea
                id="je-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="What stood out — setup, execution, one line on mood."
                disabled={!canWriteJournal}
                className={cn(
                  "w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600",
                  "shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)] disabled:opacity-45",
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="je-lesson" className={labelCls}>
                One lesson from today
              </Label>
              <textarea
                id="je-lesson"
                value={lessonLearned}
                onChange={(e) => setLessonLearned(e.target.value)}
                rows={2}
                placeholder="One thing I should repeat or avoid next time."
                disabled={!canWriteJournal}
                className={cn(
                  "w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[14px] text-zinc-100 placeholder:text-zinc-600",
                  "shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)] disabled:opacity-45",
                )}
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">5. Chart link</p>
            <div className="space-y-2">
              <Label htmlFor="je-chart-link" className={cn(labelCls, "text-zinc-300")}>
                Linked chart
                <span className="ml-2 font-normal text-zinc-600">Optional</span>
              </Label>
              <p className="text-[12px] text-zinc-500">Paste a chart link if you want it saved with this day.</p>
              <Input
                id="je-chart-link"
                type="url"
                value={chartUrl}
                onChange={(e) => setChartUrl(e.target.value)}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (!v) return;
                  const n = normalizeChartUrlInput(v);
                  if (n !== v) setChartUrl(n);
                }}
                placeholder="https://your-chart-link"
                disabled={!canWriteJournal}
                className={cn(inputCls, "disabled:opacity-45")}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving || !canWriteJournal}
            className={cn(
              "h-12 w-full rounded-xl text-[15px] font-medium tracking-tight",
              "bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.68_0.15_252))] text-[oklch(0.12_0.04_265)]",
              "shadow-[0_1px_0_0_oklch(1_0_0_/0.12)_inset,0_12px_40px_-12px_oklch(0.45_0.14_252/0.5)] hover:brightness-[1.03] disabled:opacity-40",
            )}
          >
            <Check className="mr-2 size-4" strokeWidth={2} />
            {saving ? "Saving…" : "Save changes"}
          </Button>
          {urlError ? <p className="text-[13px] text-rose-300/95">{urlError}</p> : null}
          {saveError ? <p className="text-[13px] text-rose-300/95">{saveError}</p> : null}
        </form>

        {canWriteJournal ? (
          <div className="mt-8 border-t border-white/[0.08] pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Danger zone</p>
            <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
              Remove this day from your journal permanently.
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting || saving}
              className="mt-4 h-10 rounded-xl px-4"
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="mr-2 size-4" strokeWidth={2} aria-hidden />
              {deleting ? "Deleting…" : "Delete entry"}
            </Button>
            {deleteError ? (
              <p className="mt-3 text-[13px] text-rose-300/95" role="alert">
                {deleteError}
              </p>
            ) : null}
          </div>
        ) : null}
      </DashboardCard>
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => {
          if (deleting) return;
          setConfirmOpen(false);
        }}
        onConfirm={() => void onDelete()}
        destructive
        pending={deleting}
        title="Delete journal entry?"
        description="This action is permanent and cannot be undone."
        confirmLabel="Delete entry"
      />
    </div>
  );
}
