"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, CalendarDays, NotebookPen, Shield, Target, TrendingUp } from "lucide-react";
import { MetricTile } from "@/components/analytics/metric-tile";
import { InsightMetricCard } from "@/components/analytics/insight-metric-card";
import { SessionComparisonPanel } from "@/components/analytics/session-comparison-panel";
import type { BehaviorInsight } from "@/lib/user-data/behavior-insights";
import { useAccess } from "@/components/access/access-provider";
import { DashboardCard } from "@/components/app/dashboard-card";
import { PageHeader } from "@/components/app/page-header";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { buildDayAgg, signedMoney } from "@/lib/user-data/journal-metrics";
import { getDisciplineDisplay, summarizeDisciplineCoverage } from "@/lib/user-data/discipline-stats";
import { entryDisciplineFraction } from "@/lib/user-data/stats-display";
import { getBehaviorInsights, getOverviewStats } from "@/lib/user-data/overview-stats";
import { getSessionAnalysis } from "@/lib/user-data/session-analysis";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { DayBreakdownModule } from "@/components/dashboard/day-breakdown-module";
import { OverviewOnboardingChecklist } from "@/components/dashboard/overview-onboarding-checklist";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { getOverviewOnboardingChecklist } from "@/lib/onboarding/overview-checklist";
import { InnerPanel } from "@/components/ui/card-system";
import { appCardShell, appInnerPanel, appKicker, appSecondaryCta } from "@/lib/ui/app-surface";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
  userTimezone?: string | null;
};

function formatDayLabel(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function percentOrDash(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "—" : `${Math.round(value)}%`;
}

function formatProfitFactor(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

function insightHeadline(insight: BehaviorInsight): string {
  const about = insight.detail.match(/^About\s+(.+?)\s+per/i);
  return about ? about[1] : insight.detail.split(".")[0] ?? insight.detail;
}

export function OverviewDashboard({ userId, email, initialWorkspace, userTimezone }: Props) {
  const { displayCurrency } = useAccess();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const { accounts, loading: accountsLoading } = useTradingAccountsWorkspace();
  const [weeklyReviewStatus, setWeeklyReviewStatus] = useState<{
    status: "review_ready" | "saved" | "set_focus";
    nextFocus: string | null;
  }>({ status: "review_ready", nextFocus: null });

  const dayAgg = useMemo(() => buildDayAgg(data.journal), [data.journal]);
  const dailyPnls = useMemo(
    () => [...dayAgg].sort((a, b) => a.key.localeCompare(b.key)).map((d) => d.pnl),
    [dayAgg],
  );
  const overviewStats = useMemo(
    () =>
      getOverviewStats({
        entries: data.journal,
        activeAccountId,
        timezone: userTimezone,
        currency: displayCurrency,
      }),
    [data.journal, activeAccountId, userTimezone, displayCurrency],
  );
  const dayAggMap = useMemo(() => new Map(dayAgg.map((item) => [item.key, item.pnl])), [dayAgg]);

  const weekCells = useMemo(() => {
    const now = new Date();
    const currentDay = (now.getDay() + 6) % 7;
    const monday = new Date(now);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(now.getDate() - currentDay);
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + idx);
      const key = localDayKey(day);
      return { key, label: day.toLocaleDateString("en-GB", { weekday: "short" }), day: day.getDate() };
    });
    return [
      ...days.slice(0, 5).map((d) => ({
        key: d.key,
        label: d.label,
        day: String(d.day),
        keys: [d.key],
      })),
      {
        key: `weekend-${days[5]!.key}`,
        label: "Weekend",
        day: `${days[5]!.day}/${days[6]!.day}`,
        keys: [days[5]!.key, days[6]!.key],
      },
    ];
  }, []);

  const weekTotal = useMemo(
    () => weekCells.reduce((sum, cell) => sum + cell.keys.reduce((acc, key) => acc + (dayAggMap.get(key) ?? 0), 0), 0),
    [dayAggMap, weekCells],
  );

  const recentActivity = useMemo(() => {
    return [...data.journal]
      .sort((a, b) => {
        const aDate = a.entryDate ?? a.createdAt ?? "";
        const bDate = b.entryDate ?? b.createdAt ?? "";
        return bDate.localeCompare(aDate);
      })
      .slice(0, 6)
      .map((row) => {
        const pnlParsed = parsePnlAmount(row.r);
        return {
          id: row.id,
          dayLabel: formatDayLabel(row.entryDate ?? row.createdAt?.slice(0, 10) ?? ""),
          pnl: pnlParsed,
          mood: row.moodState?.trim() || null,
          discipline: entryDisciplineFraction(row),
        };
      })
      .filter((row) => row.dayLabel.length > 0);
  }, [data.journal]);

  const disciplineCoverage = useMemo(
    () => summarizeDisciplineCoverage(data.journal),
    [data.journal],
  );
  const disciplineDisplay = useMemo(
    () => getDisciplineDisplay(disciplineCoverage),
    [disciplineCoverage],
  );
  const behaviorInsightsResult = useMemo(
    () =>
      getBehaviorInsights({
        entries: data.journal,
        activeAccountId,
        timezone: userTimezone,
        currency: displayCurrency,
      }),
    [data.journal, activeAccountId, userTimezone, displayCurrency],
  );
  const sessionAnalysis = useMemo(
    () => getSessionAnalysis(data.journal, { minTagEntries: 1 }),
    [data.journal],
  );

  const hasEntries = data.journal.length > 0;

  const onboarding = useMemo(
    () =>
      getOverviewOnboardingChecklist({
        accountCount: accounts.length,
        entryCount: data.journal.length,
        tradedDays: overviewStats.tradedDays,
      }),
    [accounts.length, data.journal.length, overviewStats.tradedDays],
  );
  const noLosingDays = overviewStats.losingDays === 0;
  const lossMetricLabel = noLosingDays ? "Smallest green day" : "Worst day";
  const lossMetricValue = noLosingDays ? overviewStats.smallestGreenDay : overviewStats.worstLossDay;
  const primaryKpis = [
    {
      label: "Week P&L",
      value: hasEntries ? signedMoney(overviewStats.weekPnl, displayCurrency) : "—",
      tone: hasEntries ? overviewStats.weekPnl : 0,
      icon: TrendingUp,
    },
    {
      label: "Month P&L",
      value: hasEntries ? signedMoney(overviewStats.monthPnl, displayCurrency) : "—",
      tone: hasEntries ? overviewStats.monthPnl : 0,
      icon: BarChart3,
    },
    {
      label: "Win rate",
      value: hasEntries ? percentOrDash(overviewStats.winRate) : "—",
      tone: 0,
      icon: Target,
    },
    {
      label: "Profit factor",
      value: hasEntries ? formatProfitFactor(overviewStats.profitFactor) : "—",
      tone: hasEntries && overviewStats.profitFactor !== null ? (overviewStats.profitFactor >= 1 ? 1 : -1) : 0,
    },
    {
      label: "Discipline score",
      value: hasEntries ? disciplineDisplay.value : "—",
      tone: 0,
      hint: hasEntries ? disciplineDisplay.hint : undefined,
      icon: Shield,
    },
  ];

  useEffect(() => {
    let cancelled = false;
    if (!userId || !activeAccountId) return;
    const now = new Date();
    const monday = new Date(now);
    const offset = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - offset);
    const weekStart = localDayKey(monday);
    const supabase = createClient();
    void (async () => {
      const { data: row } = await supabase
        .from("weekly_reflections")
        .select("what_worked, what_slipped, next_week_focus")
        .eq("user_id", userId)
        .eq("account_id", activeAccountId)
        .eq("week_start", weekStart)
        .maybeSingle();
      if (cancelled) return;
      const worked = String(row?.what_worked ?? "").trim();
      const slipped = String(row?.what_slipped ?? "").trim();
      const focus = String(row?.next_week_focus ?? "").trim();
      if (worked || slipped || focus) {
        setWeeklyReviewStatus({
          status: focus ? "saved" : "set_focus",
          nextFocus: focus || null,
        });
      } else {
        setWeeklyReviewStatus({ status: "review_ready", nextFocus: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, activeAccountId, data.journal.length]);

  return (
    <div className="space-y-7">
      <PageHeader
        variant="signature"
        eyebrow="Blueveno"
        title="Overview"
        description="Your data tells the story — today and this week at a glance."
        actions={
          <Link href="/app/journal#add" className={appSecondaryCta}>
            <NotebookPen className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
            Add trading day
          </Link>
        }
      />

      {ready && !accountsLoading && onboarding.show ? (
        <OverviewOnboardingChecklist items={onboarding.items} />
      ) : null}

      <section className="space-y-3" aria-label="Overview KPIs">
        {!ready ? (
          <div className="space-y-3">
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(appCardShell, "h-[8.5rem] animate-pulse bg-white/[0.02]")}
                />
              ))}
            </div>
            <div className={cn(appCardShell, "h-[17.5rem] animate-pulse bg-white/[0.02] sm:h-[15.5rem]")} />
          </div>
        ) : (
          <>
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
              {primaryKpis.map((card) => (
                <MetricTile
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  tone={card.tone}
                  hint={card.hint}
                  icon={card.icon}
                  className={
                    card.label === "Discipline score" && card.value === "Not enough discipline data"
                      ? "[&_p:nth-child(2)]:text-[1.2rem] sm:[&_p:nth-child(2)]:text-[1.35rem]"
                      : undefined
                  }
                />
              ))}
            </div>

            <DayBreakdownModule
              hasEntries={hasEntries}
              displayCurrency={displayCurrency}
              tradedDays={overviewStats.tradedDays}
              winningDays={overviewStats.winningDays}
              losingDays={overviewStats.losingDays}
              winRate={overviewStats.winRate}
              averageDay={overviewStats.averageDay}
              bestDay={overviewStats.bestDay}
              lossMetricLabel={lossMetricLabel}
              lossMetricValue={lossMetricValue}
              avgGreenDay={overviewStats.avgGreenDay}
              avgRedDay={overviewStats.avgRedDay}
              streakRaw={overviewStats.streak}
              dailyPnls={dailyPnls}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]" aria-label="At a glance details">
        <DashboardCard
          eyebrow="Mini calendar preview"
          title="Current week"
          description="Scan green and red days at a glance."
        >
          <div className="grid grid-cols-2 gap-2.5 min-[400px]:grid-cols-3 sm:grid-cols-6">
            {weekCells.map((cell) => {
              const pnl = cell.keys.reduce((acc, key) => acc + (dayAggMap.get(key) ?? 0), 0);
              const hasPnl = pnl !== 0;
              const tone =
                pnl > 0
                  ? "border-emerald-400/35 bg-emerald-500/[0.16] shadow-[0_0_20px_-8px_oklch(0.42_0.16_155/0.55)]"
                  : pnl < 0
                    ? "border-rose-400/35 bg-rose-500/[0.15] shadow-[0_0_20px_-8px_oklch(0.42_0.18_15/0.5)]"
                    : cn(appInnerPanel, "border-white/[0.07] bg-white/[0.02]");
              return (
                <div
                  key={cell.key}
                  className={cn(
                    "flex min-h-[4.75rem] flex-col items-center justify-center rounded-xl border px-1.5 py-2 text-center sm:min-h-[5.25rem] sm:px-2 sm:py-2.5",
                    tone,
                  )}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{cell.label}</p>
                  <p className="mt-1 font-display text-[15px] font-semibold tabular-nums text-zinc-100 sm:text-base">
                    {cell.day}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[12px] font-medium tabular-nums sm:text-[13px]",
                      !hasPnl && "text-zinc-500",
                      pnl > 0 && "text-emerald-200",
                      pnl < 0 && "text-rose-200",
                    )}
                  >
                    {hasPnl ? signedMoney(pnl, displayCurrency) : "—"}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
            <p className="text-[13px] text-zinc-500">Weekly total</p>
            <p
              className={cn(
                "font-display text-[1.35rem] tabular-nums tracking-[-0.03em]",
                !hasEntries && "text-zinc-300",
                hasEntries && weekTotal > 0 && "text-emerald-200",
                hasEntries && weekTotal < 0 && "text-rose-200",
                hasEntries && weekTotal === 0 && "text-zinc-100",
              )}
            >
              {hasEntries ? signedMoney(weekTotal, displayCurrency) : "—"}
            </p>
          </div>
        </DashboardCard>

        <DashboardCard eyebrow="Recent activity" title="Recent trading days" contentClassName="p-0">
          {recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-sm text-zinc-500 sm:px-6">
              <p>Log your first trading day to see your week take shape.</p>
              <Link href="/app/journal#add" className="mt-3 inline-flex text-[12px] text-[oklch(0.78_0.11_252)] hover:underline">
                Add trading day
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentActivity.map((item) => (
                <div key={item.id} className="grid gap-2 px-4 py-3.5 text-sm sm:grid-cols-[1.2fr_auto_auto_auto] sm:items-center sm:gap-3 sm:px-5">
                  <div className="flex items-center justify-between gap-2 sm:contents">
                    <p className="truncate text-zinc-200">{item.dayLabel}</p>
                  <p
                    className={cn(
                      "text-right tabular-nums sm:text-right",
                      item.pnl !== null && item.pnl > 0 && "text-emerald-200",
                      item.pnl !== null && item.pnl < 0 && "text-rose-200",
                      (item.pnl === null || item.pnl === 0) && "text-zinc-300",
                    )}
                  >
                    {item.pnl === null ? "—" : signedMoney(item.pnl, displayCurrency)}
                  </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:contents">
                  {item.mood ? (
                    <p className={cn(appInnerPanel, "rounded-md px-2 py-1 text-[12px] text-zinc-300")}>
                      {item.mood}
                    </p>
                  ) : null}
                  <p className={cn(appKicker, "tabular-nums")}>{item.discipline}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </section>

      {hasEntries ? (
        <section aria-label="Session analysis">
          <DashboardCard
            eyebrow="Sessions"
            title="Where you trade best"
            description="Compare profitability across market windows and your logged session tags."
          >
            <SessionComparisonPanel
              marketSessions={sessionAnalysis.marketSessions}
              taggedSessions={sessionAnalysis.taggedSessions}
              currency={displayCurrency}
              bestMarketSession={sessionAnalysis.bestMarketSession}
              weakestMarketSession={sessionAnalysis.weakestMarketSession}
              bestTaggedSession={sessionAnalysis.bestTaggedSession}
              weakestTaggedSession={sessionAnalysis.weakestTaggedSession}
              compact
              statsHref="/app/stats?tab=summary"
            />
          </DashboardCard>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]" aria-label="Behavior insights and weekly review">
        <DashboardCard
          eyebrow="Behavior insights"
          title="Understand what works"
          description="Short reads from mood, discipline, and tags on this account."
        >
          {behaviorInsightsResult.showEmptyState ? (
            <InnerPanel className="px-4 py-6 text-sm text-zinc-500">
              <p>{behaviorInsightsResult.emptyMessage}</p>
              {behaviorInsightsResult.disciplineDataNote ? (
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
                  {behaviorInsightsResult.disciplineDataNote}
                </p>
              ) : null}
              <Link href="/app/journal#add" className="mt-3 inline-flex text-[12px] text-[oklch(0.78_0.11_252)] hover:underline">
                Log a trading day
              </Link>
            </InnerPanel>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {behaviorInsightsResult.disciplineDataNote ? (
                <p className="sm:col-span-2 text-[12px] leading-relaxed text-zinc-500">
                  {behaviorInsightsResult.disciplineDataNote}
                </p>
              ) : null}
              {behaviorInsightsResult.insights.map((insight) => (
                <InsightMetricCard
                  key={insight.title}
                  title={insight.title}
                  value={insightHeadline(insight)}
                  detail={insight.detail}
                  variant={
                    insight.detail.includes("lifts") || insight.title.toLowerCase().includes("best")
                      ? "positive"
                      : insight.title.toLowerCase().includes("watch") || insight.title.toLowerCase().includes("mistake")
                        ? "negative"
                        : "default"
                  }
                />
              ))}
            </div>
          )}
        </DashboardCard>
        <DashboardCard eyebrow="Weekly review" title="Current week">
          <div className="space-y-3">
            <InnerPanel className="px-4 py-3.5">
              <p className="text-[11px] font-medium text-zinc-500">Status</p>
              <p className="mt-1.5 text-[13px] text-zinc-100">
                {weeklyReviewStatus.status === "saved"
                  ? "Reflection saved"
                  : weeklyReviewStatus.status === "set_focus"
                    ? "Set next week's focus"
                    : "Review ready"}
              </p>
            </InnerPanel>
            <InnerPanel className="px-4 py-3.5">
              <p className="text-[11px] font-medium text-zinc-500">Next focus</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">
                {weeklyReviewStatus.nextFocus ?? "Not set yet."}
              </p>
            </InnerPanel>
            <Link
              href="/app/journal#weekly-review"
              className={cn(
                appInnerPanel,
                "inline-flex h-9 items-center justify-center px-3 text-[12px] text-zinc-200 transition hover:bg-white/[0.04]",
              )}
            >
              Close the week
            </Link>
          </div>
        </DashboardCard>
      </section>

      <section aria-label="Quick actions">
        <DashboardCard title="Quick actions" description={`Signed in as ${email}`}>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { href: "/app/journal#add", label: "Add trading day", icon: NotebookPen },
              { href: "/app/calendar", label: "Open calendar", icon: CalendarDays },
              { href: "/app/stats", label: "View stats", icon: BarChart3 },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                  appInnerPanel,
                  "group flex items-center justify-between px-4 py-3 text-sm text-zinc-200 transition hover:border-white/[0.12] hover:bg-white/[0.04]",
                )}
              >
                <span>{action.label}</span>
                <action.icon className="size-4 text-zinc-400 transition group-hover:text-zinc-200" strokeWidth={1.75} />
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/app/settings/billing"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[oklch(0.78_0.11_252)]"
            >
              Plan & access
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}
