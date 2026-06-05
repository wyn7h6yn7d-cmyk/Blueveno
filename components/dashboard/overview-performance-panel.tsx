"use client";

import type { BarChartPoint } from "@/components/v2/charts/bar-chart";
import type { LineAreaPoint } from "@/components/v2/charts/line-area-chart";
import { BarChart, LineAreaChart } from "@/components/v2/charts";
import { ChartCard } from "@/components/v2/cards";
import { overviewCardFeatured, overviewChartWell } from "@/lib/ui/overview-surface";
import { v2Eyebrow, v2Supporting } from "@/lib/ui/v2-surface";
import { cn } from "@/lib/utils";

type OverviewPerformancePanelProps = {
  cumulativeData: LineAreaPoint[];
  dailyBarData: BarChartPoint[];
  loading?: boolean;
};

export function OverviewPerformancePanel({
  cumulativeData,
  dailyBarData,
  loading = false,
}: OverviewPerformancePanelProps) {
  const hasCumulative = cumulativeData.length >= 2;
  const hasDaily = dailyBarData.length > 0;

  return (
    <ChartCard
      eyebrow="Performance"
      title="Performance overview"
      description="How equity is building — cumulative curve with recent daily results."
      hasData={hasCumulative || hasDaily}
      loading={loading}
      emptyTitle="Not enough data yet"
      emptyDescription="Log a few trading days to unlock your performance chart."
      contentClassName="space-y-5 p-4 sm:p-5"
      className={cn("h-full", overviewCardFeatured)}
    >
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className={v2Eyebrow}>Cumulative P&L</p>
          <p className={v2Supporting}>All logged trading days</p>
        </div>
        <LineAreaChart
          data={cumulativeData}
          xKey="day"
          yKey="pnl"
          variant="area"
          height={320}
          enhanced
          wellClassName={overviewChartWell}
        />
      </div>

      <div className="space-y-2 border-t border-bv-blue-accent/10 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className={v2Eyebrow}>Daily P&L</p>
          <p className={v2Supporting}>Last 14 days</p>
        </div>
        <BarChart
          data={dailyBarData}
          xKey="day"
          yKey="pnl"
          height={168}
          colorBySign
          enhanced
          wellClassName={overviewChartWell}
        />
      </div>
    </ChartCard>
  );
}
