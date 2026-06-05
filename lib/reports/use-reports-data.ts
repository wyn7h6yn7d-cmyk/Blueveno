"use client";

import { useEffect, useMemo, useState } from "react";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { createClient } from "@/lib/supabase/client";
import { mapTradingAccountRow } from "@/lib/trading-accounts/map";
import {
  buildPeriodReport,
  type AccountSummaryRow,
} from "@/lib/reports/build-period-report";
import type { ReportTypeId } from "@/lib/reports/report-types";
import { presetToDateRange, type DateRangePreset } from "@/lib/stats/date-range-presets";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { parsePnlAmount } from "@/lib/user-data/kpi";

export type ReportAccountFilter = "all" | "active" | string;

export function useReportsData(userId: string, initialWorkspace: UserWorkspaceSnapshot, currency: string) {
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const { accounts } = useTradingAccountsWorkspace();
  const [reportType, setReportType] = useState<ReportTypeId>("weekly_report");
  const [datePreset, setDatePreset] = useState<DateRangePreset>("30d");
  const initialRange = presetToDateRange("30d");
  const [customFrom, setCustomFrom] = useState(initialRange.from);
  const [customTo, setCustomTo] = useState(initialRange.to);
  const [accountFilter, setAccountFilter] = useState<ReportAccountFilter>("all");
  const [allAccountEntries, setAllAccountEntries] = useState<JournalRow[]>([]);
  const [allEntriesLoaded, setAllEntriesLoaded] = useState(false);
  const [accountRows, setAccountRows] = useState<AccountSummaryRow[]>([]);
  const [weeklyFocuses, setWeeklyFocuses] = useState<Array<{ weekStart: string; nextWeekFocus: string | null }>>([]);
  const [latestWorked, setLatestWorked] = useState<string | null>(null);
  const [latestSlipped, setLatestSlipped] = useState<string | null>(null);

  const period = useMemo(() => {
    if (datePreset === "custom") return { from: customFrom, to: customTo };
    return presetToDateRange(datePreset);
  }, [datePreset, customFrom, customTo]);

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
      const journalRows = (secondary?.data ?? primary.data ?? []) as JournalRowDb[];

      const [{ data: accountData }, { data: reflections }] = await Promise.all([
        supabase.from("trading_accounts").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase
          .from("weekly_reflections")
          .select("week_start, next_week_focus, what_worked, what_slipped")
          .eq("user_id", userId)
          .order("week_start", { ascending: false })
          .limit(24),
      ]);
      if (cancelled) return;

      setAllAccountEntries(journalRows.map(mapJournalRowFromDb));
      setAllEntriesLoaded(true);
      setWeeklyFocuses(
        ((reflections ?? []) as Array<{ week_start: string; next_week_focus?: string | null }>).map((r) => ({
          weekStart: r.week_start,
          nextWeekFocus: r.next_week_focus ?? null,
        })),
      );
      const latest = (reflections ?? [])[0] as { what_worked?: string | null; what_slipped?: string | null } | undefined;
      setLatestWorked(latest?.what_worked ?? null);
      setLatestSlipped(latest?.what_slipped ?? null);

      const accountList = (accountData ?? []).map((row) => mapTradingAccountRow(row as unknown as Record<string, unknown>));
      const byAccount = new Map<string, { total: number; wins: number; losses: number; daySet: Set<string>; checksDone: number; checksTotal: number }>();
      for (const account of accountList) {
        byAccount.set(account.id, { total: 0, wins: 0, losses: 0, daySet: new Set(), checksDone: 0, checksTotal: 0 });
      }
      const { data: accountEntryRows } = await supabase
        .from("journal_entries")
        .select("account_id,r_value,entry_date,created_at,followed_plan,respected_stop,no_revenge_trade")
        .eq("user_id", userId);
      for (const row of accountEntryRows ?? []) {
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
      setAccountRows(
        accountList.map((account) => {
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

  const sourceEntries = useMemo(() => {
    if (accountFilter === "all") {
      return allEntriesLoaded ? allAccountEntries : [];
    }
    if (accountFilter === "active") {
      if (!activeAccountId) return [];
      return data.journal.filter((row) => row.accountId === activeAccountId || !row.accountId);
    }
    if (!allEntriesLoaded) return [];
    return allAccountEntries.filter((row) => row.accountId === accountFilter);
  }, [allAccountEntries, allEntriesLoaded, data.journal, accountFilter, activeAccountId]);

  const scopedAccountRows = useMemo(() => {
    if (accountFilter === "all") return accountRows;
    if (accountFilter === "active" && activeAccountId) {
      return accountRows.filter((row) => row.id === activeAccountId);
    }
    return accountRows.filter((row) => row.id === accountFilter);
  }, [accountRows, accountFilter, activeAccountId]);

  const report = useMemo(
    () =>
      buildPeriodReport({
        reportType,
        entries: sourceEntries,
        from: period.from,
        to: period.to,
        currency,
        accountRows: scopedAccountRows,
        weeklyFocuses,
        reflectionWorked: latestWorked,
        reflectionSlipped: latestSlipped,
      }),
    [reportType, sourceEntries, period.from, period.to, currency, scopedAccountRows, weeklyFocuses, latestWorked, latestSlipped],
  );

  const applyDatePreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    if (preset !== "custom") {
      const range = presetToDateRange(preset);
      setCustomFrom(range.from);
      setCustomTo(range.to);
    }
  };

  const selectReportType = (type: ReportTypeId, suggestedPreset?: "7d" | "30d" | "90d") => {
    setReportType(type);
    if (suggestedPreset && datePreset !== "custom") {
      applyDatePreset(suggestedPreset);
    }
  };

  return {
    ready: ready && (accountFilter === "active" ? true : allEntriesLoaded),
    report,
    reportType,
    setReportType: selectReportType,
    datePreset,
    setDatePreset,
    applyDatePreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    period,
    sourceEntries,
    totalEntries: sourceEntries.length,
    accountFilter,
    setAccountFilter,
    accounts: accounts.map((a) => ({ id: a.id, name: a.name })),
    activeAccountId,
  };
}
