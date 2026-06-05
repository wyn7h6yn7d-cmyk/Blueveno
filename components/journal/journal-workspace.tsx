"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CalendarDays, Check, ChevronRight, LineChart, NotebookPen, Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { compareJournalRecency, dayKeyFromRow, startOfWeekMonday, toDayKey } from "@/lib/user-data/journal-metrics";
import { localTodayKey, useFollowLocalToday } from "@/lib/user-data/local-today";
import { EmptyState } from "@/components/app/empty-state";
import { JournalEntryDetailPanel } from "@/components/journal/journal-entry-detail-panel";
import { JournalNotebookIndex } from "@/components/journal/journal-notebook-index";
import { JournalNotebookLayout } from "@/components/journal/journal-notebook-layout";
import {
  journalTabToParam,
  parseJournalHashTab,
  resolveJournalTab,
  type JournalWorkspaceTab,
} from "@/lib/journal/journal-tab";
import { JournalWeeklyReviewPanel } from "@/components/journal/journal-weekly-review-panel";
import { chartUrlForSave, isValidChartUrl } from "@/lib/chart-link";
import { useAccess } from "@/components/access/access-provider";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { ReadOnlyBlockedNotice } from "@/components/access/read-only-blocked-notice";
import { appFormControl, appFormLabel } from "@/lib/ui/app-form";
import { createClient } from "@/lib/supabase/client";
import { waitForSessionUser } from "@/lib/supabase/wait-for-browser-session";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useAppToast } from "@/components/app/app-toast-provider";
import { InlineFeedback } from "@/components/app/inline-feedback";
import { formatUserError } from "@/lib/feedback/format-error";
import { notifyReadOnlyBlocked } from "@/lib/feedback/read-only-action";
import { PRODUCT_ANALYTICS_EVENTS } from "@/lib/analytics/product-events";
import { trackExportCsvClicked, trackProductEvent } from "@/lib/analytics/track-product-event";
import { feedbackToneFromMessage } from "@/lib/feedback/feedback-tone";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import { fetchJournalEntriesForExport } from "@/lib/export/user-exports";
import { syncLegacyBehaviorFromRuleChecks } from "@/lib/user-data/sync-rule-checks";
import {
  MARKET_CONDITION_OPTIONS,
  MISTAKE_TAG_OPTIONS,
  SESSION_TAG_OPTIONS,
  SETUP_TAG_OPTIONS,
} from "@/lib/user-data/journal-tags";
import {
  applyEntryFilters,
  DAY_COLOR_FILTER_LABELS,
  EMPTY_ENTRY_FILTERS,
  hasActiveFilters,
  parseFiltersFromParams,
  writeFiltersToParams,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";
import { appFormSelect } from "@/lib/ui/app-form";
import {
  isRetryableWeeklyReflectionSchemaError,
  isWeeklyReflectionTableMissing,
  queryWeeklyReflectionWithFallback,
} from "@/lib/user-data/weekly-reflection-columns";
import { formatWeekHeadline } from "@/lib/user-data/week-labels";
import { getDefaultSessionTagForNewEntry, sanitizeSessionTagForDb } from "@/lib/session";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
  highlightDate?: string;
  initialWeekAnchorDate?: string;
  userTimezone?: string | null;
};

const labelCls = appFormLabel;
const inputCls = appFormControl;
const notebookTextareaCls = cn(
  "w-full resize-y rounded-xl border border-white/[0.1] bg-black/20 px-4 py-3.5 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600",
  "shadow-[inset_0_1px_2px_oklch(0_0_0/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.35)] disabled:opacity-45",
);
const MOOD_OPTIONS = ["Calm", "Focused", "Hesitant", "Tilted"] as const;
function CheckPill({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex min-h-10 min-w-0 items-center gap-2.5 rounded-full border px-3.5 py-2 text-left text-[13px] font-medium transition-[border-color,background,color,box-shadow]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.58_0.12_252/0.4)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.08_0.03_266)]",
        checked
          ? "border-[oklch(0.58_0.12_252/0.42)] bg-[oklch(0.58_0.12_252/0.12)] text-zinc-50 shadow-[0_0_24px_-14px_oklch(0.48_0.14_252/0.55)]"
          : "border-white/[0.09] bg-white/[0.02] text-zinc-400 hover:border-white/[0.16] hover:bg-white/[0.04] hover:text-zinc-200",
        disabled && "pointer-events-none opacity-45",
      )}
    >
      <span
        className={cn(
          "flex size-[1.125rem] shrink-0 items-center justify-center rounded-full border transition-colors",
          checked
            ? "border-[oklch(0.72_0.11_252)] bg-[oklch(0.58_0.12_252/0.45)] text-zinc-950"
            : "border-white/[0.18] bg-transparent",
        )}
        aria-hidden
      >
        {checked ? <Check className="size-2.5" strokeWidth={2.5} /> : null}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function JournalFormSection({
  step,
  title,
  description,
  children,
  accent,
}: {
  step: string;
  title: string;
  description?: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={cn(
        "space-y-4 py-6 first:pt-1",
        accent && "rounded-xl bg-[linear-gradient(165deg,oklch(0.11_0.038_262/0.35),oklch(0.08_0.028_266/0.15))] px-1 sm:px-2",
      )}
    >
      <header className="space-y-1">
        <p className="text-[12px] font-medium text-zinc-500">Step {step}</p>
        <p className="text-[15px] font-medium tracking-tight text-zinc-100">{title}</p>
        {description ? <p className="text-[13px] leading-relaxed text-zinc-500">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

function JournalFormCollapsible({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-t border-white/[0.05]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-5 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex min-w-0 items-center gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-[11px] font-medium tabular-nums text-zinc-500">
            {step}
          </span>
          <span className="min-w-0">
            <span className="text-[14px] font-medium text-zinc-200">{title}</span>
            <span className="ml-2 text-[12px] font-normal text-zinc-600">optional</span>
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-zinc-600 transition-transform group-open:rotate-90" strokeWidth={1.75} />
      </summary>
      <div className="space-y-4 pb-6 pt-0">{children}</div>
    </details>
  );
}
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
  if (message.includes("jwt") || message.includes("token") || message.includes("session")) {
    return "Please refresh and try again.";
  }
  if (isWeeklyReflectionTableMissing(error?.message, error?.code)) {
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

export function JournalWorkspace({
  userId,
  email,
  initialWorkspace,
  highlightDate,
  initialWeekAnchorDate,
  userTimezone,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { canWriteJournal, displayCurrency } = useAccess();
  const toast = useAppToast();
  const { accounts } = useTradingAccountsWorkspace();
  const { data, ready, activeAccountId, addRow, lastError, resetJournal, refetchJournal } = useUserWorkspace(userId, {
    initialWorkspace,
  });
  const [entryDate, setEntryDate] = useState(() => localTodayKey());
  const setEntryDateTracked = useFollowLocalToday(entryDate, setEntryDate);
  const [symbol, setSymbol] = useState("");
  const [pnl, setPnl] = useState("");
  const [setupTag, setSetupTag] = useState<"" | (typeof SETUP_TAG_OPTIONS)[number]>("");
  const [mistakeTag, setMistakeTag] = useState<"" | (typeof MISTAKE_TAG_OPTIONS)[number]>("");
  const sessionTagManualRef = useRef(false);
  const [sessionTag, setSessionTag] = useState<"" | (typeof SESSION_TAG_OPTIONS)[number]>(() =>
    getDefaultSessionTagForNewEntry(userTimezone),
  );
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
  const [weekAnchorDate, setWeekAnchorDate] = useState(() => initialWeekAnchorDate ?? localTodayKey());
  const setWeekAnchorDateTracked = useFollowLocalToday(weekAnchorDate, setWeekAnchorDate, {
    enabled: !initialWeekAnchorDate,
  });
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
  const [savedWeekKey, setSavedWeekKey] = useState<string | null>(null);
  const [resettingJournal, setResettingJournal] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reviewedWeekStarts, setReviewedWeekStarts] = useState<string[]>([]);
  const workspaceTab = useMemo(
    () => resolveJournalTab(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const selectedEntryId = searchParams.get("entry");
  const filters = useMemo(
    () => parseFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [personalRules, setPersonalRules] = useState<PersonalRuleRow[]>([]);
  const [manualRuleChecks, setManualRuleChecks] = useState<Record<string, boolean>>({});
  const ruleChecks = useMemo(() => {
    const next: Record<string, boolean> = { ...manualRuleChecks };
    for (const r of personalRules) {
      if (!(r.id in next)) next[r.id] = false;
    }
    for (const rule of personalRules) {
      const t = rule.title.toLowerCase();
      if (t === "followed my plan") next[rule.id] = followedPlan;
      else if (t === "respected my stop") next[rule.id] = respectedStop;
      else if (t === "no revenge trade") next[rule.id] = noRevengeTrade;
    }
    return next;
  }, [manualRuleChecks, personalRules, followedPlan, respectedStop, noRevengeTrade]);
  const [fetchedRelatedWeekly, setFetchedRelatedWeekly] = useState<WeeklyReflectionRow | null>(null);
  const weekStartKey = useMemo(() => {
    const base = new Date(`${weekAnchorDate}T12:00:00`);
    return toDayKey(startOfWeekMonday(base));
  }, [weekAnchorDate]);
  const weeklySaved =
    savedWeekKey !== null && savedWeekKey === `${weekStartKey}:${activeAccountId ?? ""}`;

  const sortedRows = useMemo(() => [...data.journal].sort(compareJournalRecency), [data.journal]);

  const replaceSearchParams = useCallback(
    (mutate: (base: URLSearchParams) => void) => {
      const base = new URLSearchParams(searchParams.toString());
      mutate(base);
      const nextQuery = base.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setWorkspaceTab = useCallback(
    (tab: JournalWorkspaceTab, options?: { keepEntry?: boolean }) => {
      replaceSearchParams((base) => {
        base.set("tab", journalTabToParam(tab));
        if (tab !== "review" && !options?.keepEntry) {
          base.delete("entry");
        }
      });
    },
    [replaceSearchParams],
  );

  const selectEntry = useCallback(
    (id: string) => {
      replaceSearchParams((base) => {
        base.set("entry", id);
        base.set("tab", "review");
      });
    },
    [replaceSearchParams],
  );

  const setFilters = useCallback(
    (updater: EntryFilters | ((prev: EntryFilters) => EntryFilters)) => {
      const next = typeof updater === "function" ? updater(filters) : updater;
      replaceSearchParams((base) => {
        writeFiltersToParams(base, next);
      });
    },
    [filters, replaceSearchParams],
  );

  const hashMigratedRef = useRef(false);
  useLayoutEffect(() => {
    if (typeof window === "undefined" || hashMigratedRef.current) return;
    const hashTab = parseJournalHashTab(window.location.hash);
    if (!hashTab) return;
    hashMigratedRef.current = true;
    replaceSearchParams((base) => {
      base.set("tab", journalTabToParam(hashTab));
    });
    const url = new URL(window.location.href);
    url.hash = "";
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }, [replaceSearchParams]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const tabParam = searchParams.get("tab");
    const shouldScrollAdd = workspaceTab === "add" && tabParam === "add";
    const shouldScrollWeekly =
      workspaceTab === "weekly" && (tabParam === "week" || tabParam === "weekly");
    if (!shouldScrollAdd && !shouldScrollWeekly) return;
    window.requestAnimationFrame(() => {
      if (shouldScrollAdd) {
        document.getElementById("add")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (shouldScrollWeekly) {
        document.getElementById("weekly-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, [workspaceTab, searchParams]);

  const lastSyncedDayRef = useRef(localTodayKey());
  useEffect(() => {
    const syncDay = () => {
      const today = localTodayKey();
      if (today !== lastSyncedDayRef.current) {
        lastSyncedDayRef.current = today;
        void refetchJournal();
      }
    };
    syncDay();
    const intervalId = window.setInterval(syncDay, 60_000);
    return () => window.clearInterval(intervalId);
  }, [refetchJournal]);

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
      setManualRuleChecks((prev) => {
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

  const filteredRows = useMemo(() => applyEntryFilters(sortedRows, filters), [sortedRows, filters]);
  const filtersActive = hasActiveFilters(filters);

  const effectiveSelectedEntryId = useMemo(() => {
    if (selectedEntryId) return selectedEntryId;
    if (workspaceTab === "review" && filteredRows.length > 0) return filteredRows[0]!.id;
    return null;
  }, [selectedEntryId, workspaceTab, filteredRows]);

  const selectedEntry = useMemo(() => {
    if (!effectiveSelectedEntryId) return null;
    return sortedRows.find((row) => row.id === effectiveSelectedEntryId) ?? null;
  }, [effectiveSelectedEntryId, sortedRows]);

  const selectedEntryWeekStart = useMemo(() => {
    if (!selectedEntry) return null;
    const dayKey = dayKeyFromRow(selectedEntry.entryDate, selectedEntry.createdAt);
    return toDayKey(startOfWeekMonday(new Date(`${dayKey}T12:00:00`)));
  }, [selectedEntry]);

  const todayActivityCount = useMemo(() => {
    const today = localTodayKey();
    return filteredRows.filter((row) => dayKeyFromRow(row.entryDate, row.createdAt) === today).length;
  }, [filteredRows]);

  useEffect(() => {
    if (!highlightDate) return;
    setEntryDateTracked(highlightDate);
  }, [highlightDate, setEntryDateTracked]);

  useEffect(() => {
    if (highlightDate) return;
    const today = localTodayKey();
    if (entryDate < today) {
      setEntryDateTracked(today);
    }
  }, [highlightDate, entryDate, setEntryDateTracked]);

  useEffect(() => {
    if (!ready || !activeAccountId) return;
    void refetchJournal();
  }, [ready, activeAccountId, refetchJournal]);

  useEffect(() => {
    if (!highlightDate || !ready || filteredRows.length === 0) return;
    const t = window.setTimeout(() => {
      const el = document.querySelector(`[data-journal-date="${highlightDate}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [highlightDate, ready, filteredRows.length]);

  const applyWeeklyRow = useCallback((row: WeeklyReflectionRow | null) => {
    setWeeklyWorked(row?.what_worked ?? "");
    setWeeklySlipped(row?.what_slipped ?? "");
    setWeeklyFocus(row?.next_week_focus ?? "");
    setWeeklyRule(row?.next_week_rule ?? "");
    setWeeklyConfidence(row?.confidence_score ?? null);
    setWeeklyNote(row?.weekly_note ?? "");
  }, []);

  const loadWeeklyReflection = useCallback(async (): Promise<boolean> => {
    if (!userId || !activeAccountId) {
      applyWeeklyRow(null);
      setWeeklyMsg(null);
      setWeeklyUnavailable(false);
      setWeeklyLoading(false);
      return false;
    }
    setWeeklyLoading(true);
    const supabase = createClient();
    try {
      const sessionOk = await waitForSessionUser(supabase, userId, () => false);
      if (!sessionOk) {
        throw { message: "Session not ready." } satisfies SupabaseErrorLike;
      }
      const { data, error } = await queryWeeklyReflectionWithFallback(async (select, useAccountScope) => {
        let q = supabase
          .from("weekly_reflections")
          .select(select)
          .eq("user_id", userId)
          .eq("week_start", weekStartKey);
        if (useAccountScope) {
          q = q.eq("account_id", activeAccountId);
        }
        const result = await q.maybeSingle();
        return { data: result.data, error: result.error };
      });
      if (error) throw error;
      applyWeeklyRow((data ?? null) as WeeklyReflectionRow | null);
      setWeeklyMsg(null);
      setWeeklyUnavailable(false);
      return true;
    } catch (error) {
      const err = error as SupabaseErrorLike;
      const msg = weeklyReflectionErrorMessage(err, "load");
      setWeeklyMsg(msg);
      setWeeklyUnavailable(isWeeklyReflectionTableMissing(err?.message, err?.code));
      return false;
    } finally {
      setWeeklyLoading(false);
    }
  }, [userId, weekStartKey, activeAccountId, applyWeeklyRow]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!userId || !activeAccountId) {
        if (cancelled) return;
        applyWeeklyRow(null);
        setWeeklyMsg(null);
        setWeeklyUnavailable(false);
        setWeeklyLoading(false);
        return;
      }
      setWeeklyLoading(true);
      const supabase = createClient();
      try {
        const sessionOk = await waitForSessionUser(supabase, userId, () => cancelled);
        if (!sessionOk || cancelled) {
          throw { message: "Session not ready." } satisfies SupabaseErrorLike;
        }
        const { data, error } = await queryWeeklyReflectionWithFallback(async (select, useAccountScope) => {
          let q = supabase
            .from("weekly_reflections")
            .select(select)
            .eq("user_id", userId)
            .eq("week_start", weekStartKey);
          if (useAccountScope) {
            q = q.eq("account_id", activeAccountId);
          }
          const result = await q.maybeSingle();
          return { data: result.data, error: result.error };
        });
        if (cancelled) return;
        if (error) throw error;
        applyWeeklyRow((data ?? null) as WeeklyReflectionRow | null);
        setWeeklyMsg(null);
        setWeeklyUnavailable(false);
      } catch (error) {
        if (cancelled) return;
        const err = error as SupabaseErrorLike;
        const msg = weeklyReflectionErrorMessage(err, "load");
        setWeeklyMsg(msg);
        setWeeklyUnavailable(isWeeklyReflectionTableMissing(err?.message, err?.code));
      } finally {
        if (!cancelled) setWeeklyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, weekStartKey, activeAccountId, applyWeeklyRow]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: rows } = await supabase
        .from("weekly_reflections")
        .select("week_start, what_worked, what_slipped, next_week_focus")
        .eq("user_id", userId);
      if (cancelled) return;
      const reviewed = ((rows ?? []) as Array<{ week_start: string; what_worked?: string | null; what_slipped?: string | null; next_week_focus?: string | null }>)
        .filter((row) => Boolean(row.what_worked?.trim() || row.what_slipped?.trim() || row.next_week_focus?.trim()))
        .map((row) => row.week_start);
      setReviewedWeekStarts(reviewed);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, savedWeekKey]);

  const relatedWeeklyReflection = useMemo((): WeeklyReflectionRow | null => {
    if (!selectedEntryWeekStart) return null;
    if (selectedEntryWeekStart === weekStartKey && !weeklyLoading) {
      return {
        week_start: weekStartKey,
        account_id: activeAccountId,
        what_worked: weeklyWorked.trim() || null,
        what_slipped: weeklySlipped.trim() || null,
        next_week_focus: weeklyFocus.trim() || null,
        next_week_rule: weeklyRule.trim() || null,
        confidence_score: weeklyConfidence,
        weekly_note: weeklyNote.trim() || null,
      };
    }
    return fetchedRelatedWeekly;
  }, [
    selectedEntryWeekStart,
    weekStartKey,
    weeklyLoading,
    activeAccountId,
    weeklyWorked,
    weeklySlipped,
    weeklyFocus,
    weeklyRule,
    weeklyConfidence,
    weeklyNote,
    fetchedRelatedWeekly,
  ]);

  useEffect(() => {
    if (!selectedEntryWeekStart || !userId || selectedEntryWeekStart === weekStartKey) return;
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const { data, error } = await queryWeeklyReflectionWithFallback(async (select, useAccountScope) => {
        let q = supabase
          .from("weekly_reflections")
          .select(select)
          .eq("user_id", userId)
          .eq("week_start", selectedEntryWeekStart);
        if (useAccountScope && activeAccountId) {
          q = q.eq("account_id", activeAccountId);
        }
        const result = await q.maybeSingle();
        return { data: result.data, error: result.error };
      });
      if (cancelled || error) return;
      setFetchedRelatedWeekly((data ?? null) as WeeklyReflectionRow | null);
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedEntryWeekStart, weekStartKey, userId, activeAccountId]);

  const relatedWeeklyReview = useMemo(() => {
    if (!relatedWeeklyReflection || !selectedEntryWeekStart) return null;
    const hasContent = Boolean(
      relatedWeeklyReflection.what_worked?.trim() ||
        relatedWeeklyReflection.what_slipped?.trim() ||
        relatedWeeklyReflection.next_week_focus?.trim() ||
        relatedWeeklyReflection.next_week_rule?.trim(),
    );
    if (!hasContent) return null;
    return {
      weekLabel: formatWeekHeadline(selectedEntryWeekStart),
      whatWorked: relatedWeeklyReflection.what_worked,
      whatSlipped: relatedWeeklyReflection.what_slipped,
      nextWeekFocus: relatedWeeklyReflection.next_week_focus,
      nextWeekRule: relatedWeeklyReflection.next_week_rule,
      confidenceScore: relatedWeeklyReflection.confidence_score,
    };
  }, [relatedWeeklyReflection, selectedEntryWeekStart]);

  const touchWeeklyForm = useCallback(() => {
    setSavedWeekKey(null);
  }, []);

  const onQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) {
      notifyReadOnlyBlocked(toast, "journal_create");
      return;
    }
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
    const behavior = syncLegacyBehaviorFromRuleChecks(personalRules, ruleChecks, {
      followedPlan,
      respectedStop,
      noRevengeTrade,
    });
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
      followedPlan: behavior.followedPlan,
      respectedStop: behavior.respectedStop,
      noRevengeTrade: behavior.noRevengeTrade,
      sessionTag:
        sanitizeSessionTagForDb(sessionTag) ?? getDefaultSessionTagForNewEntry(userTimezone),
      marketCondition: marketCondition || undefined,
      lessonLearned: lessonLearned.trim() || undefined,
      ruleChecks,
    });
    setSaving(false);
    if (!result.ok) {
      const msg = formatUserError(result.error ?? lastError, "Could not save this trading day.");
      setSaveError(msg);
      toast.error(msg);
      return;
    }
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.journalEntryCreated, { surface: "journal" });
    toast.success("Trading day saved.");
    void refetchJournal();
    if (result.ok && result.id) selectEntry(result.id);
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
    setManualRuleChecks((prev) => Object.fromEntries(Object.keys(prev).map((k) => [k, false])));
  };

  const onSaveWeeklyReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteJournal) {
      notifyReadOnlyBlocked(toast, "weekly_review");
      return;
    }
    if (!userId || !activeAccountId) return;
    setWeeklyMsg(null);
    setSavedWeekKey(null);
    setWeeklySaving(true);
    const supabase = createClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser.user?.id !== userId) {
      setWeeklySaving(false);
      setWeeklyMsg("Session not ready. Refresh the page and try again.");
      return;
    }
    const coreFields = {
      what_worked: weeklyWorked.trim() || null,
      what_slipped: weeklySlipped.trim() || null,
      next_week_focus: weeklyFocus.trim() || null,
    };
    const saveAttempts: Array<{ payload: Record<string, unknown>; onConflict: string }> = [
      {
        payload: {
          user_id: userId,
          account_id: activeAccountId,
          week_start: weekStartKey,
          ...coreFields,
          next_week_rule: weeklyRule.trim() || null,
          confidence_score: weeklyConfidence,
          weekly_note: weeklyNote.trim() || null,
        },
        onConflict: "user_id,account_id,week_start",
      },
      {
        payload: {
          user_id: userId,
          account_id: activeAccountId,
          week_start: weekStartKey,
          ...coreFields,
        },
        onConflict: "user_id,account_id,week_start",
      },
      {
        payload: {
          user_id: userId,
          week_start: weekStartKey,
          ...coreFields,
        },
        onConflict: "user_id,week_start",
      },
    ];

    let error: SupabaseErrorLike | null = null;

    for (const attempt of saveAttempts) {
      const upsertResult = await supabase
        .from("weekly_reflections")
        .upsert(attempt.payload, { onConflict: attempt.onConflict });
      error = upsertResult.error;

      if (!error) break;

      if (
        error.code === "42P10" ||
        error.message?.toLowerCase().includes("on conflict") ||
        error.message?.toLowerCase().includes("unique or exclusion constraint")
      ) {
        const insertResult = await supabase.from("weekly_reflections").insert(attempt.payload);
        if (insertResult.error?.code === "23505") {
          let updateQuery = supabase
            .from("weekly_reflections")
            .update(attempt.payload)
            .eq("user_id", userId)
            .eq("week_start", weekStartKey);
          if ("account_id" in attempt.payload) {
            updateQuery = updateQuery.eq("account_id", activeAccountId);
          }
          const updateResult = await updateQuery;
          error = updateResult.error;
        } else {
          error = insertResult.error;
        }
      }

      if (!error) break;
      if (!isRetryableWeeklyReflectionSchemaError(error.message, error.code)) break;
    }

    if (error) {
      setWeeklySaving(false);
      const msg = weeklyReflectionErrorMessage(error, "save");
      setWeeklyMsg(msg);
      toast.error(formatUserError(error, msg));
      setWeeklyUnavailable(isWeeklyReflectionTableMissing(error.message, error.code));
      return;
    }

    const reloaded = await loadWeeklyReflection();
    setWeeklySaving(false);
    if (reloaded) {
      setSavedWeekKey(`${weekStartKey}:${activeAccountId}`);
      trackProductEvent(PRODUCT_ANALYTICS_EVENTS.weeklyReviewSaved, { surface: "journal" });
      setWeeklyMsg("Weekly review saved.");
      toast.success("Weekly review saved.");
      setWeeklyUnavailable(false);
    } else {
      setWeeklyMsg("Saved, but could not refresh — reload the page to confirm.");
      toast.info("Saved. Refresh the page if fields look out of date.");
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
      trackExportCsvClicked("journal", "journal");
      triggerCsvDownload(`blueveno-journal-${fileDate()}.csv`, csv);
      const okMsg = `Journal CSV ready (${csvRows.length} rows).`;
      setExportMsg(okMsg);
      toast.success(okMsg);
    } catch (error) {
      const msg = formatUserError(error, "Could not export journal CSV.");
      setExportMsg(msg);
      toast.error(msg);
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Journal"
        title="Trading notebook"
        description="Add entries fast, review your notebook, and close the week in one calm workspace."
        actions={
          <div className="app-page-actions-mobile flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link href="/app/calendar" className={appSecondaryCta}>
              <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              Calendar
            </Link>
            <button type="button" onClick={onExportCsv} className={appSecondaryCta} disabled={exportBusy}>
              <LineChart className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              {exportBusy ? "Exporting…" : "Export CSV"}
            </button>
            {canWriteJournal ? (
              <button
                type="button"
                onClick={() => {
                  setWorkspaceTab("add");
                  window.requestAnimationFrame(() => {
                    document.getElementById("add")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
                className={cn(appPrimaryCta, "shadow-[0_18px_45px_-22px_oklch(0.52_0.14_252/0.62)]")}
              >
                <Plus className="mr-2 size-4" strokeWidth={2} />
                Add entry
              </button>
            ) : null}
          </div>
        }
      />
      {resetMsg ? (
        <p className={cn("text-[13px]", resetMsg.includes("completed") ? "text-zinc-400" : "text-rose-300/95")}>
          {resetMsg}
        </p>
      ) : null}
      <InlineFeedback message={exportMsg} tone={feedbackToneFromMessage(exportMsg)} />

      <JournalNotebookLayout
        tab={workspaceTab}
        onTabChange={setWorkspaceTab}
        reviewIndex={
          <DashboardCard
            eyebrow="Notebook"
            title={highlightDate ? `Entries · ${highlightDate}` : "Entry index"}
            className="min-h-0 min-w-0"
            description={
              highlightDate
                ? "Entries for the selected calendar day."
                : todayActivityCount > 0
                  ? `${todayActivityCount} logged today · ${filteredRows.length} in view`
                  : "Select an entry to review, or log a new day."
            }
          >
            {filtersActive ? (
              <div className="mb-3 rounded-xl border border-[oklch(0.58_0.12_252/0.28)] bg-[oklch(0.58_0.12_252/0.1)] px-3 py-2">
                <button type="button" onClick={() => setFilters(EMPTY_ENTRY_FILTERS)} className="text-[11px] text-bv-ice hover:underline">
                  Clear filters
                </button>
              </div>
            ) : null}
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="inline-flex h-8 items-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-[12px] text-zinc-300 hover:bg-white/[0.06]"
              >
                {filtersOpen ? "Hide filters" : "Filter"}
              </button>
              <button
                type="button"
                onClick={() => void refetchJournal()}
                className="inline-flex h-8 items-center rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-[12px] text-zinc-300 hover:bg-white/[0.06]"
              >
                Refresh
              </button>
            </div>
            {filtersOpen ? (
              <div className="mb-3 grid gap-2 rounded-xl bg-white/[0.02] p-3">
                <Input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Search symbol or note" className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[13px]" />
                <select value={filters.dayColor} onChange={(e) => setFilters((f) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))} className={appFormSelect}>
                  {(Object.keys(DAY_COLOR_FILTER_LABELS) as EntryFilters["dayColor"][]).map((key) => (
                    <option key={key} value={key}>{DAY_COLOR_FILTER_LABELS[key]}</option>
                  ))}
                </select>
              </div>
            ) : null}
            {sortedRows.length === 0 ? (
              <EmptyState icon={NotebookPen} title="No entries yet" description="Log your first trading day to start the notebook." className="border-none bg-transparent py-6 ring-0" />
            ) : filteredRows.length === 0 ? (
              <EmptyState icon={NotebookPen} title="No matches" description="Adjust filters to see entries." className="border-none bg-transparent py-6 ring-0" />
            ) : (
              <JournalNotebookIndex
                rows={filteredRows}
                selectedId={effectiveSelectedEntryId}
                onSelect={selectEntry}
                displayCurrency={displayCurrency}
                highlightDate={highlightDate}
              />
            )}
          </DashboardCard>
        }
        addPanel={
        <DashboardCard
          eyebrow="Add trading day"
          title="New journal entry"
          className="min-h-0 min-w-0"
          description={
            canWriteJournal
              ? "Date, symbol, P&L, note, behavior, and optional linked chart."
              : "Read-only — your history stays here."
          }
        >
          <form id="add" onSubmit={onQuickAdd} className="min-w-0">
            <JournalFormSection step="1" title="Result" description="The day, symbol, and P&amp;L that anchor everything else.">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jw-date" className={labelCls}>
                    Date
                  </Label>
                  <Input
                    id="jw-date"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDateTracked(e.target.value)}
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
            </JournalFormSection>

            <JournalFormSection
              step="2"
              title="Behavior"
              description="Mood and discipline — quick taps before you save."
              accent
            >
              <div className="space-y-5">
              <div className="space-y-2 sm:max-w-[11rem]">
                <Label htmlFor="jw-mood" className={labelCls}>
                  Mood
                </Label>
                <select
                  id="jw-mood"
                  value={moodState}
                  onChange={(e) => setMoodState(e.target.value as "" | (typeof MOOD_OPTIONS)[number])}
                  disabled={!canWriteJournal}
                  className={cn(inputCls, "h-10 w-full rounded-xl px-3.5 text-[14px] disabled:opacity-45")}
                >
                  <option value="">Choose mood</option>
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <p className={labelCls}>Discipline</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Followed plan", checked: followedPlan, set: setFollowedPlan },
                    { label: "Respected stop", checked: respectedStop, set: setRespectedStop },
                    { label: "No revenge", checked: noRevengeTrade, set: setNoRevengeTrade },
                  ].map((c) => (
                    <CheckPill
                      key={c.label}
                      label={c.label}
                      checked={c.checked}
                      onChange={c.set}
                      disabled={!canWriteJournal}
                    />
                  ))}
                </div>
              </div>
              {personalRules.length > 0 ? (
                <div className="space-y-2 border-t border-white/[0.06] pt-4">
                  <p className={labelCls}>Your active rules</p>
                  <div className="flex flex-wrap gap-2">
                    {personalRules.map((rule) => (
                      <CheckPill
                        key={rule.id}
                        label={rule.title}
                        checked={Boolean(ruleChecks[rule.id])}
                        onChange={(next) => setManualRuleChecks((prev) => ({ ...prev, [rule.id]: next }))}
                        disabled={!canWriteJournal}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              </div>
            </JournalFormSection>

            <JournalFormCollapsible step="3" title="Context">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jw-setup" className={labelCls}>
                    Setup tag
                  </Label>
                  <select
                    id="jw-setup"
                    value={setupTag}
                    onChange={(e) => setSetupTag(e.target.value as "" | (typeof SETUP_TAG_OPTIONS)[number])}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose setup</option>
                    {SETUP_TAG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-mistake" className={labelCls}>
                    Mistake tag
                  </Label>
                  <select
                    id="jw-mistake"
                    value={mistakeTag}
                    onChange={(e) => setMistakeTag(e.target.value as "" | (typeof MISTAKE_TAG_OPTIONS)[number])}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose mistake</option>
                    {MISTAKE_TAG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-session" className={labelCls}>
                    Session tag
                  </Label>
                  <select
                    id="jw-session"
                    value={sessionTag}
                    onChange={(e) => {
                      sessionTagManualRef.current = true;
                      setSessionTag(e.target.value as "" | (typeof SESSION_TAG_OPTIONS)[number]);
                    }}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose session</option>
                    {SESSION_TAG_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jw-market-condition" className={labelCls}>
                    Market condition
                  </Label>
                  <select
                    id="jw-market-condition"
                    value={marketCondition}
                    onChange={(e) => setMarketCondition(e.target.value as "" | (typeof MARKET_CONDITION_OPTIONS)[number])}
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "w-full rounded-xl px-3.5 disabled:opacity-45")}
                  >
                    <option value="">Choose market condition</option>
                    {MARKET_CONDITION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </JournalFormCollapsible>

            <JournalFormCollapsible step="4" title="Review">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jw-note" className={labelCls}>
                    Note
                  </Label>
                  <textarea
                    id="jw-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                    placeholder="What stood out today? Execution, emotions, and context."
                    disabled={!canWriteJournal}
                    className={cn(notebookTextareaCls, "disabled:opacity-45")}
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
                    rows={3}
                    placeholder="One thing to repeat or avoid next time."
                    disabled={!canWriteJournal}
                    className={cn(notebookTextareaCls, "text-[14px] disabled:opacity-45")}
                  />
                </div>
              </div>
            </JournalFormCollapsible>

            <JournalFormCollapsible step="5" title="Chart link">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.04] text-[oklch(0.74_0.11_252)]">
                  <LineChart className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="jw-chart-link" className={labelCls}>
                    Linked chart
                  </Label>
                  <p className="text-[12px] leading-relaxed text-zinc-500">Paste a chart URL to keep with this day.</p>
                  <Input
                    id="jw-chart-link"
                    type="url"
                    value={chartUrl}
                    onChange={(e) => setChartUrl(e.target.value)}
                    placeholder="Paste a chart URL"
                    disabled={!canWriteJournal}
                    className={cn(inputCls, "disabled:opacity-45")}
                  />
                </div>
              </div>
            </JournalFormCollapsible>

            <div className="sticky bottom-0 z-10 -mx-1 border-t border-white/[0.08] bg-[linear-gradient(180deg,oklch(0.1_0.035_266/0.98),oklch(0.085_0.032_268/0.99))] px-1 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-6 sm:pb-0 sm:backdrop-blur-none">
            <Button
              type="submit"
              disabled={saving || !canWriteJournal || !activeAccountId}
              className={cn(
                "mt-0 h-12 w-full rounded-xl text-base font-semibold tracking-tight sm:text-[15px]",
                "bg-[linear-gradient(180deg,oklch(0.74_0.14_250),oklch(0.66_0.15_252))] text-[oklch(0.1_0.04_265)]",
                "shadow-[0_1px_0_0_oklch(1_0_0_/0.14)_inset,0_18px_46px_-15px_oklch(0.42_0.14_252/0.58)] hover:brightness-[1.04] disabled:opacity-40",
              )}
            >
              <Plus className="mr-2 size-4" strokeWidth={2} />
              {saving ? "Saving…" : "Save trading day"}
            </Button>
            {!canWriteJournal ? (
              <ReadOnlyBlockedNotice compact context="adding trading days" />
            ) : null}
            {canWriteJournal && !activeAccountId ? (
              <p className="text-[13px] text-zinc-400">
                Select an active trading account first (topbar account selector or Settings → Trading accounts).
              </p>
            ) : null}
            {urlError ? <p className="mt-3 text-[13px] text-rose-300/95">{urlError}</p> : null}
            <InlineFeedback message={saveError} tone="error" className="mt-3" />
            </div>
          </form>
        </DashboardCard>
        }
        reviewDetail={
          selectedEntry ? (
            <DashboardCard
              eyebrow="Review"
              title="Entry detail"
              className="min-h-0 min-w-0"
              description="Calm read-only review of your logged fields."
            >
              <JournalEntryDetailPanel
                row={selectedEntry}
                currency={displayCurrency}
                userTimezone={userTimezone}
                canWriteJournal={canWriteJournal}
                weekReviewed={selectedEntryWeekStart ? reviewedWeekStarts.includes(selectedEntryWeekStart) : false}
                weekLabel={selectedEntryWeekStart ? formatWeekHeadline(selectedEntryWeekStart) : undefined}
                relatedWeeklyReview={relatedWeeklyReview}
                onOpenWeekReview={() => {
                  if (!selectedEntry) return;
                  const dayKey = dayKeyFromRow(selectedEntry.entryDate, selectedEntry.createdAt);
                  setWeekAnchorDateTracked(dayKey);
                  setWorkspaceTab("weekly");
                  window.requestAnimationFrame(() => {
                    document.getElementById("weekly-review")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
              />
            </DashboardCard>
          ) : (
            <DashboardCard eyebrow="Review" title="Select an entry" description="Choose a day from the notebook index.">
              <EmptyState
                icon={NotebookPen}
                title="Nothing selected"
                description="Pick an entry on the left, or switch to Add entry to log a new trading day."
                action={
                  canWriteJournal ? (
                    <button type="button" onClick={() => setWorkspaceTab("add")} className={appPrimaryCta}>
                      Add entry
                    </button>
                  ) : undefined
                }
                className="border-none bg-transparent py-8 ring-0"
              />
            </DashboardCard>
          )
        }
        weeklyPanel={
          <JournalWeeklyReviewPanel
            weekAnchorDate={weekAnchorDate}
            onWeekAnchorDateChange={(value) => {
              touchWeeklyForm();
              setWeekAnchorDateTracked(value);
            }}
            weekStartKey={weekStartKey}
            weeklyWorked={weeklyWorked}
            onWeeklyWorkedChange={(value) => {
              touchWeeklyForm();
              setWeeklyWorked(value);
            }}
            weeklySlipped={weeklySlipped}
            onWeeklySlippedChange={(value) => {
              touchWeeklyForm();
              setWeeklySlipped(value);
            }}
            weeklyFocus={weeklyFocus}
            onWeeklyFocusChange={(value) => {
              touchWeeklyForm();
              setWeeklyFocus(value);
            }}
            weeklyRule={weeklyRule}
            onWeeklyRuleChange={(value) => {
              touchWeeklyForm();
              setWeeklyRule(value);
            }}
            weeklyConfidence={weeklyConfidence}
            onWeeklyConfidenceChange={(value) => {
              touchWeeklyForm();
              setWeeklyConfidence(value);
            }}
            weeklyNote={weeklyNote}
            onWeeklyNoteChange={(value) => {
              touchWeeklyForm();
              setWeeklyNote(value);
            }}
            onSubmit={onSaveWeeklyReflection}
            canWriteJournal={canWriteJournal}
            weeklySaving={weeklySaving}
            weeklyLoading={weeklyLoading}
            weeklyUnavailable={weeklyUnavailable}
            weeklySaved={weeklySaved}
            weeklyMsg={weeklyMsg}
            activeAccountId={activeAccountId}
            selectedEntryWeekStart={selectedEntryWeekStart}
            onAlignWeekToEntry={
              selectedEntry
                ? () => {
                    const dayKey = dayKeyFromRow(selectedEntry.entryDate, selectedEntry.createdAt);
                    setWeekAnchorDateTracked(dayKey);
                  }
                : undefined
            }
          />
        }
      />

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
