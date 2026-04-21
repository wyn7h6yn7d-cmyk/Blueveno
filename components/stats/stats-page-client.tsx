"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { computeTradingStats } from "@/lib/user-data/trading-stats";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

const outline = cn(
  buttonVariants({ variant: "outline" }),
  "h-10 min-h-10 rounded-xl border-white/[0.11] bg-white/[0.035] px-4 text-[13px] text-zinc-200 hover:bg-white/[0.07]",
);

function fmtR(n: number | null, digits = 2) {
  if (n === null) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(digits)} R`;
}

function CumulativeChart({ points }: { points: { i: number; y: number }[] }) {
  const w = 560;
  const h = 160;
  const pad = 12;
  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-[13px] text-zinc-500">
        Add a few days to see the curve.
      </div>
    );
  }
  const ys = points.map((p) => p.y);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(0, ...ys);
  const span = Math.max(maxY - minY, 1e-6);
  const n = points.length;
  const toX = (i: number) => pad + (i / Math.max(n - 1, 1)) * (w - pad * 2);
  const toY = (y: number) => pad + (1 - (y - minY) / span) * (h - pad * 2);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.y).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full max-w-full" role="img" aria-label="Cumulative P and L">
      <defs>
        <linearGradient id="cumFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.14 252)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.12 0.04 266)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${toX(n - 1)} ${h - pad} L ${toX(0)} ${h - pad} Z`}
        fill="url(#cumFill)"
        className="opacity-90"
      />
      <path d={d} fill="none" stroke="oklch(0.72 0.12 250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DailyBars({ bars }: { bars: { date: string; pnl: number }[] }) {
  const w = 560;
  const h = 140;
  const pad = 16;
  if (bars.length === 0) {
    return null;
  }
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.pnl)), 1e-6);
  const inner = w - pad * 2;
  const barW = Math.min(12, inner / Math.max(bars.length, 1) - 2);
  const step = inner / Math.max(bars.length, 1);
  const midY = h / 2;
  const maxH = midY - pad;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-36 w-full max-w-full" role="img" aria-label="Daily P and L bars">
      <line x1={pad} y1={midY} x2={w - pad} y2={midY} stroke="oklch(0.35 0.02 260)" strokeOpacity="0.45" strokeWidth="1" />
      {bars.map((b, i) => {
        const x = pad + i * step + (step - barW) / 2;
        const bh = (Math.abs(b.pnl) / maxAbs) * maxH;
        const fill = b.pnl >= 0 ? "oklch(0.62 0.14 155)" : "oklch(0.58 0.16 15)";
        if (b.pnl >= 0) {
          return (
            <rect key={b.date} x={x} y={midY - bh} width={barW} height={Math.max(bh, 1)} rx={2} fill={fill} opacity={0.88} />
          );
        }
        return <rect key={b.date} x={x} y={midY} width={barW} height={Math.max(bh, 1)} rx={2} fill={fill} opacity={0.88} />;
      })}
    </svg>
  );
}

function WeeklyTrend({ weekly }: { weekly: { label: string; total: number }[] }) {
  if (weekly.length === 0) return null;
  const last = weekly.slice(-8);
  const maxAbs = Math.max(...last.map((w) => Math.abs(w.total)), 1e-6);
  return (
    <div className="flex flex-wrap gap-3">
      {last.map((w) => (
        <div
          key={w.label}
          className="flex min-w-[5.5rem] flex-1 flex-col rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Week</p>
          <p className="mt-1 font-mono text-[11px] text-zinc-400">{w.label}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn("h-full rounded-full", w.total >= 0 ? "bg-emerald-400/80" : "bg-rose-400/80")}
              style={{ width: `${(Math.abs(w.total) / maxAbs) * 100}%` }}
            />
          </div>
          <p className={cn("mt-2 font-display text-sm tabular-nums", w.total >= 0 ? "text-emerald-200" : "text-rose-200")}>
            {fmtR(w.total, 2)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatsPageClient({ userId, initialWorkspace }: Props) {
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });
  const stats = useMemo(() => computeTradingStats(data.journal), [data.journal]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Performance"
        title="Stats"
        description="A calm read on your trading rhythm — aligned with the calendar, not a separate analytics product."
        actions={
          <Link href="/app/calendar" className={outline}>
            <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
            Calendar
          </Link>
        }
      />

      {!ready ? (
        <div className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      ) : data.journal.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No data yet"
          description="Log trading days in your journal — stats build automatically from your R values."
          action={
            <Link href="/app/journal" className={cn(outline, "inline-flex items-center gap-1")}>
              Go to journal
              <ArrowUpRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardCard eyebrow="Summary" title="Win / loss days" description="Days with positive vs negative P&amp;L.">
              <p className="font-display text-3xl tabular-nums text-zinc-50">
                {stats.winDays}
                <span className="text-zinc-600"> / </span>
                {stats.lossDays}
              </p>
              {stats.flatDays > 0 ? (
                <p className="mt-2 text-[13px] text-zinc-500">{stats.flatDays} flat day(s)</p>
              ) : null}
            </DashboardCard>
            <DashboardCard eyebrow="Extremes" title="Best & worst day" description="By total R for that calendar day.">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Best</p>
                  <p className="mt-1 font-display text-xl text-emerald-200">
                    {stats.bestDay ? fmtR(stats.bestDay.pnl, 2) : "—"}
                  </p>
                  <p className="text-[12px] text-zinc-500">{stats.bestDay?.date ?? ""}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Worst</p>
                  <p className="mt-1 font-display text-xl text-rose-200">
                    {stats.worstDay ? fmtR(stats.worstDay.pnl, 2) : "—"}
                  </p>
                  <p className="text-[12px] text-zinc-500">{stats.worstDay?.date ?? ""}</p>
                </div>
              </div>
            </DashboardCard>
            <DashboardCard eyebrow="Rhythm" title="Streak" description="From most recent trading day backward.">
              <p className="font-display text-2xl text-zinc-50">{stats.streakLabel}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Avg green day</p>
                  <p className="mt-1 tabular-nums text-emerald-200">{stats.avgGreenDay != null ? fmtR(stats.avgGreenDay, 2) : "—"}</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Avg red day</p>
                  <p className="mt-1 tabular-nums text-rose-200">{stats.avgRedDay != null ? fmtR(stats.avgRedDay, 2) : "—"}</p>
                </div>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard
            eyebrow="Trend"
            title="Cumulative P&amp;L"
            description="Running sum of daily R — oldest to newest."
            className="overflow-hidden"
          >
            <CumulativeChart points={stats.cumulative} />
          </DashboardCard>

          <DashboardCard eyebrow="Days" title="Daily P&amp;L" description="One bar per calendar day.">
            <DailyBars bars={stats.dailyBars} />
          </DashboardCard>

          <DashboardCard eyebrow="Weeks" title="Weekly totals" description="Recent weeks at a glance.">
            <WeeklyTrend weekly={stats.weekly} />
          </DashboardCard>

          {stats.monthly.length >= 2 ? (
            <DashboardCard eyebrow="Months" title="Monthly blocks" description="When you have enough history, months tell the story.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.monthly.map((m) => (
                  <div
                    key={m.key}
                    className="rounded-xl border border-white/[0.07] bg-[linear-gradient(155deg,oklch(0.12_0.035_262/0.9),oklch(0.09_0.03_266/0.95))] p-4"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{m.label}</p>
                    <p className={cn("mt-2 font-display text-xl tabular-nums", m.total >= 0 ? "text-emerald-200" : "text-rose-200")}>
                      {fmtR(m.total, 2)}
                    </p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          ) : null}
        </>
      )}
    </div>
  );
}
