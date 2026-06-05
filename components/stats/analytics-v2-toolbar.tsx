"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import { TopActionBar } from "@/components/v2/layout/top-action-bar";
import { FilterBar, type FilterBarOption } from "@/components/v2/tables/filter-bar";
import { DATE_RANGE_PRESET_LABELS, type DateRangePreset } from "@/lib/stats/date-range-presets";
import { cn } from "@/lib/utils";
import { v2FilterPill, v2Toolbar } from "@/lib/ui/v2-surface";
import { appSecondaryCta } from "@/lib/ui/app-surface";

type AnalyticsV2ToolbarProps = {
  accountScope: "active" | "all";
  onAccountScopeChange: (scope: "active" | "all") => void;
  datePreset: DateRangePreset;
  onDatePresetChange: (preset: DateRangePreset) => void;
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

export function AnalyticsV2Toolbar({
  accountScope,
  onAccountScopeChange,
  datePreset,
  onDatePresetChange,
  onExport,
  exportBusy,
  filtersOpen,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
}: AnalyticsV2ToolbarProps) {
  return (
    <div className="space-y-3">
      <TopActionBar
        left={
          <FilterBar
            options={DATE_PRESETS}
            value={datePreset}
            onChange={(id) => onDatePresetChange(id as DateRangePreset)}
          />
        }
        right={
          <>
            <div className={cn(v2FilterPill, "h-9 gap-1 px-2")}>
              <select
                value={accountScope}
                onChange={(e) => onAccountScopeChange(e.target.value as "active" | "all")}
                className="bg-transparent text-[12px] text-zinc-200 outline-none"
                aria-label="Account scope"
              >
                <option value="active">Active account</option>
                <option value="all">All accounts</option>
              </select>
              <ChevronDown className="size-3 text-zinc-500" aria-hidden />
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
