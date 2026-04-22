"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, LineChart, NotebookPen, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { dayKeyFromRow, startOfWeekMonday, toDayKey } from "@/lib/user-data/journal-metrics";
import { EmptyState } from "@/components/app/empty-state";
import { JournalDayList } from "@/components/journal/journal-day-list";
import { isValidTradingViewUrl, tradingViewUrlForSave } from "@/lib/tradingview";
import { useAccess } from "@/components/access/access-provider";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { createClient } from "@/lib/supabase/client";
import { waitForSessionUser } from "@/lib/supabase/wait-for-browser-session";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
  highlightDate?: string;
};

const labelCls = "text-[12px] font-medium tracking-wide text-zinc-400";
const inputCls =
  "h-11 rounded-xl border-white/[0.1] bg-black/25 text-[15px] shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] placeholder:text-zinc-600 focus-visible:ring-[oklch(0.55_0.12_252/0.35)]";
const MOOD_OPTIONS = ["Calm", "Focused", "Hesitant", "Tilted"] as const;

type WeeklyReflectionRow = {
  week_start: string;
  what_worked: string | null;
  what_slipped: string | null;
  next_week_focus: string | null;
};

type SupabaseErrorLike = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function weeklyReflectionErrorMessage(error: SupabaseErrorLike | null | undefined, action: "load" | "save"): string {
  const message = (error?.message ?? "").toLowerCase();
  const code = (error?.code ?? "").toUpperCase();
  if (message.includes("jwt") || message.includes("token") || message.includes("session")) {
    return "Session not ready. Refresh the page and try again.";
  }
  if (
    code === "PGRST205" ||
    (message.includes("weekly_reflections") &&
      (message.includes("does not exist") || message.includes("column") || message.includes("could not find the table")))
  ) {
    return "Weekly reflection needs the latest database migration.";
  }
  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "No permission to access weekly reflection for this account.";
  }
  const base = action === "load" ? "Could not load weekly reflection." : "Could not save weekly reflection.";
  const rawCode = error?.code?.trim();
  const raw = error?.message?.trim();
  if (!rawCode && !raw) return base;
  return `${base} ${rawCode ? `[${rawCode}] ` : ""}${raw ?? ""}`.trim();
}

export function JournalWorkspace({ userId, email, initialWorkspace, highlightDate }: Props) {
  const { canWriteJournal, displayCurrency } = useAccess();
  const { data, ready, addRow, lastError, removeRow } = useUserWorkspace(userId, { initialWorkspace });
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [symbol, setSymbol] = useState("");
  const [pnl, setPnl] = useState("");
  const [note, setNote] = useState("");
  const [tradingViewUrl, setTradingViewUrl] = useState("");
  const [moodState, setMoodState] = useState<(typeof MOOD_OPTIONS)[number]>("Focused");
  const [followedPlan, setFollowedPlan] = useState(false);
  const [respectedStop, setRespectedStop] = useState(false);
  const [noRevengeTrade, setNoRevengeTrade] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [weekAnchorDate, setWeekAnchorDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weeklyWorked, setWeeklyWorked] = useState("");
  const [weeklySlipped, setWeeklySlipped] = useState("");
  const [weeklyFocus, setWeeklyFocus] = useState("");
  const [weeklyMsg, setWeeklyMsg] = useState<string | null>(null);
  const [weeklySaving, setWeeklySaving] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const weekStartKey = useMemo(() => {
    const base = new Date(`${weekAnchorDate}T12:00:00`);
    return toDayKey(startOfWeekMonday(base));
  }, [weekAnchorDate]);

  const sortedRows = useMemo(() => {
    return [...data.journal].sort((a, b) => {
      const ak = dayKeyFromRow(a.entryDate, a.createdAt);
      const bk = dayKeyFromRow(b.entryDate, b.createdAt);
      return bk.localeCompare(ak);
    });
  }, [data.journal]);

  const latestEntriesToday = useMemo(() => {
    const todayKey = toDayKey(new Date());
    return sortedRows.filter((row) => dayKeyFromRow(row.entryDate, row.createdAt) === todayKey);
  }, [sortedRows]);

  const rowsForLatestEntries = useMemo(() => {
    const byId = new Map<string, JournalRow>();
    for (const r of latestEntriesToday) byId.set(r.id, r);
    if (highlightDate) {
      for (const r of sortedRows) {
        if (dayKeyFromRow(r.entryDate, r.createdAt) === highlightDate) {
          byId.set(r.id, r);
        }
      }
    }
    return [...byId.values()].sort((a, b) => {
      const ak = dayKeyFromRow(a.entryDate, a.createdAt);
      const bk = dayKeyFromRow(b.entryDate, b.createdAt);
      return bk.localeCompare(ak);
    });
  }, [sortedRows, latestEntriesToday, highlightDate]);

  useEffect(() => {
    if (!highlightDate || !ready || rowsForLatestEntries.length === 0) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector(`[data-journal-date="${highlightDate}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [highlightDate, ready, rowsForLatestEntries.length]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    /* eslint-disable react-hooks/set-state-in-effect -- loading flag toggles around async reflection fetch */
    setWeeklyLoading(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const supabase = createClient();
    void (async () => {
      try {
        const sessionOk = await waitForSessionUser(supabase, userId, () => cancelled);
        if (!sessionOk) {
          throw { message: "Session not ready." } satisfies SupabaseErrorLike;
        }
        const { data, error } = await supabase
          .from("weekly_reflections")
          .select("week_start, what_worked, what_slipped, next_week_focus")
          .eq("user_id", userId)
          .eq("week_start", weekStartKey)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        const row = (data ?? null) as WeeklyReflectionRow | null;
        setWeeklyWorked(row?.what_worked ?? "");
        setWeeklySlipped(row?.what_slipped ?? "");
        setWeeklyFocus(row?.next_week_focus ?? "");
        setWeeklyMsg(null);
      } catch (error) {
        if (cancelled) return;
        setWeeklyMsg(weeklyReflectionErrorMessage(error as SupabaseErrorLike, "load"));
      } finally {
        if (cancelled) return;
        setWeeklyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, weekStartKey]);

  const onQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) return;
    if (!entryDate.trim() || !symbol.trim() || !pnl.trim()) return;
    if (pnl.includes(".")) {
      setSaveError("Use comma for decimals (e.g. 100,80). Dot is not allowed.");
      return;
    }
    if (!isValidTradingViewUrl(tradingViewUrl)) {
      setUrlError(
        "Use a valid TradingView chart URL (e.g. https://www.tradingview.com/chart/…), or leave the field empty.",
      );
      return;
    }
    setUrlError(null);
    setSaveError(null);
    setSaving(true);
    const result = await addRow({
      entryDate,
      time: "Day close",
      sym: symbol.trim().toUpperCase(),
      setup: "Day",
      r: pnl.trim(),
      tag: "Journal",
      note: note.trim() || undefined,
      tradingViewUrl: tradingViewUrlForSave(tradingViewUrl),
      moodState,
      followedPlan,
      respectedStop,
      noRevengeTrade,
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? lastError ?? "Could not save day entry.");
      return;
    }
    setSymbol("");
    setPnl("");
    setNote("");
    setTradingViewUrl("");
    setMoodState("Focused");
    setFollowedPlan(false);
    setRespectedStop(false);
    setNoRevengeTrade(false);
  };

  const onSaveWeeklyReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !canWriteJournal) return;
    setWeeklyMsg(null);
    setWeeklySaving(true);
    const supabase = createClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser.user?.id !== userId) {
      setWeeklySaving(false);
      setWeeklyMsg("Session not ready. Refresh the page and try again.");
      return;
    }
    const payload = {
      user_id: userId,
      week_start: weekStartKey,
      what_worked: weeklyWorked.trim() || null,
      what_slipped: weeklySlipped.trim() || null,
      next_week_focus: weeklyFocus.trim() || null,
    };

    let error: SupabaseErrorLike | null = null;
    const upsertResult = await supabase.from("weekly_reflections").upsert(payload, { onConflict: "user_id,week_start" });
    error = upsertResult.error;

    // Fallback for environments where upsert conflict metadata is unavailable.
    if (
      error &&
      (error.code === "42P10" ||
        error.message?.toLowerCase().includes("on conflict") ||
        error.message?.toLowerCase().includes("unique or exclusion constraint"))
    ) {
      const insertResult = await supabase.from("weekly_reflections").insert(payload);
      if (insertResult.error?.code === "23505") {
        const updateResult = await supabase
          .from("weekly_reflections")
          .update({
            what_worked: payload.what_worked,
            what_slipped: payload.what_slipped,
            next_week_focus: payload.next_week_focus,
          })
          .eq("user_id", userId)
          .eq("week_start", weekStartKey);
        error = updateResult.error;
      } else {
        error = insertResult.error;
      }
    }

    setWeeklySaving(false);
    setWeeklyMsg(error ? weeklyReflectionErrorMessage(error, "save") : "Weekly reflection saved.");
  };

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Journal"
        title="Daily review"
        description="Quick log below — your calendar shows the same P&amp;L when you open it."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/app/calendar" className={appSecondaryCta}>
              <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              Calendar
            </Link>
            <a href="#add" className={appPrimaryCta}>
              <Plus className="mr-2 size-4" strokeWidth={2} />
              New entry
            </a>
          </div>
        }
      />

      <section className="grid min-w-0 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
        <DashboardCard
          eyebrow="Log day"
          title="Quick entry"
          className="min-h-0 min-w-0"
          description={
            canWriteJournal
              ? "P&amp;L uses your display currency from Settings. TradingView is optional — paste when you want the chart next to the number. The calendar page picks up the same entries."
              : "Read-only: your history stays here. Upgrade to log new days."
          }
        >
          <form id="add" onSubmit={onQuickAdd} className="space-y-7">
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Session</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jw-date" className={labelCls}>
                    Session date
                  </Label>
                  <Input
                    id="jw-date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    required
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "disabled:opacity-45")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-symbol" className={labelCls}>
                    Symbol
                  </Label>
                  <Input
                    id="jw-symbol"
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
                <Label htmlFor="jw-pnl" className={labelCls}>
                  Day P&L ({displayCurrency})
                </Label>
                <Input
                  id="jw-pnl"
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

            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Note</p>
              <textarea
                id="jw-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="What stood out — setup, execution, one line on mood."
                disabled={!canWriteJournal}
                className={cn(
                  "w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600",
                  "shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)] disabled:opacity-45",
                )}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Behavior layer</p>
              <div className="space-y-2">
                <Label htmlFor="jw-mood" className={labelCls}>
                  Mood / state
                </Label>
                <select
                  id="jw-mood"
                  value={moodState}
                  onChange={(e) => setMoodState(e.target.value as (typeof MOOD_OPTIONS)[number])}
                  disabled={!canWriteJournal}
                  className={cn(
                    inputCls,
                    "w-full rounded-xl px-3.5 disabled:opacity-45",
                  )}
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
                  { id: "plan", label: "Followed my plan", checked: followedPlan, set: setFollowedPlan },
                  { id: "stop", label: "Respected my stop", checked: respectedStop, set: setRespectedStop },
                  { id: "revenge", label: "No revenge trade", checked: noRevengeTrade, set: setNoRevengeTrade },
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
            </div>

            <div className="rounded-xl border border-[oklch(0.52_0.12_252/0.2)] bg-[linear-gradient(168deg,oklch(0.1_0.04_264/0.5),oklch(0.06_0.03_268/0.45))] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[oklch(0.74_0.11_252)]">
                  <LineChart className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 space-y-2.5">
                  <Label htmlFor="jw-tv" className={cn(labelCls, "text-zinc-200")}>
                    TradingView link
                    <span className="ml-2 font-normal text-zinc-600">Optional</span>
                  </Label>
                  <Input
                    id="jw-tv"
                    type="url"
                    value={tradingViewUrl}
                    onChange={(e) => setTradingViewUrl(e.target.value)}
                    placeholder="https://www.tradingview.com/chart/…"
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "disabled:opacity-45")}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving || !canWriteJournal}
              className={cn(
                "h-12 w-full rounded-xl text-[15px] font-semibold tracking-tight",
                "bg-[linear-gradient(180deg,oklch(0.74_0.14_250),oklch(0.66_0.15_252))] text-[oklch(0.1_0.04_265)]",
                "shadow-[0_1px_0_0_oklch(1_0_0_/0.14)_inset,0_14px_44px_-14px_oklch(0.42_0.14_252/0.55)] hover:brightness-[1.04] disabled:opacity-40",
              )}
            >
              <Plus className="mr-2 size-4" strokeWidth={2} />
              {saving ? "Saving…" : "Save day"}
            </Button>
            {urlError ? <p className="text-[13px] text-rose-300/95">{urlError}</p> : null}
            {saveError ? <p className="text-[13px] text-rose-300/95">{saveError}</p> : null}
          </form>
        </DashboardCard>

        <DashboardCard
          eyebrow="Recent"
          title="Latest activity"
          className="min-h-0 min-w-0 lg:sticky lg:top-6"
          description="Only today's calendar-day trades — plus any day you opened via a calendar link (?date=)."
        >
          {sortedRows.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No entries yet"
              description={
                canWriteJournal
                  ? "Use Quick entry beside this panel to save your first day."
                  : "Your history remains below once you have entries — upgrade to add more."
              }
              className="border-none bg-transparent py-8 ring-0"
            />
          ) : rowsForLatestEntries.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No trades logged for today"
              description="Open Calendar for the month grid, or Stats for the full picture."
              className="border-none bg-transparent py-8 ring-0"
            />
          ) : (
            <JournalDayList
              rows={rowsForLatestEntries}
              highlightDate={highlightDate}
              displayCurrency={displayCurrency}
              canWriteJournal={canWriteJournal}
              onDeleteRow={canWriteJournal ? removeRow : undefined}
            />
          )}
        </DashboardCard>
      </section>

      <DashboardCard
        eyebrow="Weekly reflection"
        title="What worked / slipped / next focus"
        description="Short weekly note to keep behavior and execution aligned."
      >
        <form className="space-y-4" onSubmit={onSaveWeeklyReflection}>
          <div className="grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
            <Label htmlFor="jr-week" className={labelCls}>
              Week anchor date
            </Label>
            <Input
              id="jr-week"
              type="date"
              value={weekAnchorDate}
              onChange={(e) => setWeekAnchorDate(e.target.value)}
              disabled={!canWriteJournal || weeklyLoading}
              className={cn(inputCls, "disabled:opacity-45")}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jr-worked" className={labelCls}>
                What worked
              </Label>
              <textarea
                id="jr-worked"
                value={weeklyWorked}
                onChange={(e) => setWeeklyWorked(e.target.value)}
                rows={4}
                disabled={!canWriteJournal || weeklyLoading}
                className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jr-slipped" className={labelCls}>
                What slipped
              </Label>
              <textarea
                id="jr-slipped"
                value={weeklySlipped}
                onChange={(e) => setWeeklySlipped(e.target.value)}
                rows={4}
                disabled={!canWriteJournal || weeklyLoading}
                className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jr-focus" className={labelCls}>
                Next week focus
              </Label>
              <textarea
                id="jr-focus"
                value={weeklyFocus}
                onChange={(e) => setWeeklyFocus(e.target.value)}
                rows={4}
                disabled={!canWriteJournal || weeklyLoading}
                className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!canWriteJournal || weeklySaving || weeklyLoading} className="h-10 rounded-xl px-4">
              {weeklySaving ? "Saving…" : "Save weekly reflection"}
            </Button>
            {weeklyMsg ? (
              <p
                className={cn(
                  "text-[13px]",
                  weeklyMsg.includes("saved") ? "text-zinc-400" : "text-rose-300/95",
                )}
              >
                {weeklyMsg}
              </p>
            ) : null}
          </div>
        </form>
      </DashboardCard>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
        <p className="text-[14px] text-zinc-500">
          Signed in as <span className="text-zinc-200">{email}</span>
        </p>
      </section>
    </div>
  );
}
