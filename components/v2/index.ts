/**
 * Blueveno V2 design system — parallel primitives for incremental page upgrades.
 * Canonical barrel for new pages: `@/components/v2/design-system`
 * Existing v1 pages remain unchanged until migrated.
 */
export * from "@/components/v2/cards";
export * from "@/components/v2/charts";
export * from "@/components/v2/data";
export * from "@/components/v2/layout";
export * from "@/components/v2/states";
export * from "@/components/v2/tables";

// Backward-compatible aliases from initial v2 pass
export { KpiCard } from "@/components/v2/ui/kpi-card";
export { ModuleShell } from "@/components/v2/ui/module-shell";
export { InsightBlock } from "@/components/v2/ui/insight-block";
export { LoadingBlock } from "@/components/v2/ui/loading-block";

// New primitives (also available via design-system barrel)
export { SegmentedTabs, type SegmentedTabOption } from "@/components/v2/design-system/segmented-tabs";
export { TrendChart } from "@/components/v2/design-system/trend-chart";
export { ProgressBar } from "@/components/v2/design-system/progress-bar";
export { ScoreGauge } from "@/components/v2/design-system/score-gauge";
export { EmptyState } from "@/components/v2/design-system/empty-state";
export { LoadingSkeleton } from "@/components/v2/design-system/loading-skeleton";

// Internal reference composition (not routed)
export { FoundationShowcase } from "@/components/v2/examples/foundation-showcase";
