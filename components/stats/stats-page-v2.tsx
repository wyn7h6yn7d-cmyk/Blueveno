"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { InlineFeedback } from "@/components/app/inline-feedback";
import {
  AnalyticsAccountsPanel,
  AnalyticsBehaviorPanel,
  AnalyticsEmptyState,
  AnalyticsPatternsPanel,
  AnalyticsPerformancePanel,
  AnalyticsSummaryPanel,
} from "@/components/stats/analytics-v2-panels";
import { AnalyticsV2Toolbar } from "@/components/stats/analytics-v2-toolbar";
import { StatsTabNav } from "@/components/stats/stats-tab-nav";
import { EmptyState, LoadingSkeleton, PageHeader } from "@/components/v2/design-system";
import { feedbackToneFromMessage } from "@/lib/feedback/feedback-tone";
import { trackExportCsvClicked } from "@/lib/analytics/track-product-event";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import {
  DAY_COLOR_FILTER_LABELS,
  FILTER_DIMENSION_ALL_LABEL,
  filterChips,
  hasActiveFilters,
  uniqueValues,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";
import { useStatsAnalyticsData } from "@/lib/stats/use-stats-analytics-data";
import type { StatsTabId } from "@/lib/stats/stats-tabs";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { appFormSelect } from "@/lib/ui/app-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { v2InsetCell } from "@/lib/ui/v2-surface";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function StatsPageV2({ userId, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const data = useStatsAnalyticsData(userId, initialWorkspace);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const onExport = () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg(null);
    try {
      const last = data.stats.cumulative[data.stats.cumulative.length - 1]?.y;
      const netR = typeof last === "number" && Number.isFinite(last) ? last : 0;
      const rows = [
        { metric: "account scope", value: data.accountScope === "all" ? "all accounts" : "active account" },
        { metric: "rows in scope", value: data.filteredEntries.length },
        { metric: "net pnl", value: netR },
        { metric: "win rate trades pct", value: data.stats.winRateTrades ?? "" },
        { metric: "profit factor", value: data.stats.profitFactor ?? "" },
        { metric: "max drawdown", value: data.stats.maxDrawdown ?? "" },
      ];
      const csv = recordsToCsv(
        [
          { key: "metric", label: "metric" },
          { key: "value", label: "value" },
        ],
        rows,
      );
      trackExportCsvClicked("stats_summary", "stats");
      triggerCsvDownload(`blueveno-analytics-summary-${fileDate()}.csv`, csv);
      setExportMsg("Analytics summary export ready.");
    } catch (error) {
      setExportMsg(error instanceof Error ? error.message : "Could not export summary.");
    } finally {
      setExportBusy(false);
    }
  };

  const renderTabPanel = (tab: StatsTabId) => {
    switch (tab) {
      case "summary":
        return <AnalyticsSummaryPanel data={data} currency={displayCurrency} />;
      case "performance":
        return <AnalyticsPerformancePanel data={data} currency={displayCurrency} />;
      case "behavior":
        return <AnalyticsBehaviorPanel data={data} currency={displayCurrency} />;
      case "patterns":
        return <AnalyticsPatternsPanel data={data} currency={displayCurrency} />;
      case "accounts":
        return <AnalyticsAccountsPanel data={data} currency={displayCurrency} />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Analytics"
        title="Stats"
        description="Insight-driven performance, behavior, and pattern analysis."
        actions={
          <Link href="/app/calendar" className={appSecondaryCta}>
            <CalendarDays className="mr-1.5 size-3.5" />
            Calendar
          </Link>
        }
      />

      <AnalyticsV2Toolbar
        accountScope={data.accountScope}
        onAccountScopeChange={data.setAccountScope}
        datePreset={data.datePreset}
        onDatePresetChange={data.applyDatePreset}
        onExport={onExport}
        exportBusy={exportBusy}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        hasActiveFilters={hasActiveFilters(data.filters)}
        onClearFilters={data.clearFilters}
      />

      <InlineFeedback message={exportMsg} tone={feedbackToneFromMessage(exportMsg)} />

      {filtersOpen ? (
        <div className={cn(v2InsetCell, "grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4")}>
          <Input
            value={data.filters.search}
            onChange={(e) => data.setFilters((f: EntryFilters) => ({ ...f, search: e.target.value }))}
            placeholder="Search symbol or note"
            className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[13px]"
          />
          <Input
            type="date"
            value={data.filters.from}
            onChange={(e) => data.setFilters((f: EntryFilters) => ({ ...f, from: e.target.value }))}
            className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
          />
          <Input
            type="date"
            value={data.filters.to}
            onChange={(e) => data.setFilters((f: EntryFilters) => ({ ...f, to: e.target.value }))}
            className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
          />
          <select
            value={data.filters.dayColor}
            onChange={(e) => data.setFilters((f: EntryFilters) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))}
            className={appFormSelect}
          >
            {(Object.keys(DAY_COLOR_FILTER_LABELS) as EntryFilters["dayColor"][]).map((key) => (
              <option key={key} value={key}>
                {DAY_COLOR_FILTER_LABELS[key]}
              </option>
            ))}
          </select>
          {[
            { key: "symbol", values: uniqueValues(data.baseEntries, (row) => row.sym) },
            { key: "mood", values: uniqueValues(data.baseEntries, (row) => row.moodState) },
            { key: "setup", values: uniqueValues(data.baseEntries, (row) => String(row.setup)) },
            { key: "mistake", values: uniqueValues(data.baseEntries, (row) => String(row.tag)) },
            { key: "session", values: uniqueValues(data.baseEntries, (row) => row.sessionTag) },
            { key: "market", values: uniqueValues(data.baseEntries, (row) => row.marketCondition) },
          ].map((item) => (
            <select
              key={item.key}
              value={data.filters[item.key as keyof EntryFilters] as string}
              onChange={(e) => data.setFilters((f: EntryFilters) => ({ ...f, [item.key]: e.target.value }))}
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

      {hasActiveFilters(data.filters) ? (
        <div className="flex flex-wrap gap-1.5">
          {filterChips(data.filters).map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-bv-blue-accent/30 bg-bv-blue-accent/10 px-2 py-0.5 text-[10px] text-zinc-200"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      {!data.ready ? (
        <LoadingSkeleton variant="chart" className="min-h-56" />
      ) : data.baseEntries.length === 0 ? (
        <AnalyticsEmptyState />
      ) : (
        <>
          <StatsTabNav activeTab={data.activeTab} onChange={(tab) => data.navigateTab(tab)} />

          {data.filteredEntries.length === 0 ? (
            <EmptyState
              title="No results for current filters"
              description="Clear filters to reveal your full analytics view."
              action={
                <button type="button" onClick={data.clearFilters} className="text-[13px] text-bv-ice hover:underline">
                  Clear filters
                </button>
              }
            />
          ) : (
            <div
              key={data.activeTab}
              role="tabpanel"
              id={`stats-tabpanel-${data.activeTab}`}
              aria-labelledby={`stats-tab-${data.activeTab}`}
              className="space-y-5"
            >
              {renderTabPanel(data.activeTab)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
