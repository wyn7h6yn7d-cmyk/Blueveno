"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  computeCapitalProgress,
  computeLinkedAccountRows,
  type CapitalProgressSnapshot,
  type LinkedAccountCapitalRow,
} from "@/lib/capital/compute-capital-progress";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";

export function useCapitalData(userId: string, initialWorkspace: UserWorkspaceSnapshot) {
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });
  const { accounts, activeAccountId, loading: accountsLoading } = useTradingAccountsWorkspace();
  const [entriesByAccount, setEntriesByAccount] = useState<Map<string, JournalRow[]>>(new Map());
  const [entriesLoaded, setEntriesLoaded] = useState(false);

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
        .order("created_at", { ascending: false });
      const secondary =
        primary.error && /column|schema cache|rule_checks|session_tag|market_condition|lesson_learned/i.test(primary.error.message ?? "")
          ? await supabase.from("journal_entries").select(fallbackSelect).eq("user_id", userId).order("created_at", { ascending: false })
          : null;
      const rows = (secondary?.data ?? primary.data ?? []) as Array<JournalRowDb & { account_id?: string | null }>;
      if (cancelled) return;

      const grouped = new Map<string, JournalRow[]>();
      for (const row of rows) {
        const accountId = String(row.account_id ?? "");
        if (!accountId) continue;
        const mapped = mapJournalRowFromDb(row);
        const bucket = grouped.get(accountId) ?? [];
        bucket.push(mapped);
        grouped.set(accountId, bucket);
      }
      setEntriesByAccount(grouped);
      setEntriesLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const activeAccount = useMemo(
    () => (activeAccountId ? accounts.find((a) => a.id === activeAccountId) ?? null : null),
    [accounts, activeAccountId],
  );

  const activeEntries = useMemo(() => {
    if (!activeAccount) return [];
    if (!entriesLoaded) return data.journal;
    return entriesByAccount.get(activeAccount.id) ?? [];
  }, [activeAccount, entriesByAccount, entriesLoaded, data.journal]);

  const progress: CapitalProgressSnapshot = useMemo(
    () =>
      computeCapitalProgress(
        {
          startingBalance: activeAccount?.startingBalance ?? null,
          currency: activeAccount?.currency ?? "EUR",
        },
        activeEntries,
      ),
    [activeAccount, activeEntries],
  );

  const linkedAccounts: LinkedAccountCapitalRow[] = useMemo(
    () => computeLinkedAccountRows(accounts, entriesByAccount, activeAccountId),
    [accounts, entriesByAccount, activeAccountId],
  );

  return {
    ready: ready && !accountsLoading && entriesLoaded,
    activeAccount,
    progress,
    linkedAccounts,
    hasAccounts: accounts.length > 0,
  };
}
