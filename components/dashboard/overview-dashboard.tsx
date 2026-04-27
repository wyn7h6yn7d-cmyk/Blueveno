"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, BarChart3, CalendarDays, NotebookPen } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { DashboardCard } from "@/components/app/dashboard-card";
import { PageHeader } from "@/components/app/page-header";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { buildDayAgg, computeJournalSummary, signedMoney } from "@/lib/user-data/journal-metrics";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { appSecondaryCta } from "@/lib/ui/app-surface";
import { parsePnlAmount } from "@/lib/user-data/kpi";

type Props = {
  userId: string;
  email: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

function formatDayLabel(dayKey: string) {
  const date = new Date(`${dayKey}T00:00:00`);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(date);
}

export function OverviewDashboard({ userId, email, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });

  const dayAgg = useMemo(() => buildDayAgg(data.journal), [data.journal]);
  const summary = useMemo(() => computeJournalSummary(dayAgg), [dayAgg]);
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
      const key = day.toISOString().slice(0, 10);
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

  const weekGreenRed = useMemo(() => {
    let green = 0;
    let red = 0;
    for (const cell of weekCells) {
      const pnl = cell.keys.reduce((acc, key) => acc + (dayAggMap.get(key) ?? 0), 0);
      if (pnl > 0) green += 1;
      if (pnl < 0) red += 1;
    }
    return `${green} green · ${red} red`;
  }, [dayAggMap, weekCells]);

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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="This week snapshot">
        {!ready ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[7.25rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]"
              />
            ))}
          </>
        ) : (
          [
            { label: "Week", value: signedMoney(summary.weekPnl, displayCurrency), tone: summary.weekPnl },
            { label: "Month", value: signedMoney(summary.monthPnl, displayCurrency), tone: summary.monthPnl },
            { label: "Green · red days", value: weekGreenRed, tone: 0 },
            { label: "Streak", value: summary.streak, tone: 0 },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(155deg,oklch(0.14_0.03_262/0.96),oklch(0.095_0.028_264/0.95))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] ring-1 ring-white/[0.035]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">{card.label}</p>
              <p
                className={cn(
                  "font-display mt-3 text-[1.5rem] tabular-nums leading-none tracking-[-0.03em] sm:text-[1.65rem]",
                  card.tone > 0 && "text-emerald-200",
                  card.tone < 0 && "text-rose-200",
                  card.tone === 0 && "text-zinc-50",
                )}
              >
                {card.value}
              </p>
            </div>
          ))
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]" aria-label="At a glance details">
        <DashboardCard
          eyebrow="Mini calendar preview"
          title="Current week"
          description="Outcome color and total in one line."
        >
          <div className="grid grid-cols-6 gap-2">
            {weekCells.map((cell) => {
              const pnl = cell.keys.reduce((acc, key) => acc + (dayAggMap.get(key) ?? 0), 0);
              const tone =
                pnl > 0
                  ? "border-emerald-400/30 bg-emerald-500/[0.14] text-emerald-100"
                  : pnl < 0
                    ? "border-rose-400/30 bg-rose-500/[0.13] text-rose-100"
                    : "border-white/[0.1] bg-white/[0.03] text-zinc-300";
              return (
                <div key={cell.key} className={cn("rounded-xl border p-2.5 text-center", tone)}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] opacity-80">{cell.label}</p>
                  <p className="mt-1 text-sm font-semibold tabular-nums">{cell.day}</p>
                  <p className="mt-1 text-[11px] tabular-nums">{pnl === 0 ? "—" : signedMoney(pnl, displayCurrency)}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Weekly total</p>
            <p
              className={cn(
                "font-display text-lg tabular-nums tracking-[-0.02em]",
                weekTotal > 0 && "text-emerald-200",
                weekTotal < 0 && "text-rose-200",
                weekTotal === 0 && "text-zinc-100",
              )}
            >
              {signedMoney(weekTotal, displayCurrency)}
            </p>
          </div>
        </DashboardCard>

        <DashboardCard eyebrow="Recent activity" title="Latest journal days" contentClassName="p-0">
          {recentActivity.length === 0 ? (
            <div className="px-5 py-8 text-sm text-zinc-500 sm:px-6">
              No trading days yet. Add your first day to start building the calendar.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentActivity.map((item) => (
                <div key={item.id} className="grid grid-cols-[1.2fr_auto_auto_auto] items-center gap-3 px-4 py-3.5 text-sm sm:px-5">
                  <p className="truncate text-zinc-200">{item.dayLabel}</p>
                  <p
                    className={cn(
                      "text-right tabular-nums",
                      item.pnl > 0 && "text-emerald-200",
                      item.pnl < 0 && "text-rose-200",
                      item.pnl === 0 && "text-zinc-300",
                    )}
                  >
                    {signedMoney(item.pnl, displayCurrency)}
                  </p>
                  <p className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[12px] text-zinc-300">
                    {item.mood}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-400">{item.discipline}</p>
                </div>
              ))}
            </div>
          )}
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
              Plan & billing
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}
