"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useAccess } from "@/components/access/access-provider";
import { PnlCalendar } from "@/components/calendar/pnl-calendar";
import { appPrimaryCta } from "@/lib/ui/app-surface";
import { createClient } from "@/lib/supabase/client";
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
import { Input } from "@/components/ui/input";
import { computeMonthlyReview } from "@/lib/user-data/monthly-review";
import { MonthlyReviewCard } from "@/components/reports/monthly-review-card";

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

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    const supabase = createClient();
    void (async () => {
      if (!activeAccountId) {
        setWeeklyReflections([]);
        return;
      }
      const { data: rows, error } = await supabase
        .from("weekly_reflections")
        .select("week_start, account_id, what_worked, what_slipped, next_week_focus, next_week_rule, confidence_score")
        .eq("user_id", userId)
        .eq("account_id", activeAccountId)
        .order("week_start", { ascending: false });
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
  }, [userId, activeAccountId]);

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

  const symbolOptions = useMemo(() => uniqueValues(data.journal, (row) => row.sym), [data.journal]);
  const moodOptions = useMemo(() => uniqueValues(data.journal, (row) => row.moodState), [data.journal]);
  const setupOptions = useMemo(() => uniqueValues(data.journal, (row) => String(row.setup)), [data.journal]);
  const filteredEntries = useMemo(() => applyEntryFilters(data.journal, filters), [data.journal, filters]);
  const preferredMonthKey = useMemo(() => {
    if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) return filters.from.slice(0, 7);
    return new Date().toISOString().slice(0, 7);
  }, [filters.from]);
  const monthlyReview = useMemo(
    () =>
      computeMonthlyReview(
        filteredEntries,
        weeklyReflections.map((w) => ({ weekStart: w.weekStart, nextWeekFocus: w.nextWeekFocus })),
        preferredMonthKey,
      ),
    [filteredEntries, weeklyReflections, preferredMonthKey],
  );

  return (
    <div className="space-y-10 pt-2">
      {!ready ? (
        <DashboardCard eyebrow="Loading" title="Preparing your calendar" description="Loading your latest journal days.">
          <div className="h-48 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.03]" />
        </DashboardCard>
      ) : data.journal.length === 0 ? (
        <DashboardCard
          eyebrow="Calendar"
          title="No days logged yet"
          description="Your month will fill as you log trading days."
        >
          <EmptyState
            icon={CalendarDays}
            title="Ready for your first week"
            description="Your month fills as you log trading days."
            action={
              <Link href="/app/journal#add" className={appPrimaryCta}>
                Log the day
              </Link>
            }
            className="border-none bg-transparent py-8 ring-0"
          />
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          <MonthlyReviewCard
            review={monthlyReview}
            displayCurrency={displayCurrency}
            storageKey={`blueveno:monthly-review:calendar:${activeAccountId ?? "none"}:${monthlyReview.monthKey}`}
            title="Monthly review"
          />
          <div className="relative md:-mx-8 lg:-mx-10">
          <div className="relative mb-3 px-1 md:px-4 lg:px-6">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                className="text-[12px] text-zinc-300 hover:text-zinc-100"
              >
                {filtersOpen ? "Hide filters" : "Filters"}
              </button>
              {hasActiveFilters(filters) ? (
                <button type="button" onClick={() => setFilters(EMPTY_ENTRY_FILTERS)} className="text-[12px] text-[oklch(0.78_0.11_252)] hover:underline">
                  Clear filters
                </button>
              ) : null}
            </div>
            {filtersOpen ? (
              <div className="mt-2 grid gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
                <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
                <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
                {[{ key: "symbol", values: symbolOptions }, { key: "mood", values: moodOptions }, { key: "setup", values: setupOptions }].map((item) => (
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
                <select value={filters.dayColor} onChange={(e) => setFilters((f) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))} className="h-9 rounded-lg border border-white/[0.1] bg-black/25 px-2 text-[12px] text-zinc-300">
                  <option value="all">all days</option>
                  <option value="green">green days</option>
                  <option value="red">red days</option>
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
          <div
            className="pointer-events-none absolute -inset-x-4 -top-8 bottom-0 hidden bg-[radial-gradient(ellipse_82%_58%_at_46%_0%,oklch(0.42_0.12_252/0.13),transparent_64%)] md:block lg:-inset-x-8"
            aria-hidden
          />
          <div className="relative px-1 md:px-4 lg:px-6">
            <PnlCalendar entries={filteredEntries} displayCurrency={displayCurrency} weeklyReflections={weeklyReflections} />
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
