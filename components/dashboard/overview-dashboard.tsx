"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, CalendarDays, NotebookPen } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { DashboardCard } from "@/components/app/dashboard-card";
import { PageHeader } from "@/components/app/page-header";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { buildDayAgg, signedMoney } from "@/lib/user-data/journal-metrics";
import { getBehaviorInsights, getOverviewStats } from "@/lib/user-data/overview-stats";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
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

function moneyOrDash(value: number | null, currency: string): string {
  return value === null || !Number.isFinite(value) ? "—" : signedMoney(value, currency);
}

function percentOrDash(value: number | null): string {
  return value === null || !Number.isFinite(value) ? "—" : `${Math.round(value)}%`;
}

function formatStreakLabel(raw: string): string {
  if (raw.includes("green")) {
    return raw.replace(/(\d+)\s+green\s+day(s?)/i, "Green streak · $1 day$2");
  }
  if (raw.includes("red")) {
    return raw.replace(/(\d+)\s+red\s+day(s?)/i, "Red streak · $1 day$2");
  }
  return raw;
}

export function OverviewDashboard({ userId, email, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const [weeklyReviewStatus, setWeeklyReviewStatus] = useState<{
    status: "review_ready" | "saved" | "set_focus";
    nextFocus: string | null;
  }>({ status: "review_ready", nextFocus: null });

  const dayAgg = useMemo(() => buildDayAgg(data.journal), [data.journal]);
  const overviewStats = useMemo(
    () =>
      getOverviewStats({
        entries: data.journal,
        activeAccountId,
        currency: displayCurrency,
      }),
    [data.journal, activeAccountId, displayCurrency],
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
        const checks = [row.followedPlan, row.respectedStop, row.noRevengeTrade];
        const disciplineScore = checks.filter(Boolean).length;
        return {
          id: row.id,
          dayLabel: formatDayLabel(row.entryDate ?? (row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : "1970-01-01")),
          pnl: parsePnlAmount(row.r) ?? 0,
          mood: row.moodState ?? "Calm",
          discipline: `${disciplineScore}/3`,
        };
      });
  }, [data.journal]);

  const behaviorInsights = useMemo(
    () =>
      getBehaviorInsights({
        entries: data.journal,
        activeAccountId,
        currency: displayCurrency,
      }),
    [data.journal, activeAccountId, displayCurrency],
  );

  const hasEntries = data.journal.length > 0;
  const noLosingDays = overviewStats.losingDays === 0;
  const lossMetricLabel = noLosingDays ? "Smallest green day" : "Worst day";
  const lossMetricValue = noLosingDays ? overviewStats.smallestGreenDay : overviewStats.worstLossDay;
  const secondaryKpis = [
    { label: "Traded days", value: hasEntries ? String(overviewStats.tradedDays) : "—", tone: 0 },
    {
      label: "Average day",
      value: hasEntries ? moneyOrDash(overviewStats.averageDay, displayCurrency) : "—",
      tone: hasEntries ? (overviewStats.averageDay ?? 0) : 0,
    },
    {
      label: "Best day",
      value: hasEntries ? moneyOrDash(overviewStats.bestDay, displayCurrency) : "—",
      tone: hasEntries ? (overviewStats.bestDay ?? 0) : 0,
    },
    {
      label: lossMetricLabel,
      value: hasEntries ? moneyOrDash(lossMetricValue, displayCurrency) : "—",
      tone: hasEntries ? (lossMetricValue ?? 0) : 0,
    },
    {
      label: "Avg green day",
      value: hasEntries ? moneyOrDash(overviewStats.avgGreenDay, displayCurrency) : "—",
      tone: hasEntries ? (overviewStats.avgGreenDay ?? 0) : 0,
    },
    {
      label: "Avg red day",
      value: hasEntries ? moneyOrDash(overviewStats.avgRedDay, displayCurrency) : "—",
      tone: hasEntries ? (overviewStats.avgRedDay ?? 0) : 0,
    },
    { label: "Green / red days", value: hasEntries ? overviewStats.greenRedSummary : "—", tone: 0 },
    {
      label: "Streak",
      value: hasEntries ? formatStreakLabel(overviewStats.streak) : "—",
      tone: hasEntries
        ? overviewStats.streak.includes("green")
          ? 1
          : overviewStats.streak.includes("red")
            ? -1
            : 0
        : 0,
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
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Blueveno"
        title="Overview"
        description="Today and this week at a glance."
        actions={
          <Link href="/app/journal#add" className={appSecondaryCta}>
            <NotebookPen className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
            Add trading day
          </Link>
        }
      />

      <section className="space-y-4" aria-label="Overview KPIs">
        {!ready ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[7.25rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "Week P&L",
                  value: hasEntries ? signedMoney(overviewStats.weekPnl, displayCurrency) : "—",
                  tone: hasEntries ? overviewStats.weekPnl : 0,
                },
                {
                  label: "Month P&L",
                  value: hasEntries ? signedMoney(overviewStats.monthPnl, displayCurrency) : "—",
                  tone: hasEntries ? overviewStats.monthPnl : 0,
                },
                { label: "Win rate", value: hasEntries ? percentOrDash(overviewStats.winRate) : "—", tone: 0 },
                { label: "Discipline score", value: hasEntries ? percentOrDash(overviewStats.disciplineScore) : "—", tone: 0 },
              ].map((card) => (
                <div
                  key={card.label}
                  className={cn(
                    "rounded-2xl border border-[oklch(0.58_0.1_252/0.3)] bg-[linear-gradient(155deg,oklch(0.2_0.05_258/0.95),oklch(0.105_0.03_264/0.95))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08),0_28px_50px_-32px_oklch(0.5_0.14_252/0.6)] ring-1 ring-[oklch(0.6_0.1_252/0.16)]",
                  )}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">{card.label}</p>
                  <p
                    className={cn(
                      "font-display mt-2 text-[1.45rem] tabular-nums leading-none tracking-[-0.03em] sm:text-[1.65rem]",
                      card.tone > 0 && "text-emerald-200",
                      card.tone < 0 && "text-rose-200",
                      card.tone === 0 && "text-zinc-50",
                    )}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              {secondaryKpis.map((card) => (
                <div
                  key={card.label}
                  className={cn(
                    "rounded-xl border border-white/[0.08] bg-[linear-gradient(160deg,oklch(0.13_0.03_262/0.94),oklch(0.09_0.025_266/0.94))] px-3.5 py-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]",
                    card.label === "Streak" &&
                      (card.tone > 0
                        ? "border-emerald-400/25"
                        : card.tone < 0
                          ? "border-rose-400/25"
                          : "border-[oklch(0.58_0.1_252/0.25)]"),
                  )}
                >
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{card.label}</p>
                  <p
                    className={cn(
                      "mt-1.5 text-[13px] font-semibold tabular-nums",
                      card.tone > 0 && "text-emerald-200",
                      card.tone < 0 && "text-rose-200",
                      card.tone === 0 && "text-zinc-200",
                    )}
                  >
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]" aria-label="At a glance details">
        <DashboardCard
          eyebrow="Mini calendar preview"
          title="Current week"
          description="Outcome color and total in one line."
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {weekCells.map((cell) => {
              const pnl = cell.keys.reduce((acc, key) => acc + (dayAggMap.get(key) ?? 0), 0);
              const tone =
                pnl > 0
                  ? "border-emerald-400/30 bg-emerald-500/[0.14] text-emerald-100"
                  : pnl < 0
                    ? "border-rose-400/30 bg-rose-500/[0.13] text-rose-100"
                    : "border-white/[0.1] bg-white/[0.03] text-zinc-300";
              return (
                <div key={cell.key} className={cn("rounded-xl border p-2 text-center sm:p-2.5", tone)}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-80">{cell.label}</p>
                  <p className="mt-1 text-[12px] font-semibold tabular-nums sm:text-sm">{cell.day}</p>
                  <p className="mt-1 text-[10px] tabular-nums sm:text-[11px]">{pnl === 0 ? "—" : signedMoney(pnl, displayCurrency)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Weekly total</p>
            <p
              className={cn(
                "font-display text-lg tabular-nums tracking-[-0.02em]",
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
                      item.pnl > 0 && "text-emerald-200",
                      item.pnl < 0 && "text-rose-200",
                      item.pnl === 0 && "text-zinc-300",
                    )}
                  >
                    {signedMoney(item.pnl, displayCurrency)}
                  </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:contents">
                  <p className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[12px] text-zinc-300">
                    {item.mood}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">{item.discipline}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]" aria-label="Behavior insights and weekly review">
        <DashboardCard
          eyebrow="Behavior insights"
          title="Patterns from your entries"
          description="Based on the account you're viewing."
        >
          {behaviorInsights.length === 0 ? (
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-6 text-sm text-zinc-500">
              <p>Add a few trading days to unlock performance and behavior patterns.</p>
              <Link href="/app/journal#add" className="mt-3 inline-flex text-[12px] text-[oklch(0.78_0.11_252)] hover:underline">
                Log the day
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {behaviorInsights.map((insight) => (
                <div
                  key={insight.title}
                  className="rounded-xl border border-[oklch(0.58_0.1_252/0.2)] bg-[linear-gradient(160deg,oklch(0.15_0.04_260/0.85),oklch(0.095_0.03_264/0.9))] px-4 py-3.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]"
                >
                  <p className="text-[13px] font-medium text-zinc-100">{insight.title}</p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">{insight.detail}</p>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
        <DashboardCard eyebrow="Weekly review" title="Current week">
          <div className="space-y-3">
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Status</p>
              <p className="mt-1.5 text-[13px] text-zinc-100">
                {weeklyReviewStatus.status === "saved"
                  ? "Reflection saved"
                  : weeklyReviewStatus.status === "set_focus"
                    ? "Set next week's focus"
                    : "Review ready"}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Next focus</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-300">
                {weeklyReviewStatus.nextFocus ?? "Not set yet."}
              </p>
            </div>
            <Link
              href="/app/journal#weekly-review"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.03] px-3 text-[12px] text-zinc-200 hover:bg-white/[0.06]"
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
                className="group flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.06]"
              >
                <span>{action.label}</span>
                <action.icon className="size-4 text-zinc-400 transition group-hover:text-zinc-200" strokeWidth={1.75} />
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/app/settings/billing"
              className="inline-flex items-center gap-1 text-[12px] font-medium uppercase tracking-[0.14em] text-[oklch(0.78_0.11_252)]"
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
