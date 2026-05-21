"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  LayoutGrid,
  LineChart,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Wallet,
} from "lucide-react";
import { SectionNav, type SectionNavItem } from "@/components/app/section-nav";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useAccess } from "@/components/access/access-provider";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { computeTradingStats, type WeeklyReflectionStat } from "@/lib/user-data/trading-stats";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { cn } from "@/lib/utils";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { useAppToast } from "@/components/app/app-toast-provider";
import { InlineFeedback } from "@/components/app/inline-feedback";
import { formatUserError } from "@/lib/feedback/format-error";
import { feedbackToneFromMessage } from "@/lib/feedback/feedback-tone";
import { PRODUCT_ANALYTICS_EVENTS } from "@/lib/analytics/product-events";
import { trackExportCsvClicked, trackProductEvent } from "@/lib/analytics/track-product-event";
import { createClient } from "@/lib/supabase/client";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { mapTradingAccountRow } from "@/lib/trading-accounts/map";
import {
  applyEntryFilters,
  DAY_COLOR_FILTER_LABELS,
  EMPTY_ENTRY_FILTERS,
  FILTER_DIMENSION_ALL_LABEL,
  filterChips,
  hasActiveFilters,
  parseFiltersFromParams,
  uniqueValues,
  writeFiltersToParams,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";
import { appFilterShell, appFormSelect } from "@/lib/ui/app-form";
import type { JournalRow } from "@/lib/user-data/types";
import { Input } from "@/components/ui/input";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { computeMonthlyReview } from "@/lib/user-data/monthly-review";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import { MonthlyReviewCard } from "@/components/reports/monthly-review-card";
import { DEFAULT_STATS_TAB, parseStatsTab, type StatsTabId } from "@/lib/stats/stats-tabs";
import { SessionComparisonPanel } from "@/components/analytics/session-comparison-panel";
import { computeSessionTagPerformance, getSessionAnalysis } from "@/lib/user-data/session-analysis";
import {
  CumulativeChart,
  DailyBars,
  WeeklyTrend,
  MoodDistributionChart,
  DisciplineTrend,
} from "@/components/analytics/analytics-charts";
import { AnalyticsPanel } from "@/components/analytics/analytics-panel";
import { MetricStrip } from "@/components/analytics/metric-strip";
import { SupportMetricCard } from "@/components/analytics/support-metric-card";
import { InsightMetricCard } from "@/components/analytics/insight-metric-card";
import { StatsSummaryDashboard } from "@/components/stats/stats-summary-dashboard";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

function fmtPnl(n: number | null, currency: string) {
  if (n === null) return "—";
  return formatSignedPnlAmount(n, currency);
}

function formatDisciplineDisplay(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "—";
  return `${Math.round(score)}%`;
}

function formatProfitFactor(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

type TagPerformanceRow = {
  label: string;
  totalPnl: number;
  averagePnl: number | null;
  entries: number;
};

function computeTagPerformance(
  entries: JournalRow[],
  pick: (row: JournalRow) => string | undefined,
  skip: (label: string) => boolean,
  minEntries = 2,
): TagPerformanceRow[] {
  const map = new Map<string, { sum: number; count: number }>();
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const label = pick(row)?.trim();
    if (!label || skip(label)) continue;
    const prev = map.get(label) ?? { sum: 0, count: 0 };
    map.set(label, { sum: prev.sum + pnl, count: prev.count + 1 });
  }
  return [...map.entries()]
    .filter(([, v]) => v.count >= minEntries)
    .map(([label, v]) => ({
      label,
      totalPnl: v.sum,
      averagePnl: v.count > 0 ? v.sum / v.count : null,
      entries: v.count,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

function AccountComparisonTable({
  rows,
  currency,
}: {
  rows: Array<{
    id: string;
    name: string;
    type: string;
    pnl: number;
    winRate: number | null;
    tradedDays: number;
    disciplineScore: number | null;
  }>;
  currency: string;
}) {
  if (rows.length <= 1) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 text-sm text-zinc-500">
        Add another account to compare performance.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-[12px]" aria-label="Account comparison">
        <thead>
          <tr className="border-b border-white/[0.1] app-kicker text-[11px]">
            <th scope="col" className="min-w-[10rem] px-3 py-2.5 text-left font-medium">
              Account
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Net P&amp;L
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Trade win
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Traded days
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Discipline
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/[0.06] transition-colors last:border-b-0 hover:bg-white/[0.03]">
              <td className="max-w-[14rem] px-3 py-2.5 align-middle">
                <p className="truncate text-zinc-200">
                  {row.name} <span className="text-zinc-500">({row.type})</span>
                </p>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums">
                <span className={cn(row.pnl > 0 ? "text-emerald-200" : row.pnl < 0 ? "text-rose-200" : "text-zinc-300")}>
                  {fmtPnl(row.pnl, currency)}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums text-zinc-300">
                {row.winRate !== null ? `${row.winRate}%` : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums text-zinc-300">{row.tradedDays}</td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums text-zinc-300">
                {formatDisciplineDisplay(row.disciplineScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TagPerformanceList({
  rows,
  currency,
  emptyLabel,
}: {
  rows: TagPerformanceRow[];
  currency: string;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[12px] text-zinc-500">
        {emptyLabel}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {rows.slice(0, 6).map((row) => (
        <div key={row.label} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-white/[0.07] bg-black/15 px-3.5 py-2.5">
          <div>
            <p className="text-[13px] text-zinc-200">{row.label}</p>
            <p className="text-[11px] text-zinc-500">
              Avg {fmtPnl(row.averagePnl, currency)} · {row.entries} entries
            </p>
          </div>
          <p
            className={cn(
              "font-mono text-[12px] tabular-nums",
              row.totalPnl > 0 ? "text-emerald-200" : row.totalPnl < 0 ? "text-rose-200" : "text-zinc-300",
            )}
          >
            {fmtPnl(row.totalPnl, currency)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatsPageClient({ userId, initialWorkspace }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useAppToast();
  const { displayCurrency } = useAccess();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflectionStat[]>([]);
  const [monthlyFocusRows, setMonthlyFocusRows] = useState<Array<{ weekStart: string; nextWeekFocus: string | null }>>([]);
  const [latestReviewRule, setLatestReviewRule] = useState<string | null>(null);
  const [latestReviewConfidence, setLatestReviewConfidence] = useState<number | null>(null);
  const [accountComparisonRows, setAccountComparisonRows] = useState<
    Array<{ id: string; name: string; type: string; pnl: number; winRate: number | null; tradedDays: number; disciplineScore: number | null }>
  >([]);
  const [personalRules, setPersonalRules] = useState<Array<{ id: string; title: string; is_active: boolean }>>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EntryFilters>(() => parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
  const [accountScope, setAccountScope] = useState<"active" | "all">(
    searchParams.get("accountScope") === "all" ? "all" : "active",
  );
  const [allAccountEntries, setAllAccountEntries] = useState<JournalRow[]>([]);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.statsOpened, { surface: "stats" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      let query = supabase
        .from("weekly_reflections")
        .select("week_start, next_week_rule, next_week_focus, confidence_score")
        .eq("user_id", userId)
        .order("week_start", { ascending: false });
      if (accountScope === "active") {
        if (!activeAccountId) return;
        query = query.eq("account_id", activeAccountId);
      }
      const { data: rows } = await query;
      if (cancelled) return;
      const mapped = ((rows ?? []) as Array<WeeklyReflectionStat & { next_week_rule?: string | null; confidence_score?: number | null }>)
        .filter((r) => Boolean(r.week_start));
      setWeeklyReflections(mapped);
      setMonthlyFocusRows(
        mapped.map((r) => ({
          weekStart: r.week_start,
          nextWeekFocus: (r as { next_week_focus?: string | null }).next_week_focus ?? null,
        })),
      );
      setLatestReviewRule((mapped[0]?.next_week_rule ?? null) as string | null);
      setLatestReviewConfidence((mapped[0]?.confidence_score ?? null) as number | null);
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
    setFilters(parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
    setAccountScope(searchParams.get("accountScope") === "all" ? "all" : "active");
  }, [searchParams]);

  useEffect(() => {
    const base = new URLSearchParams(searchParams.toString());
    if (accountScope === "all") base.set("accountScope", "all");
    else base.delete("accountScope");
    const next = writeFiltersToParams(base, filters);
    const nextQuery = next.toString();
    if (nextQuery === searchParams.toString()) return;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [accountScope, filters, pathname, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    if (!userId || accountScope !== "all") return;
    const supabase = createClient();
    void (async () => {
      const fullSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade,session_tag,market_condition,lesson_learned,rule_checks";
      const fallbackSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade";

      const primary = await supabase
        .from("journal_entries")
        .select(fullSelect)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const secondary =
        primary.error && /column|schema cache|rule_checks|session_tag|market_condition|lesson_learned/i.test(primary.error.message ?? "")
          ? await supabase
              .from("journal_entries")
              .select(fallbackSelect)
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
          : null;

      const rows = (secondary?.data ?? primary.data ?? []) as JournalRowDb[];
      if (cancelled) return;
      setAllAccountEntries(rows.map(mapJournalRowFromDb));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, accountScope]);

  const baseEntries = accountScope === "all" ? allAccountEntries : data.journal;
  const filteredEntries = useMemo(() => applyEntryFilters(baseEntries, filters), [baseEntries, filters]);
  const stats = useMemo(() => computeTradingStats(filteredEntries, weeklyReflections), [filteredEntries, weeklyReflections]);
  const preferredMonthKey = useMemo(() => {
    if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) return filters.from.slice(0, 7);
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [filters.from]);
  const monthlyReviewEntries = useMemo(
    () =>
      baseEntries.filter((row) => dayKeyFromRow(row.entryDate, row.createdAt).slice(0, 7) === preferredMonthKey),
    [baseEntries, preferredMonthKey],
  );
  const monthlyReview = useMemo(
    () => computeMonthlyReview(monthlyReviewEntries, monthlyFocusRows, preferredMonthKey),
    [monthlyReviewEntries, monthlyFocusRows, preferredMonthKey],
  );

  const netR = stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0;
  const focusedAvg = stats.correlationHints.find((h) => h.label === "Avg P&L on Focused days")?.avgPnl ?? null;
  const calmAvg = stats.correlationHints.find((h) => h.label === "Avg P&L on Calm days")?.avgPnl ?? null;
  const followedPlanAvg = stats.correlationHints.find((h) => h.label === "Avg P&L when Followed plan = true")?.avgPnl ?? null;
  const notFollowedPlanAvg = stats.correlationHints.find((h) => h.label === "Avg P&L when Followed plan = false")?.avgPnl ?? null;

  const moodAverages = useMemo(() => {
    const buckets = new Map<string, number[]>();
    for (const row of filteredEntries) {
      if (!row.moodState) continue;
      const pnl = parsePnlAmount(row.r);
      if (pnl === null) continue;
      const arr = buckets.get(row.moodState) ?? [];
      arr.push(pnl);
      buckets.set(row.moodState, arr);
    }
    const rows = [...buckets.entries()]
      .filter(([, vals]) => vals.length >= 3)
      .map(([state, vals]) => ({
        state,
        avg: vals.reduce((sum, v) => sum + v, 0) / vals.length,
        sample: vals.length,
      }))
      .sort((a, b) => b.avg - a.avg);
    return rows;
  }, [filteredEntries]);

  const bestBehavior = moodAverages[0] ?? null;
  const weakestBehavior = moodAverages[moodAverages.length - 1] ?? null;

  const behaviorInsightHints = useMemo(() => {
    const labels = new Set(stats.correlationHints.map((h) => h.label));
    return {
      calm: labels.has("Avg P&L on Calm days"),
      focused: labels.has("Avg P&L on Focused days"),
      plan: labels.has("Avg P&L when Followed plan = true") && labels.has("Avg P&L when Followed plan = false"),
      mood: bestBehavior != null && weakestBehavior != null,
    };
  }, [stats.correlationHints, bestBehavior, weakestBehavior]);

  const behaviorInsightBlockers = useMemo(() => {
    const rows: string[] = [];
    if (!behaviorInsightHints.calm) {
      rows.push("At least 3 trading days tagged Calm with a numeric day P&L.");
    }
    if (!behaviorInsightHints.focused) {
      rows.push("At least 3 trading days tagged Focused with a numeric day P&L.");
    }
    if (!behaviorInsightHints.plan) {
      rows.push("At least 3 days with Followed plan on and 3 with it off, each with a numeric day P&L.");
    }
    if (!behaviorInsightHints.mood) {
      rows.push("At least 3 trading days that share one mood (Calm, Focused, Hesitant, or Tilted) and have a numeric day P&L.");
    }
    return rows;
  }, [behaviorInsightHints]);

  const rulesAnalytics = useMemo(() => {
    const activeRules = personalRules.filter((r) => r.is_active);
    if (activeRules.length === 0 || filteredEntries.length === 0) {
      return { adherence: null as number | null, mostBroken: null as string | null, breakCost: null as number | null, rows: [] as Array<{ title: string; followedPct: number | null; avgFollowed: number | null; avgBroken: number | null; breakCost: number | null }> };
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
    const adherence = adherenceSamples.length > 0
      ? Math.round(adherenceSamples.reduce((s, n) => s + n, 0) / adherenceSamples.length)
      : null;
    const mostBroken = rows.length > 0 ? rows.reduce((a, b) => (b.brokenCount > a.brokenCount ? b : a)).title : null;
    const breakCost = rows.reduce((s, r) => s + (r.breakCost ?? 0), 0);
    return { adherence, mostBroken, breakCost, rows };
  }, [filteredEntries, personalRules]);

  const sectionNavItems = useMemo<SectionNavItem[]>(
    () => [
      { id: "summary", label: "Summary", icon: LayoutGrid },
      { id: "performance", label: "Performance", icon: LineChart },
      { id: "behavior", label: "Behavior", icon: UserCheck },
      { id: "patterns", label: "Patterns", icon: Sparkles },
      { id: "accounts", label: "Accounts", icon: Wallet },
    ],
    [],
  );

  const activeTab = parseStatsTab(searchParams.get("tab"));

  const navigateTab = (tabId: string) => {
    const tab = parseStatsTab(tabId) as StatsTabId;
    const base = new URLSearchParams(searchParams.toString());
    if (tab === DEFAULT_STATS_TAB) base.delete("tab");
    else base.set("tab", tab);
    const nextQuery = base.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const sessionAnalysis = useMemo(() => getSessionAnalysis(filteredEntries), [filteredEntries]);

  const sessionTagPerformance = useMemo(
    () => computeSessionTagPerformance(filteredEntries, 2),
    [filteredEntries],
  );

  const marketConditionPerformance = useMemo(
    () =>
      computeTagPerformance(
        filteredEntries,
        (row) => row.marketCondition,
        (label) => label === "Other" || label === "—",
      ),
    [filteredEntries],
  );

  const mistakeTagPerformance = useMemo(
    () =>
      computeTagPerformance(
        filteredEntries,
        (row) => row.tag,
        (label) => label === "None" || label === "Manual" || label === "—",
      ),
    [filteredEntries],
  );

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      const [{ data: accounts }, { data: entries }] = await Promise.all([
        supabase.from("trading_accounts").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase
          .from("journal_entries")
          .select("account_id,r_value,entry_date,created_at,followed_plan,respected_stop,no_revenge_trade")
          .eq("user_id", userId),
      ]);
      if (cancelled) return;
      const accountRows = (accounts ?? []).map((row) => mapTradingAccountRow(row as unknown as Record<string, unknown>));
      const byAccount = new Map<
        string,
        { total: number; wins: number; losses: number; daySet: Set<string>; checksDone: number; checksTotal: number }
      >();
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
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const onExportStatsSummary = () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg(null);
    try {
      const rows = [
        { metric: "account scope", value: accountScope === "all" ? "all accounts" : "active account" },
        { metric: "rows in scope", value: filteredEntries.length },
        { metric: "net pnl", value: netR },
        { metric: "win rate trades pct", value: stats.winRateTrades ?? "" },
        { metric: "profit factor", value: stats.profitFactor ?? "" },
        { metric: "max drawdown", value: stats.maxDrawdown ?? "" },
        { metric: "avg green day", value: stats.avgGreenDay ?? "" },
        { metric: "avg red day", value: stats.avgRedDay ?? "" },
        { metric: "best day", value: stats.bestDay ? `${stats.bestDay.date} (${stats.bestDay.pnl})` : "" },
        {
          metric: stats.worstDay ? "worst day" : "smallest green day",
          value: stats.worstDay
            ? `${stats.worstDay.date} (${stats.worstDay.pnl})`
            : stats.smallestGreenDay
              ? `${stats.smallestGreenDay.date} (${stats.smallestGreenDay.pnl})`
              : "",
        },
      ];
      const csv = recordsToCsv(
        [
          { key: "metric", label: "metric" },
          { key: "value", label: "value" },
        ],
        rows,
      );
      trackExportCsvClicked("stats_summary", "stats");
      triggerCsvDownload(`blueveno-stats-summary-${fileDate()}.csv`, csv);
      setExportMsg("Stats summary export ready.");
    } catch (error) {
      setExportMsg(error instanceof Error ? error.message : "Could not export stats summary.");
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Performance"
        title="Stats"
        description="Track performance, behavior, and recurring patterns."
        actions={
          <div className="app-page-actions-mobile flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <button type="button" onClick={onExportStatsSummary} className={appSecondaryCta} disabled={exportBusy}>
              <ArrowUpRight className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              {exportBusy ? "Exporting…" : "Export summary CSV"}
            </button>
            <Link href="/app/calendar" className={appSecondaryCta}>
              <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              Calendar
            </Link>
          </div>
        }
      />
      <InlineFeedback message={exportMsg} tone={feedbackToneFromMessage(exportMsg)} />

      <section className="space-y-2" aria-label="Stats filters">
        <div className={cn(appFilterShell, "flex items-center justify-between gap-2")}>
          <button type="button" onClick={() => setFiltersOpen((v) => !v)} className="text-[13px] text-zinc-300 hover:text-zinc-100">
            {filtersOpen ? "Hide filters" : "Filters"}
          </button>
          <div className="flex items-center gap-2">
            <select
              value={accountScope}
              onChange={(e) => setAccountScope(e.target.value as "active" | "all")}
              className={cn(appFormSelect, "h-8 text-[12px]")}
            >
              <option value="active">Active account</option>
              <option value="all">All accounts</option>
            </select>
            {hasActiveFilters(filters) ? (
              <button type="button" onClick={() => setFilters(EMPTY_ENTRY_FILTERS)} className="text-[12px] text-[oklch(0.78_0.11_252)] hover:underline">
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
        {filtersOpen ? (
          <div className={cn(appFilterShell, "grid gap-2 sm:grid-cols-2 lg:grid-cols-4")}>
            <Input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Search symbol or note" className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[13px]" />
            <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
            <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
            <select value={filters.dayColor} onChange={(e) => setFilters((f) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))} className={appFormSelect}>
              {(Object.keys(DAY_COLOR_FILTER_LABELS) as EntryFilters["dayColor"][]).map((key) => (
                <option key={key} value={key}>
                  {DAY_COLOR_FILTER_LABELS[key]}
                </option>
              ))}
            </select>
            {[
              { key: "symbol", values: uniqueValues(baseEntries, (row) => row.sym) },
              { key: "mood", values: uniqueValues(baseEntries, (row) => row.moodState) },
              { key: "setup", values: uniqueValues(baseEntries, (row) => String(row.setup)) },
              { key: "mistake", values: uniqueValues(baseEntries, (row) => String(row.tag)) },
              { key: "session", values: uniqueValues(baseEntries, (row) => row.sessionTag) },
              { key: "market", values: uniqueValues(baseEntries, (row) => row.marketCondition) },
            ].map((item) => (
              <select
                key={item.key}
                value={filters[item.key as keyof EntryFilters] as string}
                onChange={(e) => setFilters((f) => ({ ...f, [item.key]: e.target.value }))}
                className={appFormSelect}
              >
                <option value="all">{FILTER_DIMENSION_ALL_LABEL[item.key] ?? "All"}</option>
                {item.values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            ))}
          </div>
        ) : null}
        {hasActiveFilters(filters) ? (
          <div className="flex flex-wrap gap-1.5">
            {filterChips(filters).map((chip) => (
              <span key={chip} className="rounded-full border border-[oklch(0.58_0.12_252/0.34)] bg-[oklch(0.58_0.12_252/0.14)] px-2 py-0.5 text-[10px] text-zinc-200">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </section>


      {!ready ? (
        <div className="h-56 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      ) : baseEntries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No stats yet"
          description="Add a few trading days to unlock performance and behavior patterns."
          action={
            <Link href="/app/journal" className={cn(appPrimaryCta, "inline-flex items-center gap-1.5")}>
              Log the day
              <ArrowUpRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <>
          <SectionNav
            items={sectionNavItems}
            activeId={activeTab}
            onChange={navigateTab}
            ariaLabel="Stats sections"
            variant="sticky"
          />

          {filteredEntries.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No results for current filters" description="Clear filters to reveal your full stats view." />
          ) : (
            <div
              key={activeTab}
              role="tabpanel"
              id={`stats-tabpanel-${activeTab}`}
              aria-labelledby={`section-tab-${activeTab}`}
              className="space-y-6 scroll-mt-[calc(var(--app-topbar-offset)+var(--app-section-nav-offset))]"
            >
          {activeTab === "summary" ? (
          <>
          <MonthlyReviewCard
            review={monthlyReview}
            displayCurrency={displayCurrency}
            storageKey={`blueveno:monthly-review:stats:${accountScope}:${monthlyReview.monthKey}`}
            title="Monthly review report"
          />
          <StatsSummaryDashboard
            stats={stats}
            netPnl={netR}
            currency={displayCurrency}
            weeklyReflections={weeklyReflections}
            sessionAnalysis={sessionAnalysis}
          />
          </>
          ) : null}

          {activeTab === "performance" ? (
          <>
          <MetricStrip
            items={[
              { label: "Net P&L", value: fmtPnl(netR, displayCurrency), tone: netR, icon: TrendingUp },
              {
                label: "Trade win rate",
                value: stats.winRateTrades !== null ? `${stats.winRateTrades}%` : "—",
                icon: Target,
              },
              {
                label: "Avg green day",
                value: fmtPnl(stats.avgGreenDay, displayCurrency),
                tone: stats.avgGreenDay ?? 0,
                icon: TrendingUp,
              },
              {
                label: "Avg red day",
                value: fmtPnl(stats.avgRedDay, displayCurrency),
                tone: stats.avgRedDay ?? 0,
                icon: TrendingDown,
              },
              {
                label: "Profit factor",
                value: formatProfitFactor(stats.profitFactor),
                tone: (stats.profitFactor ?? 0) >= 1 ? 1 : -1,
              },
            ]}
          />
          <AnalyticsPanel
            title="Cumulative P&L"
            description="Running total of daily P&L, oldest to newest."
            glow="blue"
            contentClassName="overflow-hidden"
          >
            <CumulativeChart points={stats.cumulative} currency={displayCurrency} />
          </AnalyticsPanel>
          <section className="grid gap-5 lg:grid-cols-2">
            <AnalyticsPanel title="Daily P&L" description="One bar per trading day in this scope.">
              <DailyBars bars={stats.dailyBars} currency={displayCurrency} />
            </AnalyticsPanel>
            <AnalyticsPanel title="Weekly totals" description="Recent weeks at a glance." glow="none">
              <WeeklyTrend weekly={stats.weekly} currency={displayCurrency} />
            </AnalyticsPanel>
          </section>
          <DashboardCard
            eyebrow="Sessions"
            title="Session profitability"
            description="Compare P&amp;L across FX windows (UTC) and the session tags you log."
          >
            <SessionComparisonPanel
              marketSessions={sessionAnalysis.marketSessions}
              taggedSessions={sessionAnalysis.taggedSessions}
              currency={displayCurrency}
              bestMarketSession={sessionAnalysis.bestMarketSession}
              weakestMarketSession={sessionAnalysis.weakestMarketSession}
              bestTaggedSession={sessionAnalysis.bestTaggedSession}
              weakestTaggedSession={sessionAnalysis.weakestTaggedSession}
            />
          </DashboardCard>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Performance range and risk">
            <SupportMetricCard
              label="Max drawdown"
              value={fmtPnl(stats.maxDrawdown, displayCurrency)}
              tone={stats.maxDrawdown ?? 0}
            />
            <SupportMetricCard label="Profit factor" value={formatProfitFactor(stats.profitFactor)} tone={(stats.profitFactor ?? 0) >= 1 ? 1 : -1} />
            <SupportMetricCard
              label="Best day"
              value={stats.bestDay ? fmtPnl(stats.bestDay.pnl, displayCurrency) : "—"}
              detail={stats.bestDay?.date}
              tone={stats.bestDay?.pnl ?? 0}
            />
            <SupportMetricCard
              label={stats.worstDay ? "Worst day" : "Smallest green day"}
              value={
                stats.worstDay
                  ? fmtPnl(stats.worstDay.pnl, displayCurrency)
                  : stats.smallestGreenDay
                    ? fmtPnl(stats.smallestGreenDay.pnl, displayCurrency)
                    : "—"
              }
              detail={stats.worstDay?.date ?? stats.smallestGreenDay?.date}
              tone={stats.worstDay?.pnl ?? stats.smallestGreenDay?.pnl ?? 0}
            />
          </section>
          </>
          ) : null}

          {activeTab === "behavior" ? (
          <>
          <section className="grid gap-5 lg:grid-cols-2" aria-label="Behavior charts">
            <AnalyticsPanel title="Mood distribution" description="How often each mood appears in your journal.">
              <MoodDistributionChart moodBreakdown={stats.moodBreakdown} />
            </AnalyticsPanel>
            <AnalyticsPanel title="Discipline trend" description="Weekly score with reflection bonus." glow="green">
              <DisciplineTrend weekly={stats.weekly} weeklyReflections={weeklyReflections} />
              <div className="mt-5 rounded-xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-inset ring-white/[0.08]">
                <p className="text-[13px] font-medium text-zinc-400">Weekly focus</p>
                <p className="mt-1.5 text-[14px] text-zinc-200">
                  {latestReviewRule?.trim() ? latestReviewRule : "No weekly rule saved yet."}
                </p>
                <p className="mt-1 text-[13px] text-zinc-500">
                  Confidence {latestReviewConfidence ?? "—"}/5
                </p>
              </div>
            </AnalyticsPanel>
          </section>

          <AnalyticsPanel
            title="Behavior and P&L"
            description="See what your labeled days suggest — unavailable cards stay hidden until enough data exists."
          >
            {behaviorInsightBlockers.length > 0 ? (
              <p className="mb-4 text-[13px] leading-relaxed text-zinc-500">
                Some comparisons need more labeled days in your current filter scope.
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                { title: "Focused days", value: focusedAvg, detail: "Average result when mood is focused." },
                { title: "Calm days", value: calmAvg, detail: "Average result when mood is calm." },
                { title: "Plan followed", value: followedPlanAvg, detail: "Days where you followed your plan." },
                { title: "Plan missed", value: notFollowedPlanAvg, detail: "Days where the plan was not followed.", variant: "negative" as const },
              ]
                .filter((item) => item.value !== null)
                .map((item) => (
                  <InsightMetricCard
                    key={item.title}
                    title={item.title}
                    value={fmtPnl(item.value, displayCurrency)}
                    detail={item.detail}
                    variant={item.variant ?? ((item.value ?? 0) >= 0 ? "positive" : "negative")}
                  />
                ))}
              {bestBehavior ? (
                <InsightMetricCard
                  title="Best mood"
                  value={`${bestBehavior.state} · ${fmtPnl(bestBehavior.avg, displayCurrency)}`}
                  detail={`${bestBehavior.sample} entries in this scope.`}
                  variant="positive"
                />
              ) : null}
              {weakestBehavior && weakestBehavior.state !== bestBehavior?.state ? (
                <InsightMetricCard
                  title="Weakest mood"
                  value={`${weakestBehavior.state} · ${fmtPnl(weakestBehavior.avg, displayCurrency)}`}
                  detail={`${weakestBehavior.sample} entries in this scope.`}
                  variant="negative"
                />
              ) : null}
              {stats.stopRespectedAvg !== null && stats.stopNotRespectedAvg !== null ? (
                <InsightMetricCard
                  title="Stop discipline"
                  value={`${fmtPnl(stats.stopRespectedAvg, displayCurrency)} vs ${fmtPnl(stats.stopNotRespectedAvg, displayCurrency)}`}
                  detail="Respected stop vs not respected."
                />
              ) : null}
              {stats.noRevengeAvg !== null && stats.revengeAvg !== null ? (
                <InsightMetricCard
                  title="Revenge trades"
                  value={`${fmtPnl(stats.noRevengeAvg, displayCurrency)} vs ${fmtPnl(stats.revengeAvg, displayCurrency)}`}
                  detail="No revenge vs revenge taken."
                />
              ) : null}
            </div>
          </AnalyticsPanel>

          <AnalyticsPanel title="Rule adherence" description="How consistently rules are followed and what breaks cost.">
            {rulesAnalytics.rows.length === 0 ? (
              <p className="rounded-xl bg-white/[0.03] px-4 py-6 text-[14px] text-zinc-500 ring-1 ring-inset ring-white/[0.08]">
                Create active rules in Settings to track adherence here.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <SupportMetricCard
                    label="Rule adherence"
                    value={rulesAnalytics.adherence !== null ? `${rulesAnalytics.adherence}%` : "—"}
                  />
                  <SupportMetricCard label="Most broken" value={rulesAnalytics.mostBroken ?? "—"} />
                  <SupportMetricCard
                    label="Break cost"
                    value={fmtPnl(rulesAnalytics.breakCost, displayCurrency)}
                    tone={(rulesAnalytics.breakCost ?? 0) <= 0 ? -1 : 1}
                  />
                </div>
                <div className="space-y-2">
                  {rulesAnalytics.rows.map((row) => (
                    <div key={row.title} className="rounded-xl bg-black/20 px-4 py-3 ring-1 ring-inset ring-white/[0.07]">
                      <p className="text-[14px] text-zinc-200">{row.title}</p>
                      <p className="mt-1 text-[13px] text-zinc-500">
                        Followed {row.followedPct !== null ? `${row.followedPct}%` : "—"} ·{" "}
                        {fmtPnl(row.avgFollowed, displayCurrency)} when followed vs {fmtPnl(row.avgBroken, displayCurrency)} when broken
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AnalyticsPanel>
          </>
          ) : null}

          {activeTab === "patterns" ? (
          <>
          <section className="grid gap-4 lg:grid-cols-2" aria-label="Weekday and symbol performance">
            <AnalyticsPanel title="Weekday performance" description="See what repeats across the week.">
              <div className="space-y-3">
                {stats.weekdayPerformance.map((row) => {
                  const maxAbs = Math.max(
                    ...stats.weekdayPerformance.map((w) => Math.abs(w.totalPnl)),
                    1,
                  );
                  const width = Math.round((Math.abs(row.totalPnl) / maxAbs) * 100);
                  const isBest = row.weekday === stats.bestWeekday;
                  const isWeakest = row.weekday === stats.weakestWeekday;
                  return (
                    <div key={row.weekday} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3 text-[13px]">
                        <p className="text-zinc-200">
                          {row.weekday}
                          {isBest ? <span className="ml-2 text-emerald-300/80">Strongest</span> : null}
                          {isWeakest ? <span className="ml-2 text-rose-300/80">Weakest</span> : null}
                        </p>
                        <p
                          className={cn(
                            "tabular-nums",
                            row.totalPnl > 0 ? "text-emerald-200" : row.totalPnl < 0 ? "text-rose-200" : "text-zinc-400",
                          )}
                        >
                          {fmtPnl(row.totalPnl, displayCurrency)}
                        </p>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            row.totalPnl >= 0 ? "bg-emerald-400/80" : "bg-rose-400/80",
                          )}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      <p className="text-[12px] text-zinc-500">
                        Avg {fmtPnl(row.averagePnl, displayCurrency)} · {row.tradedDays} days
                      </p>
                    </div>
                  );
                })}
              </div>
            </AnalyticsPanel>
            <DashboardCard eyebrow="Symbol performance" title="Ranked by contribution">
              <div className="space-y-2">
                {stats.symbolPerformance.length === 0 ? (
                  <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[12px] text-zinc-500">
                    No symbol-tagged entries in this scope — totals show as —.
                  </p>
                ) : (
                  stats.symbolPerformance.slice(0, 8).map((row) => (
                    <div key={row.symbol} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-white/[0.07] bg-black/15 px-3.5 py-2.5">
                      <div>
                        <p className="text-[13px] text-zinc-200">{row.symbol}</p>
                        <p className="text-[11px] text-zinc-500">Avg {fmtPnl(row.averagePnl, displayCurrency)} · {row.entries} entries</p>
                      </div>
                      <p className={cn("font-mono text-[12px] tabular-nums", row.totalPnl > 0 ? "text-emerald-200" : row.totalPnl < 0 ? "text-rose-200" : "text-zinc-300")}>
                        {fmtPnl(row.totalPnl, displayCurrency)}
                      </p>
                    </div>
                  ))
                )}
                <p className="text-[12px] text-zinc-500">
                  Best symbol: {stats.bestSymbol ?? "—"} · Most traded: {stats.mostTradedSymbol ?? "—"}
                </p>
              </div>
            </DashboardCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Setup and tag performance">
            <DashboardCard eyebrow="Setup" title="Setup performance">
              <TagPerformanceList
                rows={stats.setupPerformance.map((row) => ({
                  label: row.setup,
                  totalPnl: row.totalPnl,
                  averagePnl: row.averagePnl,
                  entries: row.entries,
                }))}
                currency={displayCurrency}
                emptyLabel="No setup-tagged entries in this scope."
              />
              {stats.bestSetup ? <p className="mt-2 text-[12px] text-zinc-500">Best setup: {stats.bestSetup}</p> : null}
            </DashboardCard>
            <DashboardCard eyebrow="Mistakes" title="Mistake tag performance">
              <TagPerformanceList rows={mistakeTagPerformance} currency={displayCurrency} emptyLabel="No mistake tags logged yet." />
              {stats.mostCommonMistake ? (
                <p className="mt-2 text-[12px] text-zinc-500">
                  Most common: {stats.mostCommonMistake}
                  {stats.mistakeCost !== null && Number.isFinite(stats.mistakeCost)
                    ? ` · cost ${fmtPnl(stats.mistakeCost, displayCurrency)}`
                    : ""}
                </p>
              ) : null}
            </DashboardCard>
            <DashboardCard eyebrow="Session" title="Session tag performance">
              <TagPerformanceList rows={sessionTagPerformance} currency={displayCurrency} emptyLabel="No session tags in this scope." />
            </DashboardCard>
            <DashboardCard eyebrow="Market" title="Market condition performance">
              <TagPerformanceList rows={marketConditionPerformance} currency={displayCurrency} emptyLabel="No market conditions in this scope." />
            </DashboardCard>
          </section>
          </>
          ) : null}

          {activeTab === "accounts" ? (
          <>
          <section aria-label="Account comparison">
            <DashboardCard eyebrow="Accounts" title="Account comparison" description="Compare net P&amp;L and discipline across your trading accounts.">
              <AccountComparisonTable rows={accountComparisonRows} currency={displayCurrency} />
            </DashboardCard>
          </section>
          </>
          ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}