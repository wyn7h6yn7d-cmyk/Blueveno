"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useAccess } from "@/components/access/access-provider";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { computeTradingStats, type WeeklyReflectionStat } from "@/lib/user-data/trading-stats";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { cn } from "@/lib/utils";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { createClient } from "@/lib/supabase/client";
import { parsePnlAmount } from "@/lib/user-data/kpi";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

function fmtPnl(n: number | null, currency: string) {
  if (n === null) return "—";
  return formatSignedPnlAmount(n, currency);
}

function CumulativeChart({ points, currency }: { points: { i: number; t: string; y: number }[]; currency: string }) {
  const [tipIndex, setTipIndex] = useState<number | null>(null);
  const uid = useId();
  const fillId = `${uid}-cum-fill`;
  const w = 860;
  const h = 320;
  const pad = 32;
  if (points.length < 2) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 text-[13px] text-zinc-500">
        A few more trading days will draw the curve.
      </div>
    );
  }
  const ys = points.map((p) => p.y);
  const minY = Math.min(0, ...ys);
  const maxY = Math.max(0, ...ys);
  const span = Math.max(maxY - minY, 1e-6);
  const n = points.length;
  const endY = points[n - 1]?.y ?? 0;
  const net = endY;
  const toX = (i: number) => pad + (i / Math.max(n - 1, 1)) * (w - pad * 2);
  const plotBottom = h - 28;
  const toY = (y: number) => pad + (1 - (y - minY) / span) * (plotBottom - pad);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.y).toFixed(1)}`)
    .join(" ");

  const showTip = (i: number) => () => {
    setTipIndex((prev) => (prev === i ? prev : i));
  };

  const xTickIndexes = [0, Math.floor((n - 1) / 2), n - 1];
  const xTickLabels = xTickIndexes.map((i) => ({ i, date: points[i]?.t ?? "" }));
  const tipPoint =
    tipIndex !== null
      ? {
          x: toX(tipIndex),
          y: toY(points[tipIndex]?.y ?? 0),
          value: points[tipIndex]?.y ?? 0,
          date: points[tipIndex]?.t ?? "",
        }
      : null;

  return (
    <div className="relative space-y-3" onPointerLeave={() => setTipIndex(null)}>
      <div className="grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Current</p>
          <p className="mt-1 font-mono text-[13px] tabular-nums text-zinc-100">{formatSignedPnlAmount(endY, currency)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Change</p>
          <p
            className={cn(
              "mt-1 font-mono text-[13px] tabular-nums",
              net >= 0 ? "text-emerald-200" : "text-rose-200",
            )}
          >
            {formatSignedPnlAmount(net, currency)}
          </p>
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="h-[18.5rem] w-full max-w-full sm:h-[21.5rem]" role="img" aria-label="Cumulative P and L">
        <defs>
          <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.58 0.14 252)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="oklch(0.1 0.04 266)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${d} L ${toX(n - 1)} ${plotBottom} L ${toX(0)} ${plotBottom} Z`}
          fill={`url(#${fillId})`}
          className="opacity-95"
        />
        {[0.25, 0.5, 0.75].map((m) => {
          const y = pad + (plotBottom - pad) * m;
          return (
            <line
              key={`grid-${m}`}
              x1={pad}
              y1={y}
              x2={w - pad}
              y2={y}
              stroke="oklch(0.4 0.02 260)"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
          );
        })}
        <path
          d={d}
          fill="none"
          stroke="oklch(0.74 0.11 250)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_14px_oklch(0.55_0.12_252/0.28)]"
        />
        <line x1={pad} y1={plotBottom} x2={w - pad} y2={plotBottom} stroke="oklch(0.4 0.02 260)" strokeOpacity="0.35" strokeWidth="1" />

        {xTickLabels.map(({ i, date }) => (
          <text key={`tick-${i}`} x={toX(i)} y={h - 10} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-zinc-500 font-mono text-[10px]">
            {date}
          </text>
        ))}

        {points.map((p, i) => (
          <rect
            key={`hit-${i}`}
            x={toX(i) - ((w - pad * 2) / Math.max(n - 1, 1)) / 2}
            y={0}
            width={(w - pad * 2) / Math.max(n - 1, 1)}
            height={h}
            fill="transparent"
            className="cursor-default"
            onPointerEnter={showTip(i)}
            onPointerMove={showTip(i)}
          />
        ))}

        {tipIndex !== null ? (
          <circle
            cx={toX(tipIndex)}
            cy={toY(points[tipIndex]?.y ?? 0)}
            r={5}
            fill="oklch(0.74 0.11 250)"
            stroke="oklch(0.11 0.03 266)"
            strokeWidth="1.5"
          />
        ) : null}

        <text
          x={w - pad}
          y={toY(maxY) - 4}
          textAnchor="end"
          className="fill-zinc-500 font-mono text-[10px]"
        >
          {formatSignedPnlAmount(maxY, currency)}
        </text>
        <text
          x={w - pad}
          y={toY(minY) - 4}
          textAnchor="end"
          className="fill-zinc-500 font-mono text-[10px]"
        >
          {formatSignedPnlAmount(minY, currency)}
        </text>
      </svg>
      {tipPoint ? (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-[20] rounded-lg border border-white/[0.12] bg-[oklch(0.11_0.035_266/0.98)] px-3 py-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)]",
            tipPoint.x > w - 120 ? "-translate-x-full -translate-y-[115%]" : "-translate-x-1/2 -translate-y-[115%]",
          )}
          style={{
            left: `${(tipPoint.x / w) * 100}%`,
            top: `${(tipPoint.y / h) * 100}%`,
          }}
        >
          <p className="font-display text-[15px] tabular-nums tracking-[-0.02em] text-zinc-50">
            {formatSignedPnlAmount(tipPoint.value, currency)}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{tipPoint.date}</p>
        </div>
      ) : null}
    </div>
  );
}

function DailyBars({ bars, currency }: { bars: { date: string; pnl: number }[]; currency: string }) {
  const [tipIndex, setTipIndex] = useState<number | null>(null);
  const visibleBars = bars.slice(-7);
  const w = 860;
  const h = 240;
  const pad = 24;
  if (visibleBars.length === 0) {
    return null;
  }
  const maxAbs = Math.max(...visibleBars.map((b) => Math.abs(b.pnl)), 1e-6);
  const inner = w - pad * 2;
  const barW = Math.max(8, Math.min(22, inner / Math.max(visibleBars.length, 1) - 2));
  const step = inner / Math.max(visibleBars.length, 1);
  const labelBand = 26;
  const midY = (h - labelBand) / 2;
  const maxH = midY - pad;

  const showTip = (i: number) => () => {
    setTipIndex((prev) => (prev === i ? prev : i));
  };

  return (
    <div className="relative" onPointerLeave={() => setTipIndex(null)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-56 w-full max-w-full" role="img" aria-label="Daily P and L bars">
        <line
          x1={pad}
          y1={midY}
          x2={w - pad}
          y2={midY}
          stroke="oklch(0.4 0.02 260)"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        {visibleBars.map((b, i) => {
          const x = pad + i * step + (step - barW) / 2;
          const bh = (Math.abs(b.pnl) / maxAbs) * maxH;
          const fill = b.pnl >= 0 ? "oklch(0.58 0.14 155)" : "oklch(0.55 0.17 18)";
          if (b.pnl >= 0) {
            return (
              <rect
                key={b.date}
                x={x}
                y={midY - bh}
                width={barW}
                height={Math.max(bh, 1)}
                rx={4}
                fill={fill}
                opacity={0.9}
              />
            );
          }
          return (
            <rect key={b.date} x={x} y={midY} width={barW} height={Math.max(bh, 1)} rx={4} fill={fill} opacity={0.92} />
          );
        })}
        {visibleBars.map((b, i) => (
          <rect
            key={`hit-${b.date}`}
            x={pad + i * step}
            y={0}
            width={step}
            height={h}
            fill="transparent"
            className="cursor-default"
            onPointerEnter={showTip(i)}
            onPointerMove={showTip(i)}
          />
        ))}
        {visibleBars.map((b, i) => (
          <text
            key={`label-${b.date}`}
            x={pad + i * step + step / 2}
            y={h - 7}
            textAnchor="middle"
            className="fill-zinc-500 font-mono text-[10px]"
          >
            {b.date.slice(5)}
          </text>
        ))}
      </svg>
      {tipIndex !== null ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute left-3 top-3 z-[20] rounded-lg border border-white/[0.12] bg-[oklch(0.11_0.035_266/0.98)] px-3 py-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)]"
        >
          <p className="font-display text-[15px] tabular-nums tracking-[-0.02em] text-zinc-50">
            {formatSignedPnlAmount(visibleBars[tipIndex].pnl, currency)}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{visibleBars[tipIndex].date}</p>
        </div>
      ) : null}
    </div>
  );
}

function WeeklyTrend({ weekly, currency }: { weekly: { label: string; total: number }[]; currency: string }) {
  if (weekly.length === 0) return null;
  const last = weekly.slice(-8);
  const maxAbs = Math.max(...last.map((w) => Math.abs(w.total)), 1e-6);
  return (
    <div className="grid gap-2.5">
      {last.map((w) => (
        <div
          key={w.label}
          className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] text-zinc-400">{w.label}</p>
            <p
              className={cn(
                "font-display text-[1rem] tabular-nums tracking-[-0.02em] whitespace-nowrap",
                w.total >= 0 ? "text-emerald-200" : "text-rose-200",
              )}
            >
              {fmtPnl(w.total, currency)}
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn("h-full rounded-full", w.total >= 0 ? "bg-emerald-400/85" : "bg-rose-400/85")}
              style={{ width: `${(Math.abs(w.total) / maxAbs) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MoodDistributionChart({
  moodBreakdown,
}: {
  moodBreakdown: { calm: number; focused: number; hesitant: number; tilted: number };
}) {
  const rows = [
    { label: "Calm", value: moodBreakdown.calm, tone: "bg-[oklch(0.58_0.12_200)]" },
    { label: "Focused", value: moodBreakdown.focused, tone: "bg-[oklch(0.72_0.12_252)]" },
    { label: "Hesitant", value: moodBreakdown.hesitant, tone: "bg-[oklch(0.69_0.11_90)]" },
    { label: "Tilted", value: moodBreakdown.tilted, tone: "bg-[oklch(0.58_0.16_20)]" },
  ];
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  return (
    <div className="space-y-2.5">
      {rows.map((row) => {
        const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
        return (
          <div key={row.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <p className="text-zinc-300">{row.label}</p>
              <p className="font-mono text-zinc-400">
                {row.value} <span className="text-zinc-600">({pct}%)</span>
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div className={cn("h-full rounded-full", row.tone)} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DisciplineTrend({ weekly, weeklyReflections }: { weekly: { weekStart: string; label: string; total: number }[]; weeklyReflections: WeeklyReflectionStat[] }) {
  const points = weekly.slice(-8).map((w) => {
    const base = w.total > 0 ? 72 : w.total < 0 ? 46 : 58;
    const reflected = weeklyReflections.some((r) => r.week_start === w.weekStart);
    const score = Math.max(0, Math.min(100, base + (reflected ? 8 : 0)));
    return { label: w.label, score };
  });
  const max = Math.max(...points.map((p) => p.score), 1);
  return (
    <div className="grid gap-2.5">
      {points.map((p) => (
        <div key={p.label} className="rounded-lg border border-white/[0.07] bg-black/15 px-3.5 py-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <p className="font-mono text-zinc-400">{p.label}</p>
            <p className="font-display text-zinc-200">{p.score}%</p>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-[oklch(0.72_0.12_252)]" style={{ width: `${(p.score / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsPageClient({ userId, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflectionStat[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      const { data: rows } = await supabase
        .from("weekly_reflections")
        .select("week_start")
        .eq("user_id", userId);
      if (cancelled) return;
      setWeeklyReflections(((rows ?? []) as WeeklyReflectionStat[]).filter((r) => Boolean(r.week_start)));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const stats = useMemo(() => computeTradingStats(data.journal, weeklyReflections), [data.journal, weeklyReflections]);

  const netR = stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0;
  const focusedAvg = stats.correlationHints.find((h) => h.label === "Avg P&L on Focused days")?.avgPnl ?? null;
  const calmAvg = stats.correlationHints.find((h) => h.label === "Avg P&L on Calm days")?.avgPnl ?? null;
  const followedPlanAvg = stats.correlationHints.find((h) => h.label === "Avg P&L when Followed plan = true")?.avgPnl ?? null;
  const notFollowedPlanAvg = stats.correlationHints.find((h) => h.label === "Avg P&L when Followed plan = false")?.avgPnl ?? null;

  const moodAverages = useMemo(() => {
    const buckets = new Map<string, number[]>();
    for (const row of data.journal) {
      if (!row.moodState) continue;
      const pnl = parsePnlAmount(row.r);
      if (pnl === null) continue;
      const arr = buckets.get(row.moodState) ?? [];
      arr.push(pnl);
      buckets.set(row.moodState, arr);
    }
    const rows = [...buckets.entries()]
      .filter(([, vals]) => vals.length >= 3)
      .map(([state, vals]) => ({
        state,
        avg: vals.reduce((sum, v) => sum + v, 0) / vals.length,
        sample: vals.length,
      }))
      .sort((a, b) => b.avg - a.avg);
    return rows;
  }, [data.journal]);

  const bestBehavior = moodAverages[0] ?? null;
  const weakestBehavior = moodAverages[moodAverages.length - 1] ?? null;
  const hasBehaviorInsights =
    focusedAvg != null &&
    calmAvg != null &&
    followedPlanAvg != null &&
    notFollowedPlanAvg != null &&
    bestBehavior != null &&
    weakestBehavior != null;

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Performance"
        title="Stats"
        description="See the week, review the behavior, and keep journaling."
        actions={
          <Link href="/app/calendar" className={appSecondaryCta}>
            <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
            Calendar
          </Link>
        }
      />

      {!ready ? (
        <div className="h-56 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      ) : data.journal.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No stats yet"
          description="Keep journaling to reveal patterns."
          action={
            <Link href="/app/journal" className={cn(appPrimaryCta, "inline-flex items-center gap-1.5")}>
              Log the day
              <ArrowUpRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <>
          <section className="grid gap-5 rounded-2xl border border-[oklch(0.52_0.12_252/0.18)] bg-[linear-gradient(165deg,oklch(0.14_0.038_262/0.94),oklch(0.09_0.03_266/0.92))] p-5 sm:p-6 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] min-[460px]:grid-cols-2 lg:grid-cols-4" aria-label="Summary at a glance">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Net P&L</p>
              <p
                className={cn(
                  "font-display mt-2 text-3xl tabular-nums tracking-[-0.03em]",
                  netR > 0 ? "text-emerald-200" : netR < 0 ? "text-rose-200" : "text-zinc-100",
                )}
              >
                {fmtPnl(netR, displayCurrency)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Win / loss days</p>
              <p className="font-display mt-2 text-3xl tabular-nums text-zinc-50">
                {stats.winDays}
                <span className="text-zinc-600"> · </span>
                {stats.lossDays}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Streak</p>
              <p className="mt-2 font-display text-lg leading-snug tracking-tight text-zinc-100">{stats.streakLabel}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Trading days</p>
              <p className="font-display mt-2 text-3xl tabular-nums text-zinc-50">{stats.dailyBars.length}</p>
            </div>
          </section>

          <DashboardCard
            eyebrow="Trend"
            title="Cumulative P&L"
            description="Running total of daily P&amp;L, oldest to newest."
            variant="inset"
            className="overflow-hidden"
          >
            <CumulativeChart points={stats.cumulative} currency={displayCurrency} />
          </DashboardCard>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Secondary charts">
            <DashboardCard eyebrow="Days" title="Daily P&amp;L bars" description="One bar per trading day." variant="inset" className="overflow-x-hidden">
              <DailyBars bars={stats.dailyBars} currency={displayCurrency} />
            </DashboardCard>
            <DashboardCard eyebrow="Weeks" title="Weekly totals trend" description="Recent weeks at a glance.">
              <WeeklyTrend weekly={stats.weekly} currency={displayCurrency} />
            </DashboardCard>
            <DashboardCard eyebrow="Behavior" title="Mood distribution" description="Which state appears most often.">
              <MoodDistributionChart moodBreakdown={stats.moodBreakdown} />
            </DashboardCard>
            <DashboardCard eyebrow="Discipline" title="Discipline score trend" description="Weekly score with reflection bonus.">
              <DisciplineTrend weekly={stats.weekly} weeklyReflections={weeklyReflections} />
            </DashboardCard>
          </section>

          <section aria-label="Behavior insights">
            <DashboardCard
              eyebrow="Behavior insights"
              title="How behavior links to your P&L"
              description="Insights appear when sample size is strong enough."
            >
              {!hasBehaviorInsights ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-8 text-center">
                  <p className="font-display text-[1.15rem] tracking-[-0.02em] text-zinc-100">
                    Keep journaling to reveal behavior patterns.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    { title: "Avg P&L on Focused days", value: focusedAvg },
                    { title: "Avg P&L on Calm days", value: calmAvg },
                    { title: "Avg P&L when followed plan", value: followedPlanAvg },
                    { title: "Avg P&L when plan was not followed", value: notFollowedPlanAvg },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3.5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500 min-[480px]:text-[10px] min-[480px]:tracking-[0.16em]">
                        {item.title}
                      </p>
                      <p
                        className={cn(
                          "mt-2 font-display text-2xl tabular-nums tracking-[-0.03em]",
                          (item.value ?? 0) >= 0 ? "text-emerald-200" : "text-rose-200",
                        )}
                      >
                        {fmtPnl(item.value, displayCurrency)}
                      </p>
                    </div>
                  ))}
                  <div className="rounded-xl border border-emerald-400/18 bg-emerald-500/[0.06] px-4 py-3.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-200/75">Best behavior state</p>
                    <p className="mt-2 font-display text-2xl tracking-[-0.03em] text-emerald-100">{bestBehavior?.state ?? "—"}</p>
                    <p className="mt-1 text-[12px] text-zinc-400">
                      {bestBehavior ? `${fmtPnl(bestBehavior.avg, displayCurrency)} · ${bestBehavior.sample} entries` : ""}
                    </p>
                  </div>
                  <div className="rounded-xl border border-rose-400/18 bg-rose-500/[0.06] px-4 py-3.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-rose-200/75">Weakest behavior state</p>
                    <p className="mt-2 font-display text-2xl tracking-[-0.03em] text-rose-100">{weakestBehavior?.state ?? "—"}</p>
                    <p className="mt-1 text-[12px] text-zinc-400">
                      {weakestBehavior ? `${fmtPnl(weakestBehavior.avg, displayCurrency)} · ${weakestBehavior.sample} entries` : ""}
                    </p>
                  </div>
                </div>
              )}
            </DashboardCard>
          </section>
        </>
      )}
    </div>
  );
}
