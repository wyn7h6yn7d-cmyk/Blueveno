"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { fetchJournalEntryForUser } from "@/lib/user-data/fetch-journal-entry-client";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { createClient } from "@/lib/supabase/client";
import { TradeDetailView } from "@/components/trades/trade-detail-view";
import { LoadingSkeleton } from "@/components/v2/design-system";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/components/access/access-provider";
import type { TradeAccountLookup } from "@/lib/trades/map-trade-row";
import type { PersonalRuleRef } from "@/lib/trades/trade-rule-adherence";

type Props = {
  userId: string;
  entryId: string;
  initialWorkspace: UserWorkspaceSnapshot;
  userTimezone?: string | null;
};

type FetchStatus = "idle" | "loading" | "missing" | "error" | "done";

export function TradeDetailLoader({ userId, entryId, initialWorkspace, userTimezone }: Props) {
  const { displayCurrency, canWriteJournal } = useAccess();
  const { data } = useUserWorkspace(userId, { initialWorkspace });
  const { accounts } = useTradingAccountsWorkspace();
  const [fetchedRow, setFetchedRow] = useState<JournalRowDb | null>(null);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [allEntries, setAllEntries] = useState<JournalRow[]>([]);
  const [weeklyReflections, setWeeklyReflections] = useState<
    Array<{
      week_start: string;
      what_worked?: string | null;
      what_slipped?: string | null;
      next_week_focus?: string | null;
      next_week_rule?: string | null;
      confidence_score?: number | null;
    }>
  >([]);
  const [personalRules, setPersonalRules] = useState<PersonalRuleRef[]>([]);

  const accountLookup = useMemo<TradeAccountLookup>(() => {
    const map = new Map<string, { name: string; type?: string }>();
    for (const account of accounts) {
      map.set(account.id, { name: account.name, type: account.accountType });
    }
    return map;
  }, [accounts]);

  const workspaceEntry = useMemo(
    () => data.journal.find((r) => r.id === entryId) ?? allEntries.find((r) => r.id === entryId) ?? null,
    [data.journal, allEntries, entryId],
  );

  const entry: JournalRow | null = useMemo(() => {
    if (workspaceEntry) return workspaceEntry;
    if (fetchedRow) return mapJournalRowFromDb(fetchedRow);
    return null;
  }, [workspaceEntry, fetchedRow]);

  const siblings = allEntries.length > 0 ? allEntries : data.journal;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const fullSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade,session_tag,market_condition,lesson_learned,rule_checks,account_id";
      const fallbackSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade,account_id";
      const primary = await supabase
        .from("journal_entries")
        .select(fullSelect)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(500);
      const secondary =
        primary.error && /column|schema cache|rule_checks|session_tag|market_condition|lesson_learned/i.test(primary.error.message ?? "")
          ? await supabase.from("journal_entries").select(fallbackSelect).eq("user_id", userId).order("created_at", { ascending: false }).limit(500)
          : null;
      if (!cancelled) {
        setAllEntries(((secondary?.data ?? primary.data ?? []) as JournalRowDb[]).map(mapJournalRowFromDb));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const { data: rows } = await supabase
        .from("weekly_reflections")
        .select("week_start, what_worked, what_slipped, next_week_focus, next_week_rule, confidence_score")
        .eq("user_id", userId)
        .order("week_start", { ascending: false });
      if (!cancelled) setWeeklyReflections((rows ?? []) as typeof weeklyReflections);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const supabase = createClient();
      const { data: rows, error } = await supabase
        .from("personal_rules")
        .select("id, title, is_active")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true });
      if (cancelled || error) return;
      setPersonalRules((rows ?? []) as PersonalRuleRef[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (workspaceEntry) return;

    let cancelled = false;
    void (async () => {
      setFetchStatus("loading");
      setErrorMsg(null);
      const result = await fetchJournalEntryForUser(userId, entryId, () => cancelled);
      if (cancelled) return;

      if (!result.ok) {
        if (result.reason === "missing") {
          setFetchedRow(null);
          setFetchStatus("missing");
          return;
        }
        setErrorMsg(result.message ?? "Could not load entry.");
        setFetchStatus("error");
        return;
      }
      setFetchedRow(result.data);
      setFetchStatus("done");
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, entryId, retryKey, workspaceEntry]);

  if (!workspaceEntry && fetchStatus === "loading") {
    return (
      <div className="space-y-8">
        <LoadingSkeleton variant="default" className="h-12 w-64 max-w-full" />
        <LoadingSkeleton variant="chart" className="min-h-[14rem]" />
      </div>
    );
  }

  if (!workspaceEntry && fetchStatus === "error") {
    return (
      <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
        <p className="text-[15px] leading-relaxed text-zinc-300">{errorMsg ?? "Could not load this trade."}</p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => setRetryKey((k) => k + 1)}>
            Try again
          </Button>
          <Link href="/app/trades" className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-[14px] text-zinc-400 transition hover:text-zinc-200">
            Back to trades
          </Link>
        </div>
      </div>
    );
  }

  if (entry) {
    return (
      <TradeDetailView
        entry={entry}
        siblings={siblings}
        currency={displayCurrency}
        weeklyReflections={weeklyReflections}
        personalRules={personalRules}
        accountLookup={accountLookup}
        canWriteJournal={canWriteJournal}
        userTimezone={userTimezone}
      />
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
      <p className="text-[15px] leading-relaxed text-zinc-300">This trade is no longer available.</p>
      <Link href="/app/trades" className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-[14px] text-zinc-400 transition hover:text-zinc-200">
        Back to trades
      </Link>
    </div>
  );
}
