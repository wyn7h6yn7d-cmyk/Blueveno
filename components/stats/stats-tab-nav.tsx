"use client";

import {
  LayoutGrid,
  LineChart,
  Sparkles,
  UserCheck,
  Wallet,
} from "lucide-react";
import { STATS_TABS, statsTabLabel, type StatsTabId } from "@/lib/stats/stats-tabs";
import { cn } from "@/lib/utils";
import { v2TabItem, v2TabItemActive, v2TabStrip } from "@/lib/ui/v2-surface";

const TAB_ICONS: Record<StatsTabId, typeof LayoutGrid> = {
  summary: LayoutGrid,
  performance: LineChart,
  behavior: UserCheck,
  patterns: Sparkles,
  accounts: Wallet,
};

type StatsTabNavProps = {
  activeTab: StatsTabId;
  onChange: (tab: StatsTabId) => void;
  className?: string;
};

export function StatsTabNav({ activeTab, onChange, className }: StatsTabNavProps) {
  return (
    <nav className={cn(v2TabStrip, className)} aria-label="Analytics sections" role="tablist">
      {STATS_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab];
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`stats-tab-${tab}`}
            aria-selected={active}
            aria-controls={`stats-tabpanel-${tab}`}
            onClick={() => onChange(tab)}
            className={cn(
              active ? v2TabItemActive : v2TabItem,
              "inline-flex shrink-0 items-center gap-1.5 px-3 py-2",
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
            {statsTabLabel(tab)}
          </button>
        );
      })}
    </nav>
  );
}
