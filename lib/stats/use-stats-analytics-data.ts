"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { computeTradingStats, type WeeklyReflectionStat } from "@/lib/user-data/trading-stats";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { createClient } from "@/lib/supabase/client";
import { mapTradingAccountRow } from "@/lib/trading-accounts/map";
import {
  applyEntryFilters,
  EMPTY_ENTRY_FILTERS,
  parseFiltersFromParams,
  writeFiltersToParams,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { computeMonthlyReview } from "@/lib/user-data/monthly-review";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { computeSessionTagPerformance, getSessionAnalysis } from "@/lib/user-data/session-analysis";
import { DEFAULT_STATS_TAB, parseStatsTab, type StatsTabId } from "@/lib/stats/stats-tabs";
import {
  detectDatePreset,
  presetToDateRange,
  type DateRangePreset,
} from "@/lib/stats/date-range-presets";
import { PRODUCT_ANALYTICS_EVENTS } from "@/lib/analytics/product-events";
import { trackProductEvent } from "@/lib/analytics/track-product-event";

function computeTagPerformance(
  entries: JournalRow[],
  pick: (row: JournalRow) => string | undefined,
  skip: (label: string) => boolean,
  minEntries = 2,
) {
  const map = new Map<string, { sum: number; count: number; wins: number }>();
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const label = pick(row)?.trim();
    if (!label || skip(label)) continue;
    const prev = map.get(label) ?? { sum: 0, count: 0, wins: 0 };
    map.set(label, {
      sum: prev.sum + pnl,
      count: prev.count + 1,
      wins: prev.wins + (pnl > 0 ? 1 : 0),
    });
  }
  return [...map.entries()]
    .filter(([, v]) => v.count >= minEntries)
    .map(([label, v]) => ({
      label,
      totalPnl: v.sum,
      averagePnl: v.count > 0 ? v.sum / v.count : null,
      entries: v.count,
      winRate: v.count > 0 ? Math.round((v.wins / v.count) * 100) : null,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

export function useStatsAnalyticsData(userId: string, initialWorkspace: UserWorkspaceSnapshot) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });

  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflectionStat[]>([]);
  const [monthlyFocusRows, setMonthlyFocusRows] = useState<Array<{ weekStart: string; nextWeekFocus: string | null }>>([]);
  const [latestReviewRule, setLatestReviewRule] = useState<string | null>(null);
  const [latestReviewConfidence, setLatestReviewConfidence] = useState<number | null>(null);
  const [latestReviewWorked, setLatestReviewWorked] = useState<string | null>(null);
  const [latestReviewSlipped, setLatestReviewSlipped] = useState<string | null>(null);
  const [accountComparisonRows, setAccountComparisonRows] = useState<
    Array<{ id: string; name: string; type: string; pnl: number; winRate: number | null; tradedDays: number; disciplineScore: number | null }>
  >([]);
  const [personalRules, setPersonalRules] = useState<Array<{ id: string; title: string; is_active: boolean }>>([]);
  const [allAccountEntries, setAllAccountEntries] = useState<JournalRow[]>([]);
  const [allEntriesLoaded, setAllEntriesLoaded] = useState(false);
  const [accountComparisonLoaded, setAccountComparisonLoaded] = useState(false);

  const filters = useMemo(
    () => parseFiltersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const accountScope: "active" | "all" = searchParams.get("accountScope") === "all" ? "all" : "active";
  const datePreset = useMemo(() => detectDatePreset(filters.from, filters.to), [filters.from, filters.to]);

  useEffect(() => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.statsOpened, { surface: "stats" });
  }, []);

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

  const setAccountScope = (scope: "active" | "all") => {
    replaceSearchParams((base) => {
      if (scope === "all") base.set("accountScope", "all");
      else base.delete("accountScope");
    });
  };

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      let query = supabase
        .from("weekly_reflections")
        .select("week_start, next_week_rule, next_week_focus, confidence_score, what_worked, what_slipped")
        .eq("user_id", userId)
        .order("week_start", { ascending: false });
      if (accountScope === "active") {
        if (!activeAccountId) {
          setWeeklyReflections([]);
          setMonthlyFocusRows([]);
          setLatestReviewRule(null);
          setLatestReviewConfidence(null);
          setLatestReviewWorked(null);
          setLatestReviewSlipped(null);
          return;
        }
        query = query.eq("account_id", activeAccountId);
      }
      const { data: rows } = await query;
      if (cancelled) return;
      const mapped = ((rows ?? []) as Array<
        WeeklyReflectionStat & {
          next_week_rule?: string | null;
          confidence_score?: number | null;
          what_worked?: string | null;
          what_slipped?: string | null;
        }
      >).filter((r) => Boolean(r.week_start));
      setWeeklyReflections(mapped);
      setMonthlyFocusRows(
        mapped.map((r) => ({
          weekStart: r.week_start,
          nextWeekFocus: (r as { next_week_focus?: string | null }).next_week_focus ?? null,
        })),
      );
      const latest = mapped[0];
      setLatestReviewRule((latest?.next_week_rule ?? null) as string | null);
      setLatestReviewConfidence((latest?.confidence_score ?? null) as number | null);
      setLatestReviewWorked((latest?.what_worked ?? null) as string | null);
      setLatestReviewSlipped((latest?.what_slipped ?? null) as string | null);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, activeAccountId, accountScope]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      const { data: rows } = await supabase
        .from("personal_rules")
        .select("id,title,is_active")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      setPersonalRules((rows ?? []) as Array<{ id: string; title: string; is_active: boolean }>);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    if (!userId || accountScope !== "all") return;
    const supabase = createClient();
    void (async () => {
      const fullSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade,session_tag,market_condition,lesson_learned,rule_checks";
      const fallbackSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade";
      const primary = await supabase.from("journal_entries").select(fullSelect).eq("user_id", userId).order("created_at", { ascending: false });
      const secondary =
        primary.error && /column|schema cache|rule_checks|session_tag|market_condition|lesson_learned/i.test(primary.error.message ?? "")
          ? await supabase.from("journal_entries").select(fallbackSelect).eq("user_id", userId).order("created_at", { ascending: false })
          : null;
      const rows = (secondary?.data ?? primary.data ?? []) as JournalRowDb[];
      if (cancelled) return;
      setAllAccountEntries(rows.map(mapJournalRowFromDb));
      setAllEntriesLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, accountScope]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      const [{ data: accounts }, { data: entries }] = await Promise.all([
        supabase.from("trading_accounts").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase.from("journal_entries").select("account_id,r_value,entry_date,created_at,followed_plan,respected_stop,no_revenge_trade").eq("user_id", userId),
      ]);
      if (cancelled) return;
      const accountRows = (accounts ?? []).map((row) => mapTradingAccountRow(row as unknown as Record<string, unknown>));
      const byAccount = new Map<string, { total: number; wins: number; losses: number; daySet: Set<string>; checksDone: number; checksTotal: number }>();
      for (const account of accountRows) {
        byAccount.set(account.id, { total: 0, wins: 0, losses: 0, daySet: new Set(), checksDone: 0, checksTotal: 0 });
      }
      for (const row of entries ?? []) {
        const accountId = String(row.account_id ?? "");
        const bucket = byAccount.get(accountId);
        if (!bucket) continue;
        const pnl = parsePnlAmount(String(row.r_value ?? "")) ?? 0;
        bucket.total += pnl;
        if (pnl > 0) bucket.wins += 1;
        if (pnl < 0) bucket.losses += 1;
        const dayKey = row.entry_date ? String(row.entry_date) : row.created_at ? new Date(String(row.created_at)).toISOString().slice(0, 10) : null;
        if (dayKey) bucket.daySet.add(dayKey);
        if (row.followed_plan != null) {
          bucket.checksTotal += 1;
          if (row.followed_plan) bucket.checksDone += 1;
        }
        if (row.respected_stop != null) {
          bucket.checksTotal += 1;
          if (row.respected_stop) bucket.checksDone += 1;
        }
        if (row.no_revenge_trade != null) {
          bucket.checksTotal += 1;
          if (row.no_revenge_trade) bucket.checksDone += 1;
        }
      }
      setAccountComparisonRows(
        accountRows.map((account) => {
          const b = byAccount.get(account.id)!;
          const directional = b.wins + b.losses;
          return {
            id: account.id,
            name: account.name,
            type: account.accountType,
            pnl: b.total,
            winRate: directional > 0 ? Math.round((b.wins / directional) * 100) : null,
            tradedDays: b.daySet.size,
            disciplineScore: b.checksTotal > 0 ? Math.round((b.checksDone / b.checksTotal) * 100) : null,
          };
        }),
      );
      setAccountComparisonLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const baseEntries = useMemo(() => {
    if (accountScope === "all") {
      return allEntriesLoaded ? allAccountEntries : [];
    }
    return data.journal;
  }, [accountScope, allEntriesLoaded, allAccountEntries, data.journal]);
  const filteredEntries = useMemo(() => applyEntryFilters(baseEntries, filters), [baseEntries, filters]);
  const stats = useMemo(() => computeTradingStats(filteredEntries, weeklyReflections), [filteredEntries, weeklyReflections]);

  const preferredMonthKey = useMemo(() => {
    if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) return filters.from.slice(0, 7);
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [filters.from]);

  const monthlyReviewEntries = useMemo(
    () => baseEntries.filter((row) => dayKeyFromRow(row.entryDate, row.createdAt).slice(0, 7) === preferredMonthKey),
    [baseEntries, preferredMonthKey],
  );

  const monthlyReview = useMemo(
    () => computeMonthlyReview(monthlyReviewEntries, monthlyFocusRows, preferredMonthKey),
    [monthlyReviewEntries, monthlyFocusRows, preferredMonthKey],
  );

  const sessionAnalysis = useMemo(() => getSessionAnalysis(filteredEntries), [filteredEntries]);
  const sessionTagPerformance = useMemo(() => computeSessionTagPerformance(filteredEntries, 2), [filteredEntries]);
  const marketConditionPerformance = useMemo(
    () => computeTagPerformance(filteredEntries, (row) => row.marketCondition, (label) => label === "Other" || label === "—"),
    [filteredEntries],
  );
  const mistakeTagPerformance = useMemo(
    () => computeTagPerformance(filteredEntries, (row) => row.tag, (label) => label === "None" || label === "Manual" || label === "—"),
    [filteredEntries],
  );

  const rulesAnalytics = useMemo(() => {
    const activeRules = personalRules.filter((r) => r.is_active);
    if (activeRules.length === 0 || filteredEntries.length === 0) {
      return {
        adherence: null as number | null,
        mostBroken: null as string | null,
        breakCost: null as number | null,
        topPositive: null as { title: string; followedPct: number | null } | null,
        rows: [] as Array<{ title: string; followedPct: number | null; avgFollowed: number | null; avgBroken: number | null; breakCost: number | null; brokenCount: number }>,
      };
    }
    const rows = activeRules.map((rule) => {
      let followed = 0;
      let broken = 0;
      let followedSum = 0;
      let brokenSum = 0;
      for (const row of filteredEntries) {
        const pnl = parsePnlAmount(row.r);
        if (pnl === null) continue;
        const flag = Boolean(row.ruleChecks?.[rule.id]);
        if (flag) {
          followed += 1;
          followedSum += pnl;
        } else {
          broken += 1;
          brokenSum += pnl;
        }
      }
      const total = followed + broken;
      return {
        title: rule.title,
        followedPct: total > 0 ? Math.round((followed / total) * 100) : null,
        avgFollowed: followed > 0 ? followedSum / followed : null,
        avgBroken: broken > 0 ? brokenSum / broken : null,
        breakCost: broken > 0 ? brokenSum : null,
        brokenCount: broken,
      };
    });
    const adherenceSamples = rows.map((r) => r.followedPct).filter((v): v is number => v !== null);
    const adherence = adherenceSamples.length > 0 ? Math.round(adherenceSamples.reduce((s, n) => s + n, 0) / adherenceSamples.length) : null;
    const mostBroken = rows.length > 0 ? rows.reduce((a, b) => (b.brokenCount > a.brokenCount ? b : a)).title : null;
    const breakCost = rows.reduce((s, r) => s + (r.breakCost ?? 0), 0);
    const topPositive = rows.length > 0 ? rows.reduce((a, b) => ((b.followedPct ?? 0) > (a.followedPct ?? 0) ? b : a)) : null;
    return { adherence, mostBroken, breakCost, topPositive, rows };
  }, [filteredEntries, personalRules]);

  const activeTab = parseStatsTab(searchParams.get("tab"));

  const navigateTab = (tabId: string) => {
    const tab = parseStatsTab(tabId) as StatsTabId;
    const base = new URLSearchParams(searchParams.toString());
    if (tab === DEFAULT_STATS_TAB) base.delete("tab");
    else base.set("tab", tab);
    const nextQuery = base.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const applyDatePreset = (preset: DateRangePreset) => {
    if (preset === "custom") return;
    const range = presetToDateRange(preset);
    setFilters((f) => ({ ...f, from: range.from, to: range.to }));
  };

  const clearFilters = () => {
    setFilters(EMPTY_ENTRY_FILTERS);
  };

  const scopeReady = accountScope === "all" ? ready && allEntriesLoaded : ready;

  return {
    ready: scopeReady && accountComparisonLoaded,
    activeAccountId,
    baseEntries,
    filteredEntries,
    stats,
    monthlyReview,
    weeklyReflections,
    latestReviewRule,
    latestReviewConfidence,
    latestReviewWorked,
    latestReviewSlipped,
    personalRules,
    accountComparisonRows,
    sessionAnalysis,
    sessionTagPerformance,
    marketConditionPerformance,
    mistakeTagPerformance,
    rulesAnalytics,
    filters,
    setFilters,
    accountScope,
    setAccountScope,
    datePreset,
    applyDatePreset,
    clearFilters,
    activeTab,
    navigateTab,
  };
}
