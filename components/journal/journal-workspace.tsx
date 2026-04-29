"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CalendarDays, LineChart, NotebookPen, Plus } from "lucide-react";
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
import { chartUrlForSave, isValidChartUrl } from "@/lib/chart-link";
import { useAccess } from "@/components/access/access-provider";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { createClient } from "@/lib/supabase/client";
import { waitForSessionUser } from "@/lib/supabase/wait-for-browser-session";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import { fetchJournalEntriesForExport } from "@/lib/export/user-exports";
import {
  MARKET_CONDITION_OPTIONS,
  MISTAKE_TAG_OPTIONS,
  SESSION_TAG_OPTIONS,
  SETUP_TAG_OPTIONS,
} from "@/lib/user-data/journal-tags";
import {
  applyEntryFilters,
  EMPTY_ENTRY_FILTERS,
  filterChips,
  hasActiveFilters,
  parseFiltersFromParams,
  uniqueValues,
  writeFiltersToParams,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
  highlightDate?: string;
  initialWeekAnchorDate?: string;
};

const labelCls = "text-[12px] font-medium tracking-wide text-zinc-400";
const inputCls =
  "h-11 rounded-xl border-white/[0.1] bg-black/25 text-[15px] shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] placeholder:text-zinc-600 focus-visible:ring-[oklch(0.55_0.12_252/0.35)]";
const MOOD_OPTIONS = ["Calm", "Focused", "Hesitant", "Tilted"] as const;

type WeeklyReflectionRow = {
  week_start: string;
  account_id: string | null;
  what_worked: string | null;
  what_slipped: string | null;
  next_week_focus: string | null;
  next_week_rule: string | null;
  confidence_score: number | null;
  weekly_note: string | null;
};

type PersonalRuleRow = {
  id: string;
  title: string;
  category: string;
  is_active: boolean;
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
    return "Please refresh and try again.";
  }
  if (
    code === "PGRST205" ||
    (message.includes("weekly_reflections") &&
      (message.includes("does not exist") || message.includes("column") || message.includes("could not find the table")))
  ) {
    return "Weekly reflection is unavailable right now.";
  }
  if (message.includes("row-level security") || message.includes("permission denied")) {
    return "You do not have access to this action.";
  }
  const base = action === "load" ? "Could not load week reflection." : "Could not save week reflection.";
  const rawCode = error?.code?.trim();
  const raw = error?.message?.trim();
  if (!rawCode && !raw) return base;
  return `${base} ${rawCode ? `[${rawCode}] ` : ""}${raw ?? ""}`.trim();
}

export function JournalWorkspace({ userId, email, initialWorkspace, highlightDate, initialWeekAnchorDate }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canWriteJournal, displayCurrency } = useAccess();
  const { accounts } = useTradingAccountsWorkspace();
  const { data, ready, activeAccountId, addRow, lastError, resetJournal } = useUserWorkspace(userId, { initialWorkspace });
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [symbol, setSymbol] = useState("");
  const [pnl, setPnl] = useState("");
  const [setupTag, setSetupTag] = useState<"" | (typeof SETUP_TAG_OPTIONS)[number]>("");
  const [mistakeTag, setMistakeTag] = useState<"" | (typeof MISTAKE_TAG_OPTIONS)[number]>("");
  const [sessionTag, setSessionTag] = useState<"" | (typeof SESSION_TAG_OPTIONS)[number]>("");
  const [marketCondition, setMarketCondition] = useState<"" | (typeof MARKET_CONDITION_OPTIONS)[number]>("");
  const [note, setNote] = useState("");
  const [lessonLearned, setLessonLearned] = useState("");
  const [chartUrl, setChartUrl] = useState("");
  const [moodState, setMoodState] = useState<"" | (typeof MOOD_OPTIONS)[number]>("");
  const [followedPlan, setFollowedPlan] = useState(false);
  const [respectedStop, setRespectedStop] = useState(false);
  const [noRevengeTrade, setNoRevengeTrade] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [weekAnchorDate, setWeekAnchorDate] = useState(() => initialWeekAnchorDate ?? new Date().toISOString().slice(0, 10));
  const [weeklyWorked, setWeeklyWorked] = useState("");
  const [weeklySlipped, setWeeklySlipped] = useState("");
  const [weeklyFocus, setWeeklyFocus] = useState("");
  const [weeklyRule, setWeeklyRule] = useState("");
  const [weeklyConfidence, setWeeklyConfidence] = useState<number | null>(null);
  const [weeklyNote, setWeeklyNote] = useState("");
  const [weeklyMsg, setWeeklyMsg] = useState<string | null>(null);
  const [weeklySaving, setWeeklySaving] = useState(false);
  const [weeklyLoading, setWeeklyLoading] = useState(false);
  const [weeklyUnavailable, setWeeklyUnavailable] = useState(false);
  const [resettingJournal, setResettingJournal] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EntryFilters>(() => parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
  const [personalRules, setPersonalRules] = useState<PersonalRuleRow[]>([]);
  const [ruleChecks, setRuleChecks] = useState<Record<string, boolean>>({});
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

  useEffect(() => {
    setFilters(parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
  }, [searchParams]);

  useEffect(() => {
    const next = writeFiltersToParams(new URLSearchParams(searchParams.toString()), filters);
    const nextQuery = next.toString();
    const current = searchParams.toString();
    if (nextQuery === current) return;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  const filteredRows = useMemo(() => applyEntryFilters(sortedRows, filters), [sortedRows, filters]);

  const latestEntriesToday = useMemo(() => {
    const todayKey = toDayKey(new Date());
    return filteredRows.filter((row) => dayKeyFromRow(row.entryDate, row.createdAt) === todayKey);
  }, [filteredRows]);

  const rowsForLatestEntries = useMemo(() => {
    if (highlightDate) {
      return filteredRows.filter((row) => dayKeyFromRow(row.entryDate, row.createdAt) === highlightDate);
    }
    return latestEntriesToday;
  }, [filteredRows, latestEntriesToday, highlightDate]);

  const symbolOptions = useMemo(() => uniqueValues(sortedRows, (row) => row.sym), [sortedRows]);
  const moodOptions = useMemo(() => uniqueValues(sortedRows, (row) => row.moodState), [sortedRows]);
  const setupOptions = useMemo(() => uniqueValues(sortedRows, (row) => String(row.setup)), [sortedRows]);
  const mistakeOptions = useMemo(() => uniqueValues(sortedRows, (row) => String(row.tag)), [sortedRows]);
  const sessionOptions = useMemo(() => uniqueValues(sortedRows, (row) => row.sessionTag), [sortedRows]);
  const marketOptions = useMemo(() => uniqueValues(sortedRows, (row) => row.marketCondition), [sortedRows]);

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
    if (!activeAccountId) {
      setWeeklyWorked("");
      setWeeklySlipped("");
      setWeeklyFocus("");
      setWeeklyRule("");
      setWeeklyConfidence(null);
      setWeeklyNote("");
      setWeeklyMsg(null);
      setWeeklyLoading(false);
      return;
    }
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
          .select("week_start, account_id, what_worked, what_slipped, next_week_focus, next_week_rule, confidence_score, weekly_note")
          .eq("user_id", userId)
          .eq("account_id", activeAccountId)
          .eq("week_start", weekStartKey)
          .maybeSingle();
        if (error) throw error;
        if (cancelled) return;
        const row = (data ?? null) as WeeklyReflectionRow | null;
        setWeeklyWorked(row?.what_worked ?? "");
        setWeeklySlipped(row?.what_slipped ?? "");
        setWeeklyFocus(row?.next_week_focus ?? "");
        setWeeklyRule(row?.next_week_rule ?? "");
        setWeeklyConfidence(row?.confidence_score ?? null);
        setWeeklyNote(row?.weekly_note ?? "");
        setWeeklyMsg(null);
        setWeeklyUnavailable(false);
      } catch (error) {
        if (cancelled) return;
        const msg = weeklyReflectionErrorMessage(error as SupabaseErrorLike, "load");
        setWeeklyMsg(msg);
        setWeeklyUnavailable(msg.toLowerCase().includes("unavailable"));
      } finally {
        if (cancelled) return;
        setWeeklyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, weekStartKey, activeAccountId]);

  const onQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) return;
    if (!entryDate.trim() || !symbol.trim() || !pnl.trim()) return;
    if (pnl.includes(".")) {
      setSaveError("Use comma for decimals (e.g. 100,80). Dot is not allowed.");
      return;
    }
    if (!isValidChartUrl(chartUrl)) {
      setUrlError("Use a valid chart URL, or leave this field empty.");
      return;
    }
    setUrlError(null);
    setSaveError(null);
    setSaving(true);
    const result = await addRow({
      entryDate,
      time: "Day close",
      sym: symbol.trim().toUpperCase(),
      setup: setupTag || "Other",
      r: pnl.trim(),
      tag: mistakeTag || "None",
      note: note.trim() || undefined,
      chartLinkUrl: chartUrlForSave(chartUrl),
      moodState: moodState || undefined,
      followedPlan,
      respectedStop,
      noRevengeTrade,
      sessionTag: sessionTag || undefined,
      marketCondition: marketCondition || undefined,
      lessonLearned: lessonLearned.trim() || undefined,
      ruleChecks,
    });
    setSaving(false);
    if (!result.ok) {
      setSaveError(result.error ?? lastError ?? "Could not save day entry.");
      return;
    }
    setSymbol("");
    setPnl("");
    setSetupTag("Pullback");
    setMistakeTag("None");
    setSessionTag("New York");
    setMarketCondition("Trending");
    setNote("");
    setLessonLearned("");
    setChartUrl("");
    setMoodState("Focused");
    setFollowedPlan(false);
    setRespectedStop(false);
    setNoRevengeTrade(false);
    setRuleChecks((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, false])));
  };

  const onSaveWeeklyReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !canWriteJournal || !activeAccountId) return;
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
      account_id: activeAccountId,
      week_start: weekStartKey,
      what_worked: weeklyWorked.trim() || null,
      what_slipped: weeklySlipped.trim() || null,
      next_week_focus: weeklyFocus.trim() || null,
      next_week_rule: weeklyRule.trim() || null,
      confidence_score: weeklyConfidence,
      weekly_note: weeklyNote.trim() || null,
    };

    let error: SupabaseErrorLike | null = null;
    const upsertResult = await supabase.from("weekly_reflections").upsert(payload, { onConflict: "user_id,account_id,week_start" });
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
            next_week_rule: payload.next_week_rule,
            confidence_score: payload.confidence_score,
            weekly_note: payload.weekly_note,
          })
          .eq("user_id", userId)
          .eq("account_id", activeAccountId)
          .eq("week_start", weekStartKey);
        error = updateResult.error;
      } else {
        error = insertResult.error;
      }
    }

    setWeeklySaving(false);
    const msg = error ? weeklyReflectionErrorMessage(error, "save") : "Weekly reflection saved.";
    setWeeklyMsg(msg);
    if (!error) {
      setWeeklyUnavailable(false);
    } else {
      setWeeklyUnavailable(msg.toLowerCase().includes("unavailable"));
    }
  };

  const onResetJournal = async () => {
    if (resettingJournal) return;
    if (resetConfirmText.trim().toUpperCase() !== "RESET JOURNAL") {
      setResetMsg("Reset cancelled. Confirmation text did not match.");
      return;
    }
    setResetMsg(null);
    setResettingJournal(true);
    const result = await resetJournal();
    setResettingJournal(false);
    if (!result.ok) {
      setResetMsg(result.error ?? "Could not reset journal.");
      return;
    }
    setResetConfirmOpen(false);
    setResetConfirmText("");
    setWeeklyWorked("");
    setWeeklySlipped("");
    setWeeklyFocus("");
    setWeeklyMsg(null);
    setResetMsg("Journal reset completed.");
  };

  const onExportCsv = async () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg(null);
    try {
      const supabase = createClient();
      const rows = await fetchJournalEntriesForExport(supabase, activeAccountId ?? undefined);
      const byAccount = new Map(accounts.map((a) => [a.id, a]));
      const csvRows = rows.map((row) => {
        const account = row.account_id ? byAccount.get(row.account_id) : null;
        return {
          date: row.entry_date ?? "",
          account_name: account?.name ?? "—",
          account_type: account?.accountType ?? "—",
          symbol: row.symbol ?? "",
          pnl: row.pnl ?? "",
          currency: account?.currency ?? "",
          mood: row.mood_score ?? "",
          followed_plan: row.followed_plan == null ? "" : row.followed_plan ? "Yes" : "No",
          respected_stop: row.respected_stop == null ? "" : row.respected_stop ? "Yes" : "No",
          no_revenge_trade: row.no_revenge_trade == null ? "" : row.no_revenge_trade ? "Yes" : "No",
          setup_tag: row.setup_tag ?? "",
          mistake_tag: row.mistake_tag ?? "",
          session_tag: row.session_tag ?? "",
          market_condition: row.market_condition ?? "",
          note: row.note ?? "",
          lesson: row.lesson_learned ?? "",
          chart_link: row.chart_link ?? "",
          created_at: row.created_at ?? "",
          updated_at: row.updated_at ?? "",
        };
      });
      const csv = recordsToCsv(
        [
          { key: "date", label: "date" },
          { key: "account_name", label: "account name" },
          { key: "account_type", label: "account type" },
          { key: "symbol", label: "symbol" },
          { key: "pnl", label: "pnl" },
          { key: "currency", label: "currency" },
          { key: "mood", label: "mood" },
          { key: "followed_plan", label: "followed plan" },
          { key: "respected_stop", label: "respected stop" },
          { key: "no_revenge_trade", label: "no revenge trade" },
          { key: "setup_tag", label: "setup tag" },
          { key: "mistake_tag", label: "mistake tag" },
          { key: "session_tag", label: "session tag" },
          { key: "market_condition", label: "market condition" },
          { key: "note", label: "note" },
          { key: "lesson", label: "lesson" },
          { key: "chart_link", label: "chart link" },
          { key: "created_at", label: "created at" },
          { key: "updated_at", label: "updated at" },
        ],
        csvRows,
      );
      triggerCsvDownload(`blueveno-journal-${fileDate()}.csv`, csv);
      setExportMsg(`CSV export ready (${csvRows.length} rows).`);
    } catch (error) {
      setExportMsg(error instanceof Error ? error.message : "Could not export CSV.");
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Journal"
        title="Add trading day"
        description="Log the day once. Calendar and stats update automatically."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/app/calendar" className={appSecondaryCta}>
              <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              Calendar
            </Link>
            <button type="button" onClick={onExportCsv} className={appSecondaryCta} disabled={exportBusy}>
              <LineChart className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              {exportBusy ? "Exporting…" : "Export CSV"}
            </button>
            <a href="#add" className={cn(appPrimaryCta, "shadow-[0_18px_45px_-22px_oklch(0.52_0.14_252/0.62)]")}>
              <Plus className="mr-2 size-4" strokeWidth={2} />
              Add trading day
            </a>
          </div>
        }
      />
      {resetMsg ? (
        <p className={cn("text-[13px]", resetMsg.includes("completed") ? "text-zinc-400" : "text-rose-300/95")}>
          {resetMsg}
        </p>
      ) : null}
      {exportMsg ? <p className="text-[13px] text-zinc-400">{exportMsg}</p> : null}

      <section className="grid min-w-0 gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start lg:gap-8 xl:gap-10">
        <DashboardCard
          eyebrow="Add trading day"
          title="New journal entry"
          className="min-h-0 min-w-0"
          description={
            canWriteJournal
              ? "Date, symbol, P&L, note, behavior, and optional linked chart."
              : "Read-only: your history stays here. Upgrade to log new days."
          }
        >
          <form id="add" onSubmit={onQuickAdd} className="space-y-5">
            <div className="space-y-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">1. Result</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jw-date" className={labelCls}>
                    Date
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

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <details>
                <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  2. Context (optional)
                </summary>
                <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jw-setup" className={labelCls}>
                    Setup tag <span className="text-zinc-500">Optional</span>
                  </Label>
                  <select
                    id="jw-setup"
                    value={setupTag}
                    onChange={(e) => setSetupTag(e.target.value as "" | (typeof SETUP_TAG_OPTIONS)[number])}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose setup (optional)</option>
                    {SETUP_TAG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-mistake" className={labelCls}>
                    Mistake tag <span className="text-zinc-500">Optional</span>
                  </Label>
                  <select
                    id="jw-mistake"
                    value={mistakeTag}
                    onChange={(e) => setMistakeTag(e.target.value as "" | (typeof MISTAKE_TAG_OPTIONS)[number])}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose mistake (optional)</option>
                    {MISTAKE_TAG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-session" className={labelCls}>
                    Session tag <span className="text-zinc-500">Optional</span>
                  </Label>
                  <select
                    id="jw-session"
                    value={sessionTag}
                    onChange={(e) => setSessionTag(e.target.value as "" | (typeof SESSION_TAG_OPTIONS)[number])}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose session (optional)</option>
                    {SESSION_TAG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-market-condition" className={labelCls}>
                    Market condition <span className="text-zinc-500">Optional</span>
                  </Label>
                  <select
                    id="jw-market-condition"
                    value={marketCondition}
                    onChange={(e) => setMarketCondition(e.target.value as "" | (typeof MARKET_CONDITION_OPTIONS)[number])}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose market condition (optional)</option>
                    {MARKET_CONDITION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                </div>
              </details>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <details>
                <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  3. Behavior (optional)
                </summary>
                <div className="mt-3 space-y-2">
                <Label htmlFor="jw-mood" className={labelCls}>
                  Mood
                </Label>
                <select
                  id="jw-mood"
                  value={moodState}
                  onChange={(e) => setMoodState(e.target.value as "" | (typeof MOOD_OPTIONS)[number])}
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                >
                  <option value="">Choose mood (optional)</option>
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
              </details>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5">
              <details>
                <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  4. Review (optional)
                </summary>
                <div className="mt-3.5 space-y-2">
                <Label htmlFor="jw-note" className={labelCls}>
                  Note
                </Label>
                <textarea
                  id="jw-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="What stood out today?"
                  disabled={!canWriteJournal}
                  className={cn(
                    "w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[15px] text-zinc-100 placeholder:text-zinc-600",
                    "shadow-[inset_0_1px_2px_oklch(0_0_0/0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)] disabled:opacity-45",
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jw-lesson" className={labelCls}>
                  One lesson from today
                </Label>
                <textarea
                  id="jw-lesson"
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
              </details>
            </div>

            <div className="rounded-xl border border-[oklch(0.52_0.12_252/0.2)] bg-[linear-gradient(168deg,oklch(0.1_0.04_264/0.5),oklch(0.06_0.03_268/0.45))] p-4 sm:p-5">
              <details>
                <summary className="cursor-pointer list-none font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  5. Chart link (optional)
                </summary>
                <div className="mt-3 flex items-start gap-3">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[oklch(0.74_0.11_252)]">
                  <LineChart className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 space-y-2.5">
                  <Label htmlFor="jw-chart-link" className={cn(labelCls, "text-zinc-200")}>
                    Linked chart
                    <span className="ml-2 font-normal text-zinc-600">Optional</span>
                  </Label>
                  <p className="text-[12px] text-zinc-500">Paste a chart link if you want it saved with this day.</p>
                  <Input
                    id="jw-chart-link"
                    type="url"
                    value={chartUrl}
                    onChange={(e) => setChartUrl(e.target.value)}
                    placeholder="https://your-chart-link"
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "disabled:opacity-45")}
                  />
                </div>
                </div>
              </details>
            </div>

            <Button
              type="submit"
              disabled={saving || !canWriteJournal || !activeAccountId}
              className={cn(
                "h-12 w-full rounded-xl text-[15px] font-semibold tracking-tight",
                "bg-[linear-gradient(180deg,oklch(0.74_0.14_250),oklch(0.66_0.15_252))] text-[oklch(0.1_0.04_265)]",
                "shadow-[0_1px_0_0_oklch(1_0_0_/0.14)_inset,0_18px_46px_-15px_oklch(0.42_0.14_252/0.58)] hover:brightness-[1.04] disabled:opacity-40",
              )}
            >
              <Plus className="mr-2 size-4" strokeWidth={2} />
              {saving ? "Saving…" : "Save trading day"}
            </Button>
            {!canWriteJournal ? (
              <p className="text-[13px] text-zinc-400">
                Read-only mode is active after trial. Upgrade to keep adding trading days.
              </p>
            ) : null}
            {canWriteJournal && !activeAccountId ? (
              <p className="text-[13px] text-zinc-400">
                Select an active trading account first (topbar account selector or Settings → Trading accounts).
              </p>
            ) : null}
            {urlError ? <p className="text-[13px] text-rose-300/95">{urlError}</p> : null}
            {saveError ? <p className="text-[13px] text-rose-300/95">{saveError}</p> : null}
          </form>
        </DashboardCard>

        <DashboardCard
          eyebrow={highlightDate ? "Selected day" : "Recent"}
          title={highlightDate ? `Entries for ${highlightDate}` : "Latest activity"}
          className="min-h-0 min-w-0 lg:sticky lg:top-6"
          description={
            highlightDate
              ? "All trades logged for this calendar day, including full notes."
              : "Latest logged days with mood and discipline score."
          }
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex h-8 items-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-[12px] text-zinc-300 hover:bg-white/[0.06]"
            >
              {filtersOpen ? "Hide filters" : "Show filters"}
            </button>
            {hasActiveFilters(filters) ? (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_ENTRY_FILTERS)}
                className="text-[12px] text-[oklch(0.78_0.11_252)] hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>
          {filtersOpen ? (
            <div className="mb-4 grid gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-3 sm:grid-cols-2">
              <Input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Search symbol or note" className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[13px]" />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
                <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
              </div>
              {[
                { key: "symbol", values: symbolOptions },
                { key: "mood", values: moodOptions },
                { key: "setup", values: setupOptions },
                { key: "mistake", values: mistakeOptions },
                { key: "session", values: sessionOptions },
                { key: "market", values: marketOptions },
              ].map((item) => (
                <select
                  key={item.key}
                  value={filters[item.key as keyof EntryFilters] as string}
                  onChange={(e) => setFilters((f) => ({ ...f, [item.key]: e.target.value }))}
                  className="h-9 rounded-lg border border-white/[0.1] bg-black/25 px-2 text-[12px] text-zinc-300"
                >
                  <option value="all">{item.key}</option>
                  {item.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              ))}
              <select
                value={filters.dayColor}
                onChange={(e) => setFilters((f) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))}
                className="h-9 rounded-lg border border-white/[0.1] bg-black/25 px-2 text-[12px] text-zinc-300"
              >
                <option value="all">all days</option>
                <option value="green">green days</option>
                <option value="red">red days</option>
              </select>
              <div className="col-span-full flex flex-wrap gap-2 pt-1">
                {[
                  { key: "followedPlan", label: "followed plan" },
                  { key: "respectedStop", label: "respected stop" },
                  { key: "noRevengeTrade", label: "no revenge" },
                ].map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, [c.key]: !f[c.key as keyof EntryFilters] }))}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px]",
                      filters[c.key as keyof EntryFilters]
                        ? "border-[oklch(0.62_0.12_252/0.45)] bg-[oklch(0.58_0.12_252/0.2)] text-zinc-100"
                        : "border-white/[0.12] bg-white/[0.03] text-zinc-400",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {hasActiveFilters(filters) ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {filterChips(filters).map((chip) => (
                <span key={chip} className="rounded-full border border-[oklch(0.58_0.12_252/0.34)] bg-[oklch(0.58_0.12_252/0.14)] px-2 py-0.5 text-[10px] text-zinc-200">
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          {sortedRows.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No trading days yet"
              description={
                canWriteJournal
                  ? "Log your first trading day to build your week and month."
                  : "Your history stays available in read-only mode."
              }
              action={
                canWriteJournal ? (
                  <a href="#add" className={appPrimaryCta}>
                    Add trading day
                  </a>
                ) : undefined
              }
              className="border-none bg-transparent py-8 ring-0"
            />
          ) : rowsForLatestEntries.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No entries match current filters"
              description="Clear filters to bring your full journal back."
              className="border-none bg-transparent py-8 ring-0"
            />
          ) : (
            <JournalDayList
              rows={rowsForLatestEntries}
              highlightDate={highlightDate}
              displayCurrency={displayCurrency}
              expandNotes={Boolean(highlightDate)}
              canWriteJournal={canWriteJournal}
            />
          )}
        </DashboardCard>
      </section>

      <section id="weekly-review">
      <DashboardCard
        eyebrow="Weekly review"
        title="Close the week"
        description="Capture what happened and set one rule for next week."
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
              disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
              className={cn(inputCls, "disabled:opacity-45")}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jr-worked" className={labelCls}>
                What worked?
              </Label>
              <textarea
                id="jr-worked"
                value={weeklyWorked}
                onChange={(e) => setWeeklyWorked(e.target.value)}
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
                onChange={(e) => setWeeklySlipped(e.target.value)}
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
                onChange={(e) => setWeeklyFocus(e.target.value)}
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
                onChange={(e) => setWeeklyRule(e.target.value)}
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
                    onClick={() => setWeeklyConfidence(score)}
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
              onChange={(e) => setWeeklyNote(e.target.value)}
              rows={2}
              placeholder="Anything else worth carrying into next week."
              disabled={!canWriteJournal || weeklyLoading || weeklyUnavailable}
              className="w-full resize-none rounded-xl border border-white/[0.1] bg-black/25 px-3.5 py-3 text-[14px] text-zinc-100 placeholder:text-zinc-600 disabled:opacity-45"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!canWriteJournal || weeklySaving || weeklyLoading || weeklyUnavailable} className="h-10 rounded-xl px-4">
              {weeklySaving ? "Saving…" : weeklyUnavailable ? "Weekly review unavailable" : "Save weekly review"}
            </Button>
            {!canWriteJournal ? (
              <p className="text-[13px] text-zinc-500">Weekly reflection is visible in read-only mode during trial expiry.</p>
            ) : null}
            {canWriteJournal && weeklyUnavailable ? (
              <p className="text-[13px] text-zinc-500">This workspace is missing weekly reflection support. Run the latest Supabase migrations.</p>
            ) : null}
            {canWriteJournal && !activeAccountId ? (
              <p className="text-[13px] text-zinc-500">Select an active account to save weekly review.</p>
            ) : null}
            {weeklyMsg ? (
              <p
                className={cn(
                  "text-[13px]",
                  weeklyMsg.includes("saved") || weeklyMsg.toLowerCase().includes("unavailable") ? "text-zinc-400" : "text-rose-300/95",
                )}
              >
                {weeklyMsg}
              </p>
            ) : null}
          </div>
        </form>
      </DashboardCard>
      </section>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-zinc-500">
            Signed in as <span className="text-zinc-200">{email}</span>
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setResetConfirmOpen(true)}
            disabled={resettingJournal}
            className="h-9 rounded-xl border-white/[0.12] bg-white/[0.03] px-3.5 text-[12px] text-zinc-300 hover:bg-white/[0.06]"
          >
            <AlertTriangle className="mr-1.5 size-3.5 opacity-80" strokeWidth={1.8} />
            {resettingJournal ? "Resetting…" : "Reset journal"}
          </Button>
        </div>
      </section>
      <ConfirmDialog
        open={resetConfirmOpen}
        onCancel={() => {
          if (resettingJournal) return;
          setResetConfirmOpen(false);
          setResetConfirmText("");
        }}
        onConfirm={() => void onResetJournal()}
        destructive
        pending={resettingJournal}
        title="Reset entire journal?"
        description='This permanently deletes all journal entries and weekly reflections. Type "RESET JOURNAL" to confirm.'
        confirmLabel="Reset permanently"
      >
        <Input
          value={resetConfirmText}
          onChange={(e) => setResetConfirmText(e.target.value)}
          placeholder='Type "RESET JOURNAL"'
          className="h-10 rounded-xl border-rose-500/30 bg-black/20 text-[13px] text-zinc-100 placeholder:text-zinc-500"
        />
      </ConfirmDialog>
    </div>
  );
}
