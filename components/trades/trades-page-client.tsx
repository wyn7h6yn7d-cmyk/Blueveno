"use client";

import Link from "next/link";
import { useState } from "react";
import { ListFilter } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { InlineFeedback } from "@/components/app/inline-feedback";
import { TradeEntryDrawer } from "@/components/trades/trade-entry-drawer";
import { TradesMobileCards } from "@/components/trades/trades-mobile-cards";
import { TradesTable } from "@/components/trades/trades-table";
import { TradesToolbar } from "@/components/trades/trades-toolbar";
import { EmptyState, LoadingSkeleton } from "@/components/v2/design-system";
import { PageHeader } from "@/components/v2/layout";
import { TableCard } from "@/components/v2/cards";
import { feedbackToneFromMessage } from "@/lib/feedback/feedback-tone";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import {
  DAY_COLOR_FILTER_LABELS,
  FILTER_DIMENSION_ALL_LABEL,
  filterChips,
  hasActiveFilters,
  uniqueValues,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";
import { useTradesBrowserData } from "@/lib/trades/use-trades-browser-data";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appPrimaryCta } from "@/lib/ui/app-surface";
import { appFormSelect } from "@/lib/ui/app-form";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { v2InsetCell } from "@/lib/ui/v2-surface";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function TradesPageClient({ userId, initialWorkspace }: Props) {
  const { displayCurrency, canWriteJournal } = useAccess();
  const data = useTradesBrowserData(userId, initialWorkspace, displayCurrency);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  const onExport = () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg(null);
    try {
      const csv = recordsToCsv(
        [
          { key: "entryDate", label: "date" },
          { key: "account", label: "account" },
          { key: "symbol", label: "symbol" },
          { key: "pnlLabel", label: "pnl" },
          { key: "mood", label: "mood" },
          { key: "setup", label: "setup" },
          { key: "mistakeTag", label: "mistake" },
          { key: "session", label: "session" },
          { key: "marketCondition", label: "market" },
          { key: "disciplineScore", label: "discipline_score" },
        ],
        data.tradeRows.map((row) => ({
          entryDate: row.entryDate,
          account: row.accountName,
          symbol: row.symbol,
          pnlLabel: row.pnlLabel,
          mood: row.mood ?? "",
          setup: row.setup,
          mistakeTag: row.mistakeTag ?? "",
          session: row.session ?? "",
          marketCondition: row.marketCondition ?? "",
          disciplineScore: row.disciplineScore ?? "",
        })),
      );
      triggerCsvDownload(`blueveno-trades-${fileDate()}.csv`, csv);
      setExportMsg("Trades export ready.");
    } catch (error) {
      setExportMsg(error instanceof Error ? error.message : "Could not export trades.");
    } finally {
      setExportBusy(false);
    }
  };

  const drawerOpen = Boolean(data.selectedEntryId && data.selectedTrade);

  return (
    <div className="space-y-6">
      <PageHeader
        variant="signature"
        eyebrow="Journal browser"
        title="Trades"
        description="Browse, filter, and review every logged entry in one dense table."
        actions={
          canWriteJournal ? (
            <Link href="/app/journal#add" className={appPrimaryCta}>
              Log the day
            </Link>
          ) : null
        }
      />

      <TradesToolbar
        search={data.filters.search}
        onSearchChange={(value) => data.setFilters((f: EntryFilters) => ({ ...f, search: value }))}
        accountFilter={data.accountFilter}
        onAccountFilterChange={data.setAccountFilter}
        accounts={data.accounts.map((a) => ({ id: a.id, name: a.name }))}
        datePreset={data.datePreset}
        onDatePresetChange={data.applyDatePreset}
        resultFilter={data.resultFilter}
        onResultFilterChange={data.setResultFilter}
        onExport={data.tradeRows.length > 0 ? onExport : undefined}
        exportBusy={exportBusy}
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        hasActiveFilters={hasActiveFilters(data.filters) || data.resultFilter !== "all"}
        onClearFilters={data.clearFilters}
      />

      <InlineFeedback message={exportMsg} tone={feedbackToneFromMessage(exportMsg)} />

      {filtersOpen ? (
        <div className={cn(v2InsetCell, "grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-4")}>
          <Input
            type="date"
            value={data.filters.from}
            onChange={(e) => data.setFilters((f: EntryFilters) => ({ ...f, from: e.target.value }))}
            className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
            aria-label="From date"
          />
          <Input
            type="date"
            value={data.filters.to}
            onChange={(e) => data.setFilters((f: EntryFilters) => ({ ...f, to: e.target.value }))}
            className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]"
            aria-label="To date"
          />
          <select
            value={data.filters.dayColor}
            onChange={(e) =>
              data.setFilters((f: EntryFilters) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))
            }
            className={appFormSelect}
            aria-label="Green or red result"
          >
            {(Object.keys(DAY_COLOR_FILTER_LABELS) as EntryFilters["dayColor"][]).map((key) => (
              <option key={key} value={key}>
                {DAY_COLOR_FILTER_LABELS[key]}
              </option>
            ))}
          </select>
          {[
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

      {hasActiveFilters(data.filters) || data.resultFilter !== "all" ? (
        <div className="flex flex-wrap gap-1.5">
          {filterChips(data.filters).map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-bv-blue-accent/30 bg-bv-blue-accent/10 px-2 py-0.5 text-[10px] text-zinc-200"
            >
              {chip}
            </span>
          ))}
          {data.resultFilter !== "all" ? (
            <span className="rounded-full border border-bv-blue-accent/30 bg-bv-blue-accent/10 px-2 py-0.5 text-[10px] text-zinc-200">
              {data.resultFilter === "wins" ? "Green" : "Red"}
            </span>
          ) : null}
        </div>
      ) : null}

      {!data.ready ? (
        <LoadingSkeleton variant="chart" className="min-h-56" />
      ) : data.baseEntries.length === 0 ? (
        <EmptyState
          title="No trades yet"
          description="Your trades table fills automatically from journal entries. Log your first day to get started."
          action={
            canWriteJournal ? (
              <Link href="/app/journal#add" className={appPrimaryCta}>
                Log the day
              </Link>
            ) : undefined
          }
          icon={ListFilter}
        />
      ) : (
        <TableCard
          eyebrow="Entries"
          title={`${data.tradeRows.length} trade${data.tradeRows.length === 1 ? "" : "s"} in view`}
          description="Click a row for quick review or open full detail."
          contentClassName="p-0 sm:p-0"
        >
          <TradesTable
            rows={data.tradeRows}
            currency={displayCurrency}
            loading={!data.ready}
            onRowOpen={(row) => data.setSelectedEntryId(row.id)}
            hasAnyEntries={data.baseEntries.length > 0}
          />
          {data.tradeRows.length > 0 ? (
            <TradesMobileCards
              rows={data.tradeRows}
              currency={displayCurrency}
              onRowOpen={(row) => data.setSelectedEntryId(row.id)}
            />
          ) : (
            <div className="md:hidden">
              <EmptyState
                title="No trades match these filters"
                description="Try widening the date range or clearing filters."
                compact
              />
            </div>
          )}
        </TableCard>
      )}

      <TradeEntryDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) data.setSelectedEntryId(null);
        }}
        trade={data.selectedTrade}
        currency={displayCurrency}
        siblings={data.baseEntries}
        weeklyReflections={data.weeklyReflections}
        personalRules={data.personalRules}
        canWriteJournal={canWriteJournal}
      />
    </div>
  );
}
