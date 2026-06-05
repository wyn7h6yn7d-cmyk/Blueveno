"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { createClient } from "@/lib/supabase/client";
import {
  applyEntryFilters,
  EMPTY_ENTRY_FILTERS,
  parseFiltersFromParams,
  writeFiltersToParams,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import {
  detectDatePreset,
  presetToDateRange,
  type DateRangePreset,
} from "@/lib/stats/date-range-presets";
import {
  filterTradeRowsByResult,
  mapJournalRowsToTradeRows,
  type TradeAccountLookup,
} from "@/lib/trades/map-trade-row";
import type { PersonalRuleRef } from "@/lib/trades/trade-rule-adherence";

export type TradeResultFilter = "all" | "wins" | "losses";

export type TradeAccountFilter = "active" | "all" | string;

export function useTradesBrowserData(userId: string, initialWorkspace: UserWorkspaceSnapshot, currency: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const { accounts } = useTradingAccountsWorkspace();

  const [allAccountEntries, setAllAccountEntries] = useState<JournalRow[]>([]);
  const [allEntriesLoaded, setAllEntriesLoaded] = useState(false);
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

  const filters = useMemo(
    () => parseFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const accountFilter: TradeAccountFilter = useMemo(() => {
    const raw = searchParams.get("account");
    if (raw === "all") return "all";
    if (!raw || raw === "active") return "active";
    return raw;
  }, [searchParams]);

  const datePreset = useMemo(() => detectDatePreset(filters.from, filters.to), [filters.from, filters.to]);
  const resultFilter: TradeResultFilter =
    searchParams.get("result") === "wins" || searchParams.get("result") === "losses"
      ? (searchParams.get("result") as TradeResultFilter)
      : "all";
  const selectedEntryId = searchParams.get("entry") ?? null;

  const accountLookup = useMemo<TradeAccountLookup>(() => {
    const map = new Map<string, { name: string; type?: string }>();
    for (const account of accounts) {
      map.set(account.id, { name: account.name, type: account.accountType });
    }
    return map;
  }, [accounts]);

  const replaceSearchParams = (mutate: (base: URLSearchParams) => void) => {
    const base = new URLSearchParams(searchParams.toString());
    mutate(base);
    const nextQuery = base.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const setFilters = (updater: EntryFilters | ((prev: EntryFilters) => EntryFilters)) => {
    const next = typeof updater === "function" ? updater(filters) : updater;
    replaceSearchParams((base) => {
      writeFiltersToParams(base, next);
    });
  };

  const setAccountFilter = (filter: TradeAccountFilter) => {
    replaceSearchParams((base) => {
      if (filter === "active") base.delete("account");
      else base.set("account", filter);
    });
  };

  const setResultFilter = (result: TradeResultFilter) => {
    replaceSearchParams((base) => {
      if (result === "all") base.delete("result");
      else base.set("result", result);
    });
  };

  const setSelectedEntryId = (entryId: string | null) => {
    replaceSearchParams((base) => {
      if (entryId) base.set("entry", entryId);
      else base.delete("entry");
    });
  };

  const applyDatePreset = (preset: DateRangePreset) => {
    if (preset === "custom") return;
    const range = presetToDateRange(preset);
    setFilters((f) => ({ ...f, from: range.from, to: range.to }));
  };

  const clearFilters = () => {
    replaceSearchParams((base) => {
      writeFiltersToParams(base, EMPTY_ENTRY_FILTERS);
      base.delete("result");
    });
  };

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
        .order("entry_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(500);
      const secondary =
        primary.error && /column|schema cache|rule_checks|session_tag|market_condition|lesson_learned/i.test(primary.error.message ?? "")
          ? await supabase
              .from("journal_entries")
              .select(fallbackSelect)
              .eq("user_id", userId)
              .order("entry_date", { ascending: false })
              .order("created_at", { ascending: false })
              .limit(500)
          : null;
      const rows = (secondary?.data ?? primary.data ?? []) as JournalRowDb[];
      if (cancelled) return;
      setAllAccountEntries(rows.map(mapJournalRowFromDb));
      setAllEntriesLoaded(true);
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
      if (cancelled) return;
      setWeeklyReflections((rows ?? []) as typeof weeklyReflections);
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

  const baseEntries = useMemo(() => {
    if (accountFilter === "all") {
      return allEntriesLoaded ? allAccountEntries : [];
    }
    if (accountFilter === "active") {
      if (!activeAccountId) return [];
      return data.journal;
    }
    if (!allEntriesLoaded) return [];
    return allAccountEntries.filter((row) => row.accountId === accountFilter);
  }, [accountFilter, allAccountEntries, allEntriesLoaded, data.journal, activeAccountId]);

  const filteredEntries = useMemo(() => applyEntryFilters(baseEntries, filters), [baseEntries, filters]);
  const tradeRows = useMemo(() => {
    const mapped = mapJournalRowsToTradeRows(filteredEntries, currency, accountLookup);
    return filterTradeRowsByResult(mapped, resultFilter);
  }, [filteredEntries, currency, accountLookup, resultFilter]);

  const selectedTrade = useMemo(
    () => tradeRows.find((r) => r.id === selectedEntryId) ?? null,
    [tradeRows, selectedEntryId],
  );

  const scopeReady =
    accountFilter === "active" ? ready : ready && allEntriesLoaded;

  return {
    ready: scopeReady,
    activeAccountId,
    accounts,
    baseEntries,
    filteredEntries,
    tradeRows,
    filters,
    setFilters,
    accountFilter,
    setAccountFilter,
    datePreset,
    applyDatePreset,
    resultFilter,
    setResultFilter,
    clearFilters,
    selectedEntryId,
    selectedTrade,
    setSelectedEntryId,
    weeklyReflections,
    personalRules,
    accountLookup,
  };
}
