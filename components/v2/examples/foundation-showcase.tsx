"use client";

/**
 * Internal composition reference for v2 primitives — not wired to a route.
 */
import { BarChart3, TrendingUp } from "lucide-react";
import {
  ActionCard,
  ChartCard,
  EmptyStateCard,
  MetricCard,
  SectionCard,
  TableCard,
} from "@/components/v2/cards";
import { BarChart, DonutChart, RadarChart } from "@/components/v2/charts";
import { InsightList, KpiGrid, RangeIndicator, StatStrip, StatusPill } from "@/components/v2/data";
import {
  EmptyState,
  FilterBar,
  LoadingSkeleton,
  PageHeader,
  ProgressBar,
  ScoreGauge,
  SectionHeader,
  SegmentedTabs,
  TrendChart,
} from "@/components/v2/design-system";
import {
  CompactCell,
  DataTableShell,
  DataTableToolbar,
  PnlCell,
  TagCell,
} from "@/components/v2/tables";
import { useState } from "react";

const sampleLine = [
  { day: "Mon", pnl: 1.2 },
  { day: "Tue", pnl: 0.4 },
  { day: "Wed", pnl: -0.8 },
  { day: "Thu", pnl: 1.5 },
  { day: "Fri", pnl: 2.1 },
];

const sampleBars = [
  { day: "Mon", pnl: 120 },
  { day: "Tue", pnl: -45 },
  { day: "Wed", pnl: 80 },
];

const radarSample = [
  { axis: "Discipline", value: 82 },
  { axis: "Patience", value: 68 },
  { axis: "Setup", value: 74 },
  { axis: "Risk", value: 90 },
];

export function FoundationShowcase() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Blueveno v2"
        title="Design system foundation"
        description="Composable primitives for premium dashboard pages."
        meta={<StatusPill tone="active" dot>Design system ready</StatusPill>}
      />

      <SectionHeader eyebrow="Navigation" title="Segmented tabs" description="Transparent tabs — no black backing panels." />
      <SegmentedTabs
        options={[
          { id: "overview", label: "Overview" },
          { id: "performance", label: "Performance" },
          { id: "behavior", label: "Behavior" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <SectionHeader eyebrow="Metrics" title="KPI grid" />
      <KpiGrid columns={4}>
        <MetricCard label="Net P&L" value="+4.2R" delta="+1.1R" deltaDirection="up" tone="positive" icon={TrendingUp} />
        <MetricCard label="Win rate" value="58%" hint="Last 20 trades" />
        <MetricCard label="Discipline" value="82%" tone="positive" />
        <MetricCard label="Drawdown" value="-1.8R" tone="negative" />
      </KpiGrid>

      <div className="grid gap-4 md:grid-cols-3">
        <ProgressBar value={72} goal={100} label="Profit pacing" hint="Blue = in progress, green = met" />
        <ScoreGauge score={82} label="Discipline" hint="Green ≥75 · Amber ≥50 · Red below" />
        <LoadingSkeleton variant="metric" />
      </div>

      <StatStrip
        items={[
          { id: "1", label: "Trades", value: "24" },
          { id: "2", label: "Green days", value: "11", tone: "positive" },
          { id: "3", label: "Red days", value: "6", tone: "negative" },
          { id: "4", label: "Review", value: "Due", tone: "caution" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard eyebrow="Performance" title="Trend chart" hasData>
          <TrendChart data={sampleLine} xKey="day" yKey="pnl" />
        </ChartCard>
        <ChartCard eyebrow="Distribution" title="Daily P&L" hasData>
          <BarChart data={sampleBars} xKey="day" yKey="pnl" />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard eyebrow="Behavior" title="Radar chart" hasData>
          <RadarChart data={radarSample} />
        </ChartCard>
        <ChartCard eyebrow="Win rate" title="Donut chart" hasData>
          <DonutChart
            slices={[
              { id: "w", label: "Wins", value: 58 },
              { id: "l", label: "Losses", value: 32 },
              { id: "b", label: "BE", value: 10 },
            ]}
          />
        </ChartCard>
      </div>

      <SectionCard eyebrow="Insights" title="Behavior signals">
        <InsightList
          items={[
            { id: "1", title: "Morning edge", body: "Win rate is higher before noon.", severity: "positive", tag: "Pattern" },
            { id: "2", title: "Revenge risk", body: "Losses after 14:00 cluster.", severity: "warning", tag: "Risk" },
          ]}
        />
        <div className="mt-4">
          <RangeIndicator best={2.4} worst={-1.8} unit="r" />
        </div>
      </SectionCard>

      <TableCard eyebrow="Journal" title="Recent trades" toolbar={<DataTableToolbar summary="3 rows" />}>
        <DataTableShell>
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-zinc-500">Symbol</th>
              <th className="px-4 py-2 text-left text-zinc-500">P&L</th>
              <th className="px-4 py-2 text-left text-zinc-500">Tags</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/[0.05]">
              <td className="px-4 py-2"><CompactCell primary="EURUSD" secondary="Breakout" meta="09:42" /></td>
              <td className="px-4 py-2"><PnlCell value={1.2} unit="r" /></td>
              <td className="px-4 py-2"><TagCell tags={["A+", "London"]} tone="info" /></td>
            </tr>
          </tbody>
        </DataTableShell>
      </TableCard>

      <FilterBar
        options={[
          { id: "all", label: "All", count: 24 },
          { id: "wins", label: "Wins", count: 14 },
          { id: "losses", label: "Losses", count: 8 },
        ]}
        value="all"
        onChange={() => {}}
      />

      <EmptyState title="No data in range" description="Example empty state for charts and tables." compact />

      <div className="grid gap-4 md:grid-cols-2">
        <ActionCard eyebrow="Action" title="Weekly review" icon={BarChart3} cta={<StatusPill tone="pending">Due</StatusPill>}>
          Complete your reflection to unlock focus planning.
        </ActionCard>
        <EmptyStateCard title="No playbooks yet" description="Create your first setup playbook." />
      </div>
    </div>
  );
}
