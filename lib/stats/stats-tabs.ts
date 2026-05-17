export const STATS_TABS = ["summary", "performance", "behavior", "patterns", "accounts"] as const;

export type StatsTabId = (typeof STATS_TABS)[number];

export const DEFAULT_STATS_TAB: StatsTabId = "summary";

const LEGACY_TAB_IDS: Record<string, StatsTabId> = {
  "stats-summary": "summary",
  "stats-performance": "performance",
  "stats-behavior": "behavior",
  "stats-patterns": "patterns",
  "stats-accounts": "accounts",
};

export function parseStatsTab(value: string | null | undefined): StatsTabId {
  if (!value) return DEFAULT_STATS_TAB;
  if (STATS_TABS.includes(value as StatsTabId)) return value as StatsTabId;
  return LEGACY_TAB_IDS[value] ?? DEFAULT_STATS_TAB;
}

export function statsTabLabel(tab: StatsTabId): string {
  switch (tab) {
    case "summary":
      return "Summary";
    case "performance":
      return "Performance";
    case "behavior":
      return "Behavior";
    case "patterns":
      return "Patterns";
    case "accounts":
      return "Accounts";
  }
}
