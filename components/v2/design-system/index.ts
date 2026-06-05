/**
 * Blueveno v2 dashboard design system — canonical exports for new pages.
 *
 * Usage:
 *   import { PageHeader, MetricCard, TrendChart, FilterBar } from "@/components/v2/design-system";
 *
 * Color semantics:
 *   - Blue (`bv-blue-accent`) — brand / focus / in-progress
 *   - Green — positive result
 *   - Red — negative result
 *   - Amber — warning / caution
 */

// Layout
export { PageHeader } from "@/components/v2/layout/page-header";
export { SectionHeader } from "@/components/v2/layout/section-header";

// Cards & metrics
export { MetricCard } from "@/components/v2/cards/metric-card";
export { ChartCard } from "@/components/v2/cards/chart-card";
export { TableCard } from "@/components/v2/cards/table-card";
export { InsightCard, type InsightSeverity } from "@/components/v2/cards/insight-card";

// Status & filters
export { StatusPill, type StatusPillTone } from "@/components/v2/data/status-pill";
export { FilterBar, type FilterBarOption } from "@/components/v2/tables/filter-bar";
export { SegmentedTabs, type SegmentedTabOption } from "@/components/v2/design-system/segmented-tabs";

// Tables
export {
  DataTable,
  sortDataTableRows,
  type DataTableColumn,
  type DataTableSortDir,
} from "@/components/v2/ui/data-table";

// States
export { EmptyState } from "@/components/v2/design-system/empty-state";
export { LoadingSkeleton } from "@/components/v2/design-system/loading-skeleton";
export { ErrorStatePanel } from "@/components/v2/states/error-state-panel";

// Charts
export { TrendChart } from "@/components/v2/design-system/trend-chart";
export { BarChart, type BarChartPoint } from "@/components/v2/charts/bar-chart";
export { DonutChart, type DonutSlice } from "@/components/v2/charts/donut-chart";
export { RadarChart, type RadarPoint } from "@/components/v2/charts/radar-chart";
export { LineAreaChart, type LineAreaPoint } from "@/components/v2/charts/line-area-chart";

// Progress & scores
export { ProgressBar } from "@/components/v2/design-system/progress-bar";
export { ProgressGoalBar } from "@/components/v2/charts/progress-goal-bar";
export { ScoreGauge } from "@/components/v2/design-system/score-gauge";

// Safe data helpers
export {
  clampPercent,
  safeDisplayNumber,
  safeFiniteNumber,
  safeProgressRatio,
  sanitizeChartRows,
} from "@/lib/v2";
