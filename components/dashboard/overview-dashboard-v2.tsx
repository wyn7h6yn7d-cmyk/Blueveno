"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  NotebookPen,
  Shield,
  Target,
  TrendingUp,
} from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { OverviewAccountSelect } from "@/components/dashboard/overview-account-select";
import { OverviewOnboardingChecklist } from "@/components/dashboard/overview-onboarding-checklist";
import { OverviewPerformancePanel } from "@/components/dashboard/overview-performance-panel";
import { OverviewRecentEntriesList } from "@/components/dashboard/overview-recent-entries-list";
import { OverviewWeekPulse } from "@/components/dashboard/overview-week-pulse";
import { OverviewWeekPreview, type WeekPreviewCell } from "@/components/dashboard/overview-week-preview";
import { SectionCard } from "@/components/v2/cards";
import {
  KpiGrid,
  LabelValueRow,
  MetricCard,
  StatStrip,
  StatusPill,
} from "@/components/v2";
import { PageHeader } from "@/components/v2/layout";
import { EmptyStatePanel } from "@/components/v2/states/empty-state-panel";
import {
  buildCumulativeChartData,
  buildDailyBarChartData,
  getAvgTradePnl,
  getDominantMood,
  getFollowedPlanPercent,
} from "@/lib/dashboard/overview-v2-metrics";
import { useAppToast } from "@/components/app/app-toast-provider";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { getOverviewOnboardingChecklist } from "@/lib/onboarding/overview-checklist";
import {
  dismissOverviewOnboarding,
  loadOverviewOnboardingDismissed,
  readOverviewOnboardingDismissedLocal,
} from "@/lib/onboarding/overview-onboarding-preference";
import { buildDayAgg, signedMoney } from "@/lib/user-data/journal-metrics";
import { getDisciplineDisplay, summarizeDisciplineCoverage } from "@/lib/user-data/discipline-stats";
import { entryDisciplineFraction } from "@/lib/user-data/stats-display";
import { getBehaviorInsights, getOverviewStats } from "@/lib/user-data/overview-stats";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { createClient } from "@/lib/supabase/client";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import {
  overviewCard,
  overviewHeroAccent,
  overviewKpi,
  overviewKpiIcon,
  overviewKpiIconLead,
  overviewKpiLabel,
  overviewKpiLead,
  overviewKpiValueNeutral,
  overviewPageGlow,
  overviewPageGradient,
  overviewPageShell,
  overviewPerformanceGlow,
} from "@/lib/ui/overview-surface";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
  initialOnboardingDismissed?: boolean;
  userTimezone?: string | null;
};

type RecentEntryRow = {
  id: string;
  symbol: string;
  dateLabel: string;
  pnl: number | null;
  mood: string | null;
  tag: string | null;
  discipline: string;
};

type WeeklyReviewState = {
  status: "review_ready" | "saved" | "set_focus";
  nextFocus: string | null;
  nextRule: string | null;
  confidence: number | null;
  whatWorked: string | null;
  whatSlipped: string | null;
};

function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayLabel(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

function percentOrDash(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "—" : `${Math.round(value)}%`;
}

function formatProfitFactor(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

function accessStatusLabel(state: string, isAdmin: boolean): { label: string; tone: "active" | "info" | "warning" | "neutral" } {
  if (isAdmin) return { label: "Admin", tone: "warning" };
  if (state === "premium_active") return { label: "Premium", tone: "active" };
  if (state === "trial_active") return { label: "Trial", tone: "info" };
  return { label: "Read-only", tone: "neutral" };
}

export function OverviewDashboardV2({
  userId,
  email,
  initialWorkspace,
  initialOnboardingDismissed = false,
  userTimezone,
}: Props) {
  const router = useRouter();
  const access = useAccess();
  const { displayCurrency } = access;
  const toast = useAppToast();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const { accounts, loading: accountsLoading } = useTradingAccountsWorkspace();
  const [onboardingDismissed, setOnboardingDismissed] = useState(initialOnboardingDismissed);

  useEffect(() => {
    if (!readOverviewOnboardingDismissedLocal(userId)) return;
    queueMicrotask(() => setOnboardingDismissed(true));
  }, [userId]);
  const [onboardingDismissBusy, setOnboardingDismissBusy] = useState(false);
  const onboardingDismissInFlightRef = useRef(false);
  const [weeklyReview, setWeeklyReview] = useState<WeeklyReviewState>({
    status: "review_ready",
    nextFocus: null,
    nextRule: null,
    confidence: null,
    whatWorked: null,
    whatSlipped: null,
  });

  const dayAgg = useMemo(() => buildDayAgg(data.journal), [data.journal]);
  const dayAggMap = useMemo(() => new Map(dayAgg.map((item) => [item.key, item.pnl])), [dayAgg]);

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

  const [weekCells, setWeekCells] = useState<WeekPreviewCell[]>([]);

  useEffect(() => {
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
    const cells: WeekPreviewCell[] = [
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
    queueMicrotask(() => setWeekCells(cells));
  }, []);

  const weekTotal = useMemo(
    () => weekCells.reduce((sum, cell) => sum + cell.keys.reduce((acc, key) => acc + (dayAggMap.get(key) ?? 0), 0), 0),
    [dayAggMap, weekCells],
  );

  const disciplineCoverage = useMemo(() => summarizeDisciplineCoverage(data.journal), [data.journal]);
  const disciplineDisplay = useMemo(() => getDisciplineDisplay(disciplineCoverage), [disciplineCoverage]);
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

  const dominantMood = useMemo(() => getDominantMood(data.journal), [data.journal]);
  const followedPlanPct = useMemo(() => getFollowedPlanPercent(data.journal), [data.journal]);
  const avgTrade = useMemo(() => getAvgTradePnl(data.journal), [data.journal]);

  const cumulativeData = useMemo(() => buildCumulativeChartData(dayAgg), [dayAgg]);
  const dailyBarData = useMemo(() => buildDailyBarChartData(dayAgg, 14), [dayAgg]);

  const recentEntries = useMemo((): RecentEntryRow[] => {
    return [...data.journal]
      .sort((a, b) => {
        const aDate = a.entryDate ?? a.createdAt ?? "";
        const bDate = b.entryDate ?? b.createdAt ?? "";
        return bDate.localeCompare(aDate);
      })
      .slice(0, 5)
      .map((row) => ({
        id: row.id,
        symbol: row.sym?.trim() || "—",
        dateLabel: formatDayLabel(row.entryDate ?? row.createdAt?.slice(0, 10) ?? ""),
        pnl: parsePnlAmount(row.r),
        mood: row.moodState?.trim() || null,
        tag: row.tag?.trim() || null,
        discipline: entryDisciplineFraction(row),
      }))
      .filter((row) => row.dateLabel.length > 0);
  }, [data.journal]);

  const hasEntries = data.journal.length > 0;
  const accessBadge = accessStatusLabel(access.state, access.isAdmin);

  const onboarding = useMemo(
    () =>
      getOverviewOnboardingChecklist({
        accountCount: accounts.length,
        entryCount: data.journal.length,
        tradedDays: overviewStats.tradedDays,
        dismissed: onboardingDismissed,
      }),
    [accounts.length, data.journal.length, overviewStats.tradedDays, onboardingDismissed],
  );

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      const dismissed = await loadOverviewOnboardingDismissed(supabase, userId);
      if (!cancelled) setOnboardingDismissed((prev) => prev || dismissed);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

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
        .select("what_worked, what_slipped, next_week_focus, next_week_rule, confidence_score")
        .eq("user_id", userId)
        .eq("account_id", activeAccountId)
        .eq("week_start", weekStart)
        .maybeSingle();
      if (cancelled) return;
      const worked = String(row?.what_worked ?? "").trim();
      const slipped = String(row?.what_slipped ?? "").trim();
      const focus = String(row?.next_week_focus ?? "").trim();
      const rule = String(row?.next_week_rule ?? "").trim();
      const confidence = row?.confidence_score ?? null;
      if (worked || slipped || focus || rule) {
        setWeeklyReview({
          status: focus ? "saved" : "set_focus",
          nextFocus: focus || null,
          nextRule: rule || null,
          confidence: typeof confidence === "number" ? confidence : null,
          whatWorked: worked || null,
          whatSlipped: slipped || null,
        });
      } else {
        setWeeklyReview({
          status: "review_ready",
          nextFocus: null,
          nextRule: null,
          confidence: null,
          whatWorked: null,
          whatSlipped: null,
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, activeAccountId, data.journal.length]);

  const dismissOnboarding = async () => {
    if (!userId || onboardingDismissed || onboardingDismissBusy || onboardingDismissInFlightRef.current) return;
    onboardingDismissInFlightRef.current = true;
    setOnboardingDismissBusy(true);
    const supabase = createClient();
    const result = await dismissOverviewOnboarding(supabase, userId);
    onboardingDismissInFlightRef.current = false;
    setOnboardingDismissBusy(false);
    if (!result.ok) {
      toast.error("Could not hide the tutorial. Try again.");
      return;
    }
    setOnboardingDismissed(true);
  };

  const topStrength = behaviorInsightsResult.insights.find(
    (i) => i.detail.includes("lifts") || i.title.toLowerCase().includes("best"),
  );
  const topMistake = behaviorInsightsResult.insights.find(
    (i) => i.title.toLowerCase().includes("watch") || i.title.toLowerCase().includes("mistake"),
  );

  const behaviorInsight = useMemo(() => {
    if (weeklyReview.whatWorked) return weeklyReview.whatWorked;
    if (topStrength) return topStrength.detail;
    if (weeklyReview.whatSlipped) return weeklyReview.whatSlipped;
    if (topMistake) return topMistake.detail;
    const first = behaviorInsightsResult.insights[0];
    return first?.detail ?? null;
  }, [
    weeklyReview.whatWorked,
    weeklyReview.whatSlipped,
    topStrength,
    topMistake,
    behaviorInsightsResult.insights,
  ]);

  const kpiMetricProps = {
    labelClassName: overviewKpiLabel,
    iconWrapClassName: overviewKpiIcon,
  };

  return (
    <div className={overviewPageShell}>
      <div className={overviewPageGradient} aria-hidden />
      <div className={overviewPageGlow} aria-hidden />
      <div className="relative space-y-5">
        <div className={overviewHeroAccent} aria-hidden />
        <PageHeader
          variant="signature"
          title="Overview"
          description="Your trading control center — performance, discipline, and weekly focus."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <OverviewAccountSelect />
            <StatusPill tone={accessBadge.tone}>{accessBadge.label}</StatusPill>
          </div>
        }
        actions={
          <>
            <Link href="/app/journal?tab=add" className={appPrimaryCta}>
              <NotebookPen className="mr-2 size-4" strokeWidth={1.75} />
              New entry
            </Link>
            <Link href="/app/calendar" className={appSecondaryCta}>
              <CalendarDays className="mr-1.5 size-3.5" />
              Calendar
            </Link>
            <Link href="/app/stats" className={appSecondaryCta}>
              <BarChart3 className="mr-1.5 size-3.5" />
              Stats
            </Link>
          </>
        }
      />

      {ready && !accountsLoading && onboarding.show ? (
        <OverviewOnboardingChecklist
          items={onboarding.items}
          onDismiss={() => void dismissOnboarding()}
          dismissBusy={onboardingDismissBusy}
        />
      ) : null}

        <section aria-label="Key metrics" className="relative">
          <KpiGrid columns={6}>
            <MetricCard
              className={overviewKpiLead}
              label="Net P&L"
              value={hasEntries ? signedMoney(overviewStats.monthPnl, displayCurrency) : "—"}
              hint="This month"
              delta={hasEntries ? signedMoney(overviewStats.weekPnl, displayCurrency) : undefined}
              deltaDirection={
                overviewStats.weekPnl > 0 ? "up" : overviewStats.weekPnl < 0 ? "down" : "flat"
              }
              deltaLabel="this week"
              tone={overviewStats.monthPnl > 0 ? "positive" : overviewStats.monthPnl < 0 ? "negative" : "neutral"}
              icon={TrendingUp}
              iconWrapClassName={overviewKpiIconLead}
              labelClassName={overviewKpiLabel}
              loading={!ready}
            />
            <MetricCard
              className={overviewKpi}
              label="Win rate"
              value={hasEntries ? percentOrDash(overviewStats.winRate) : "—"}
              icon={Target}
              valueClassName={overviewKpiValueNeutral}
              loading={!ready}
              {...kpiMetricProps}
            />
            <MetricCard
              className={overviewKpi}
              label="Avg day"
              value={hasEntries && overviewStats.averageDay !== null ? signedMoney(overviewStats.averageDay, displayCurrency) : "—"}
              hint={
                avgTrade !== null
                  ? `Avg trade ${signedMoney(avgTrade, displayCurrency)}`
                  : undefined
              }
              valueClassName={overviewKpiValueNeutral}
              loading={!ready}
              {...kpiMetricProps}
            />
            <MetricCard
              className={overviewKpi}
              label="Best day"
              value={
                hasEntries && overviewStats.bestDay !== null
                  ? signedMoney(overviewStats.bestDay, displayCurrency)
                  : "—"
              }
              tone="positive"
              loading={!ready}
              {...kpiMetricProps}
            />
            <MetricCard
              className={overviewKpi}
              label="Discipline"
              value={hasEntries ? disciplineDisplay.value : "—"}
              hint={disciplineDisplay.hint}
              icon={Shield}
              valueClassName={overviewKpiValueNeutral}
              loading={!ready}
              {...kpiMetricProps}
            />
            <MetricCard
              className={overviewKpi}
              label="Profit factor"
              value={hasEntries ? formatProfitFactor(overviewStats.profitFactor) : "—"}
              hint={hasEntries ? `${data.journal.length} trades` : undefined}
              tone={
                overviewStats.profitFactor !== null && overviewStats.profitFactor >= 1
                  ? "positive"
                  : overviewStats.profitFactor !== null
                    ? "negative"
                    : "neutral"
              }
              loading={!ready}
              {...kpiMetricProps}
            />
          </KpiGrid>
        </section>

        <section className="grid gap-4 lg:grid-cols-12" aria-label="Performance and week pulse">
          <div className="relative lg:col-span-8">
            <div className={overviewPerformanceGlow} aria-hidden />
            <OverviewPerformancePanel
              cumulativeData={cumulativeData}
              dailyBarData={dailyBarData}
              loading={!ready}
            />
          </div>
          <div className="lg:col-span-4">
            <OverviewWeekPulse
              winningDays={overviewStats.winningDays}
              losingDays={overviewStats.losingDays}
              streak={hasEntries ? overviewStats.streak : "—"}
              disciplineValue={hasEntries ? disciplineDisplay.value : "—"}
              reviewStatus={weeklyReview.status}
              loading={!ready}
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-12" aria-label="Week and recent activity">
          <div className="lg:col-span-7">
            {weekCells.length > 0 ? (
              <OverviewWeekPreview
                weekCells={weekCells}
                dayPnlMap={dayAggMap}
                weekTotal={weekTotal}
                hasEntries={hasEntries}
                displayCurrency={displayCurrency}
                winningDays={overviewStats.winningDays}
                losingDays={overviewStats.losingDays}
              />
            ) : (
              <SectionCard
                eyebrow="Calendar"
                title="Current week"
                description="Loading week view…"
                className={overviewCard}
              >
                <div className="h-32 animate-pulse rounded-xl border border-white/[0.08] bg-white/[0.04]" />
              </SectionCard>
            )}
          </div>
          <div className="lg:col-span-5">
            <OverviewRecentEntriesList
              entries={recentEntries}
              displayCurrency={displayCurrency}
              loading={!ready}
              onOpenEntry={(id) => router.push(`/app/journal/${id}`)}
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-12" aria-label="Review and behavior">
          <div className="lg:col-span-6">
            <SectionCard
              eyebrow="Weekly review"
              title="Current week reflection"
              description="What to carry forward into next week."
              className={overviewCard}
            >
            <div className="space-y-3">
              <StatStrip
                items={[
                  {
                    id: "status",
                    label: "Status",
                    value:
                      weeklyReview.status === "saved"
                        ? "Saved"
                        : weeklyReview.status === "set_focus"
                          ? "Set focus"
                          : "Ready",
                    tone:
                      weeklyReview.status === "saved"
                        ? "positive"
                        : weeklyReview.status === "set_focus"
                          ? "caution"
                          : "neutral",
                  },
                  {
                    id: "confidence",
                    label: "Readiness",
                    value:
                      weeklyReview.confidence !== null
                        ? `${weeklyReview.confidence}/10`
                        : "—",
                    tone: "neutral",
                  },
                ]}
              />
              <LabelValueRow label="Next focus" value={weeklyReview.nextFocus ?? "Not set yet."} dense />
              <LabelValueRow label="Non-negotiable rule" value={weeklyReview.nextRule ?? "Not set yet."} dense />
              <Link
                href="/app/journal?tab=week"
                className={cn(appSecondaryCta, "inline-flex h-9 px-4 text-[13px]")}
              >
                Close the week
                <ArrowUpRight className="ml-1.5 size-3.5" />
              </Link>
            </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-6">
            <SectionCard
              eyebrow="Behavior"
              title="Behavior snapshot"
              description="Mood, plan adherence, and one signal to watch."
              className={overviewCard}
            >
            {behaviorInsightsResult.showEmptyState && !hasEntries ? (
              <EmptyStatePanel
                title="No behavior data"
                description={behaviorInsightsResult.emptyMessage}
                action={
                  <Link href="/app/journal?tab=add" className="text-[13px] text-bv-ice hover:underline">
                    Log a trading day
                  </Link>
                }
                compact
              />
            ) : (
              <div className="space-y-4">
                <StatStrip
                  items={[
                    {
                      id: "mood",
                      label: "Dominant mood",
                      value: dominantMood ?? "—",
                      tone: "neutral",
                    },
                    {
                      id: "plan",
                      label: "Followed plan",
                      value: followedPlanPct !== null ? `${followedPlanPct}%` : "—",
                      tone:
                        followedPlanPct !== null && followedPlanPct >= 70
                          ? "positive"
                          : followedPlanPct !== null && followedPlanPct < 50
                            ? "negative"
                            : "neutral",
                    },
                    {
                      id: "discipline",
                      label: "Discipline",
                      value: disciplineDisplay.value,
                      tone: "neutral",
                    },
                  ]}
                />
                {behaviorInsight ? (
                  <p className="rounded-lg border border-bv-blue-accent/18 bg-[linear-gradient(135deg,oklch(0.14_0.04_262/0.7),oklch(0.11_0.035_268/0.6))] px-3 py-2.5 text-[13px] leading-snug text-zinc-200">
                    {behaviorInsight}
                  </p>
                ) : null}
                {behaviorInsightsResult.disciplineDataNote ? (
                  <p className="text-[12px] text-zinc-500">{behaviorInsightsResult.disciplineDataNote}</p>
                ) : null}
              </div>
            )}
            </SectionCard>
          </div>
        </section>

        <p className="text-[12px] text-zinc-500">Signed in as {email}</p>
      </div>
    </div>
  );
}
