"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DisciplineTrend } from "@/components/analytics/analytics-charts";
import { AnalyticsBreakdownTable } from "@/components/stats/analytics-breakdown-table";
import { ChartCard, SectionCard, TableCard } from "@/components/v2/cards";
import { InsightCard } from "@/components/v2/cards/insight-card";
import { BarChart } from "@/components/v2/charts";
import { InsightList, KpiGrid, LabelValueRow, MetricCard, StatStrip } from "@/components/v2";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";
import {
  computeBehaviorAnalysis,
  type BehaviorAnalysisResult,
  type RuleAdherenceMetric,
} from "@/lib/behavior/behavior-analysis";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import type { BreakdownRow } from "@/lib/stats/analytics-v2-transforms";
import type { JournalRow } from "@/lib/user-data/types";
import type { TradingStatsSnapshot, WeeklyReflectionStat } from "@/lib/user-data/trading-stats";

type BehaviorInsightsModuleProps = {
  entries: JournalRow[];
  currency: string;
  personalRules?: Array<{ id: string; title: string; is_active: boolean }>;
  reflectionWorked?: string | null;
  reflectionSlipped?: string | null;
  weeklyReflections?: WeeklyReflectionStat[];
  stats?: TradingStatsSnapshot;
  latestReviewRule?: string | null;
  latestReviewConfidence?: number | null;
};

function fmtPnl(n: number | null, currency: string) {
  if (n === null || !Number.isFinite(n)) return "—";
  return formatSignedPnlAmount(n, currency);
}

function moodRowsToBreakdown(rows: BehaviorAnalysisResult["moodRows"]): BreakdownRow[] {
  return rows.map((r) => ({
    id: r.mood,
    label: r.mood,
    count: r.count,
    winRate: r.winRate,
    totalPnl: r.totalPnl,
    avgResult: r.avgPnl,
  }));
}

function exitRowsToBreakdown(rows: BehaviorAnalysisResult["exitRows"]): BreakdownRow[] {
  return rows.map((r) => ({
    id: r.key,
    label: r.label,
    count: r.count,
    winRate: null,
    totalPnl: r.totalPnl,
    avgResult: r.avgPnl,
  }));
}

function trendDelta(
  value: number | null,
): { delta?: string; direction: "up" | "down" | "flat" } {
  if (value === null) return { direction: "flat" };
  if (value === 0) return { delta: "0 pts", direction: "flat" };
  return {
    delta: `${value > 0 ? "+" : ""}${value} pts`,
    direction: value > 0 ? "up" : "down",
  };
}

const REC_SEVERITY = {
  protective: "warning",
  performance: "positive",
  consistency: "info",
} as const;

function RuleMetricRow({ metric, currency }: { metric: RuleAdherenceMetric; currency: string }) {
  return (
    <LabelValueRow
      label={metric.label}
      value={metric.pct !== null ? `${metric.pct}%` : "—"}
      hint={`${fmtPnl(metric.avgPnlWhenYes, currency)} when yes · ${fmtPnl(metric.avgPnlWhenNo, currency)} when no · n=${metric.yesCount + metric.noCount}`}
      dense
    />
  );
}

export function BehaviorInsightsModule({
  entries,
  currency,
  personalRules = [],
  reflectionWorked,
  reflectionSlipped,
  weeklyReflections = [],
  stats,
  latestReviewRule,
  latestReviewConfidence,
}: BehaviorInsightsModuleProps) {
  const analysis = useMemo(
    () =>
      computeBehaviorAnalysis({
        entries,
        currency,
        personalRules,
        reflectionWorked,
        reflectionSlipped,
      }),
    [entries, currency, personalRules, reflectionWorked, reflectionSlipped],
  );

  const moodBreakdown = useMemo(() => moodRowsToBreakdown(analysis.moodRows), [analysis.moodRows]);
  const moodChartData = useMemo(
    () =>
      analysis.moodRows.map((r) => ({
        mood: r.mood,
        pnl: Number((r.avgPnl ?? 0).toFixed(2)),
      })),
    [analysis.moodRows],
  );
  const exitBreakdown = useMemo(() => exitRowsToBreakdown(analysis.exitRows), [analysis.exitRows]);

  const disciplineTrend = trendDelta(analysis.scores.disciplineTrend);
  const planTrend = trendDelta(analysis.scores.planFollowTrend);

  if (!analysis.sufficientData) {
    return (
      <EmptyStatePanel
        title="Behavior insights need more entries"
        description="Log at least 3 trading days with mood and discipline checks to unlock behavior scores, rule correlations, and coaching insights."
        action={
          <Link href="/app/journal?tab=review" className="text-[13px] text-bv-ice hover:underline">
            Log the day
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <KpiGrid columns={4}>
        <MetricCard
          label="Discipline score"
          value={analysis.scores.disciplineScore !== null ? `${analysis.scores.disciplineScore}%` : "—"}
          hint={`${analysis.scores.currentSample} entries · last 30d`}
          delta={disciplineTrend.delta}
          deltaDirection={disciplineTrend.direction}
          deltaLabel={analysis.scores.hasTrend ? "vs prior 30d" : undefined}
          tone={
            (analysis.scores.disciplineScore ?? 0) >= 70
              ? "positive"
              : (analysis.scores.disciplineScore ?? 0) < 50
                ? "negative"
                : "neutral"
          }
        />
        <MetricCard
          label="Plan-follow score"
          value={analysis.scores.planFollowScore !== null ? `${analysis.scores.planFollowScore}%` : "—"}
          delta={planTrend.delta}
          deltaDirection={planTrend.direction}
          deltaLabel={analysis.scores.hasTrend ? "vs prior 30d" : undefined}
        />
        <MetricCard
          label="Emotional consistency"
          value={
            analysis.scores.emotionalConsistencyScore !== null
              ? `${analysis.scores.emotionalConsistencyScore}%`
              : "—"
          }
          hint="Mood stability + logging coverage"
        />
        <MetricCard
          label="Best mindset"
          value={analysis.bestMood?.mood ?? "—"}
          hint={
            analysis.bestMood
              ? `${fmtPnl(analysis.bestMood.avgPnl, currency)} avg · ${analysis.bestMood.winRate ?? "—"}% win`
              : "Log mood on entries"
          }
          tone="positive"
        />
      </KpiGrid>

      {analysis.dataNotes.length > 0 ? (
        <p className="text-[12px] leading-relaxed text-zinc-500">
          {analysis.dataNotes.join(" ")}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          eyebrow="Mindset"
          title="Avg P&L by mood"
          hasData={moodChartData.length > 0}
        >
          <BarChart data={moodChartData} xKey="mood" yKey="pnl" height={220} colorBySign />
        </ChartCard>
        {stats ? (
          <SectionCard eyebrow="Trend" title="Weekly discipline">
            <DisciplineTrend weekly={stats.weekly} weeklyReflections={weeklyReflections} />
            <div className="mt-4 space-y-2">
              <LabelValueRow label="Weekly rule" value={latestReviewRule?.trim() || "Not set"} dense />
              <LabelValueRow
                label="Confidence"
                value={latestReviewConfidence !== null ? `${latestReviewConfidence}/5` : "—"}
                dense
              />
            </div>
          </SectionCard>
        ) : null}
      </div>

      <TableCard
        eyebrow="Emotional"
        title="Performance by mood"
        description="Requires at least 2 entries per mood state."
        contentClassName="p-0 sm:p-0"
      >
        <AnalyticsBreakdownTable
          rows={moodBreakdown}
          currency={currency}
          emptyTitle="No mood performance yet"
          emptyDescription="Tag mood on journal entries to compare win rate and average result by mindset."
        />
      </TableCard>

      <StatStrip
        items={[
          {
            id: "best-mood",
            label: "Best mindset",
            value: analysis.bestMood?.mood ?? "—",
            tone: "positive",
          },
          {
            id: "risk-mood",
            label: "Riskiest mindset",
            value: analysis.riskiestMood?.mood ?? "—",
            tone: "negative",
          },
          {
            id: "best-rule",
            label: "Strongest rule link",
            value: analysis.bestRuleCorrelation?.label ?? "—",
            tone: "positive",
          },
          {
            id: "worst-rule",
            label: "Costliest violation",
            value: analysis.worstRuleCorrelation?.label ?? "—",
            tone: "caution",
          },
        ]}
      />

      <SectionCard
        eyebrow="Discipline"
        title="Rule adherence"
        description="Core journal checks and mistake-tag proxies."
      >
        <div className="space-y-3">
          {analysis.ruleMetrics.map((metric) => (
            <RuleMetricRow key={metric.key} metric={metric} currency={currency} />
          ))}
        </div>
      </SectionCard>

      {analysis.personalRuleRows.length > 0 ? (
        <SectionCard
          eyebrow="Personal rules"
          title="Custom rule correlations"
          description="Active rules in this filter scope."
        >
          <div className="space-y-3">
            {analysis.personalRuleRows.map((row) => (
              <LabelValueRow
                key={row.ruleId}
                label={row.title}
                value={row.followedPct !== null ? `${row.followedPct}% followed` : "—"}
                hint={`${fmtPnl(row.avgWhenFollowed, currency)} when followed · ${fmtPnl(row.avgWhenBroken, currency)} when broken`}
                dense
              />
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard eyebrow="Personal rules" title="Custom rule correlations">
          <EmptyStatePanel
            title="No active rules"
            description="Create rules in Settings to correlate adherence with P&L."
            action={
              <Link href="/app/settings?section=rules" className="text-[13px] text-bv-ice hover:underline">
                Open rules
              </Link>
            }
            compact
          />
        </SectionCard>
      )}

      <TableCard
        eyebrow="Execution"
        title="Exit & execution behavior"
        description="From mistake tags and plan-follow proxies — not dedicated exit fields."
        contentClassName="p-0 sm:p-0"
      >
        <AnalyticsBreakdownTable
          rows={exitBreakdown}
          currency={currency}
          emptyTitle="No exit behavior tags yet"
          emptyDescription="Tag mistakes like Early exit, Late entry, or Moved stop to analyze execution patterns."
        />
      </TableCard>

      <SectionCard eyebrow="Coaching" title="Weekly insights">
        <InsightList
          items={analysis.coachingInsights.map((item) => ({
            id: item.id,
            title: item.title,
            body: item.body,
            severity: item.severity === "info" ? "info" : item.severity,
            tag: item.tag,
          }))}
          empty={
            <EmptyStatePanel
              title="Insights unlock with more data"
              description="Add discipline checks, mood tags, and weekly reflections to surface coaching patterns."
              compact
            />
          }
        />
      </SectionCard>

      <SectionCard eyebrow="Actions" title="Recommendations">
        <div className="grid gap-2.5 lg:grid-cols-3">
          {analysis.recommendations.map((rec) => (
            <InsightCard
              key={rec.id}
              title={rec.title}
              body={rec.body}
              severity={REC_SEVERITY[rec.kind]}
              tag={rec.kind}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
