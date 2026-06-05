"use client";

import { ArrowUpRight, ChevronDown, Search } from "lucide-react";
import { TopActionBar } from "@/components/v2/layout/top-action-bar";
import { FilterBar, type FilterBarOption } from "@/components/v2/tables/filter-bar";
import { DATE_RANGE_PRESET_LABELS, type DateRangePreset } from "@/lib/stats/date-range-presets";
import type { TradeAccountFilter, TradeResultFilter } from "@/lib/trades/use-trades-browser-data";
import { cn } from "@/lib/utils";
import { v2FilterPill, v2Toolbar } from "@/lib/ui/v2-surface";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { Input } from "@/components/ui/input";

type AccountOption = { id: string; name: string };

type TradesToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  accountFilter: TradeAccountFilter;
  onAccountFilterChange: (filter: TradeAccountFilter) => void;
  accounts: AccountOption[];
  datePreset: DateRangePreset;
  onDatePresetChange: (preset: DateRangePreset) => void;
  resultFilter: TradeResultFilter;
  onResultFilterChange: (result: TradeResultFilter) => void;
  onExport?: () => void;
  exportBusy?: boolean;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

const DATE_PRESETS: FilterBarOption[] = (["7d", "30d", "90d", "all", "custom"] as DateRangePreset[]).map((id) => ({
  id,
  label: DATE_RANGE_PRESET_LABELS[id],
}));

const RESULT_OPTIONS: FilterBarOption[] = [
  { id: "all", label: "All results" },
  { id: "wins", label: "Green" },
  { id: "losses", label: "Red" },
];

export function TradesToolbar({
  search,
  onSearchChange,
  accountFilter,
  onAccountFilterChange,
  accounts,
  datePreset,
  onDatePresetChange,
  resultFilter,
  onResultFilterChange,
  onExport,
  exportBusy,
  filtersOpen,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
}: TradesToolbarProps) {
  return (
    <div className="space-y-3">
      <TopActionBar
        left={
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="relative min-w-[10rem] flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" aria-hidden />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search symbol"
                aria-label="Search by symbol"
                className="h-9 rounded-lg border-white/[0.1] bg-black/25 pl-8 text-[13px]"
              />
            </div>
            <FilterBar
              options={DATE_PRESETS}
              value={datePreset}
              onChange={(id) => onDatePresetChange(id as DateRangePreset)}
            />
            <FilterBar
              options={RESULT_OPTIONS}
              value={resultFilter}
              onChange={(id) => onResultFilterChange(id as TradeResultFilter)}
            />
          </div>
        }
        right={
          <>
            <div className={cn(v2FilterPill, "h-9 gap-1 px-2")}>
              <select
                value={accountFilter}
                onChange={(e) => onAccountFilterChange(e.target.value as TradeAccountFilter)}
                className="max-w-[10rem] bg-transparent text-[12px] text-zinc-200 outline-none"
                aria-label="Filter by account"
              >
                <option value="active">Active account</option>
                <option value="all">All accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3 shrink-0 text-zinc-500" aria-hidden />
            </div>
            {onExport ? (
              <button type="button" onClick={onExport} disabled={exportBusy} className={appSecondaryCta}>
                <ArrowUpRight className="mr-1.5 size-3.5" />
                {exportBusy ? "Exporting…" : "Export"}
              </button>
            ) : null}
          </>
        }
      />
      <div className={cn(v2Toolbar, "justify-between")}>
        <button type="button" onClick={onToggleFilters} className="text-[12px] text-zinc-400 hover:text-zinc-200">
          {filtersOpen ? "Hide filters" : "More filters"}
        </button>
        {hasActiveFilters ? (
          <button type="button" onClick={onClearFilters} className="text-[12px] text-bv-ice hover:underline">
            Clear filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
