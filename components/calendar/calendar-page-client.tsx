"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useAccess } from "@/components/access/access-provider";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";
import { appPrimaryCta } from "@/lib/ui/app-surface";
import { createClient } from "@/lib/supabase/client";
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
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { tradeWinRatePercent } from "@/lib/user-data/kpi";

type WeeklyReflectionSummary = {
  weekStart: string;
  accountId: string | null;
  whatWorked: string | null;
  whatSlipped: string | null;
  nextWeekFocus: string | null;
  nextWeekRule: string | null;
  confidenceScore: number | null;
};

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function CalendarPageClient({ userId, initialWorkspace }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { displayCurrency } = useAccess();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflectionSummary[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EntryFilters>(() => parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
  const [accountScope, setAccountScope] = useState<"active" | "all">(
    searchParams.get("accountScope") === "all" ? "all" : "active",
  );
  const [allAccountEntries, setAllAccountEntries] = useState<JournalRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    const supabase = createClient();
    void (async () => {
      if (accountScope === "active" && !activeAccountId) {
        setWeeklyReflections([]);
        return;
      }
      let query = supabase
        .from("weekly_reflections")
        .select("week_start, account_id, what_worked, what_slipped, next_week_focus, next_week_rule, confidence_score")
        .eq("user_id", userId)
        .order("week_start", { ascending: false });
      if (accountScope === "active") {
        query = query.eq("account_id", activeAccountId);
      }
      const { data: rows, error } = await query;
      if (cancelled || error) return;
      setWeeklyReflections(
        (rows ?? []).map((row) => ({
          weekStart: String(row.week_start),
          accountId: (row.account_id as string | null) ?? null,
          whatWorked: row.what_worked ?? null,
          whatSlipped: row.what_slipped ?? null,
          nextWeekFocus: row.next_week_focus ?? null,
          nextWeekRule: row.next_week_rule ?? null,
          confidenceScore: row.confidence_score ?? null,
        })),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, activeAccountId, accountScope]);

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

  useEffect(() => {
    setFilters(parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
  }, [searchParams]);

  useEffect(() => {
    const base = new URLSearchParams(searchParams.toString());
    if (accountScope === "all") base.set("accountScope", "all");
    else base.delete("accountScope");
    const next = writeFiltersToParams(base, filters);
    const nextQuery = next.toString();
    const current = searchParams.toString();
    if (nextQuery === current) return;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [accountScope, filters, pathname, router, searchParams]);

  const baseEntries = accountScope === "all" ? allAccountEntries : data.journal;
  const symbolOptions = useMemo(() => uniqueValues(baseEntries, (row) => row.sym), [baseEntries]);
  const moodOptions = useMemo(() => uniqueValues(baseEntries, (row) => row.moodState), [baseEntries]);
  const setupOptions = useMemo(() => uniqueValues(baseEntries, (row) => String(row.setup)), [baseEntries]);
  const filteredEntries = useMemo(() => applyEntryFilters(baseEntries, filters), [baseEntries, filters]);
  const scopedTradeWinRate = useMemo(() => tradeWinRatePercent(baseEntries), [baseEntries]);

  const filterControls = (
    <div className={appFilterShell}>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="text-[12px] text-zinc-300 hover:text-zinc-100"
        >
          {filtersOpen ? "Hide filters" : "Filters"}
        </button>
        {hasActiveFilters(filters) ? (
          <button type="button" onClick={() => setFilters(EMPTY_ENTRY_FILTERS)} className="text-[12px] text-[oklch(0.78_0.11_252)] hover:underline">
            Clear
          </button>
        ) : null}
      </div>
      <div className="mt-2">
        <select
          value={accountScope}
          onChange={(e) => setAccountScope(e.target.value as "active" | "all")}
          className="h-9 w-full rounded-lg border border-white/[0.1] bg-black/25 px-2 text-[12px] text-zinc-300 sm:w-[11rem]"
        >
          <option value="active">Active account</option>
          <option value="all">All accounts</option>
        </select>
      </div>
      {filtersOpen ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
          <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
          {[{ key: "symbol", values: symbolOptions }, { key: "mood", values: moodOptions }, { key: "setup", values: setupOptions }].map((item) => (
            <select
              key={item.key}
              value={filters[item.key as keyof EntryFilters] as string}
              onChange={(e) => setFilters((f) => ({ ...f, [item.key]: e.target.value }))}
              className="h-9 rounded-lg border border-white/[0.1] bg-black/25 px-2 text-[12px] text-zinc-300"
            >
              <option value="all">{FILTER_DIMENSION_ALL_LABEL[item.key] ?? "All"}</option>
              {item.values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          ))}
          <select value={filters.dayColor} onChange={(e) => setFilters((f) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))} className="h-9 rounded-lg border border-white/[0.1] bg-black/25 px-2 text-[12px] text-zinc-300">
            {(Object.keys(DAY_COLOR_FILTER_LABELS) as EntryFilters["dayColor"][]).map((key) => (
              <option key={key} value={key}>
                {DAY_COLOR_FILTER_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {hasActiveFilters(filters) ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {filterChips(filters).map((chip) => (
            <span key={chip} className="rounded-full border border-[oklch(0.58_0.12_252/0.34)] bg-[oklch(0.58_0.12_252/0.14)] px-2 py-0.5 text-[10px] text-zinc-200">
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-10 pt-2">
      {!ready ? (
        <DashboardCard eyebrow="Loading" title="Preparing your calendar" description="Loading your latest journal days.">
          <div className="h-48 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          <div className="relative md:-mx-8 lg:-mx-10">
          <div
            className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0 hidden bg-[radial-gradient(ellipse_82%_58%_at_46%_0%,oklch(0.42_0.12_252/0.13),transparent_64%)] md:block lg:-inset-x-8"
            aria-hidden
          />
          <div className="relative px-0 sm:px-4 lg:px-6">
            <PnlCalendar
              entries={filteredEntries}
              summaryEntries={baseEntries}
              summaryWinRate={scopedTradeWinRate}
              displayCurrency={displayCurrency}
              weeklyReflections={weeklyReflections}
              filterControls={filterControls}
            />
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
