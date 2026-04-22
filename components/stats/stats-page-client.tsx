"use client";

import Link from "next/link";
import { useId, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useAccess } from "@/components/access/access-provider";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { computeTradingStats } from "@/lib/user-data/trading-stats";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { cn } from "@/lib/utils";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

function fmtPnl(n: number | null, currency: string) {
  if (n === null) return "—";
  return formatSignedPnlAmount(n, currency);
}

function CumulativeChart({ points, currency }: { points: { i: number; t: string; y: number }[]; currency: string }) {
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  const uid = useId();
  const fillId = `${uid}-cum-fill`;
  const w = 560;
  const h = 188;
  const pad = 14;
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

  const showTip = (i: number) => (e: ReactPointerEvent<SVGRectElement>) => {
    setTip({ i, x: e.clientX, y: e.clientY });
  };

  const xTickIndexes = [0, Math.floor((n - 1) / 2), n - 1];
  const xTickLabels = xTickIndexes.map((i) => ({ i, date: points[i]?.t ?? "" }));

  return (
    <div className="relative space-y-3" onPointerLeave={() => setTip(null)}>
      <div className="grid grid-cols-2 gap-3">
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

      <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full max-w-full" role="img" aria-label="Cumulative P and L">
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
        <path
          d={d}
          fill="none"
          stroke="oklch(0.74 0.11 250)"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_12px_oklch(0.55_0.12_252/0.25)]"
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

        {tip ? (
          <circle
            cx={toX(tip.i)}
            cy={toY(points[tip.i]?.y ?? 0)}
            r={4}
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
      {tip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[100] rounded-lg border border-white/[0.12] bg-[oklch(0.11_0.035_266/0.98)] px-3 py-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)]"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          <p className="font-display text-[15px] tabular-nums tracking-[-0.02em] text-zinc-50">
            {formatSignedPnlAmount(points[tip.i]?.y ?? 0, currency)}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{points[tip.i]?.t ?? ""}</p>
        </div>
      ) : null}
    </div>
  );
}

function DailyBars({ bars, currency }: { bars: { date: string; pnl: number }[]; currency: string }) {
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  const w = 560;
  const h = 148;
  const pad = 16;
  if (bars.length === 0) {
    return null;
  }
  const maxAbs = Math.max(...bars.map((b) => Math.abs(b.pnl)), 1e-6);
  const inner = w - pad * 2;
  const barW = Math.min(11, inner / Math.max(bars.length, 1) - 2);
  const step = inner / Math.max(bars.length, 1);
  const midY = h / 2;
  const maxH = midY - pad;

  const showTip = (i: number) => (e: ReactPointerEvent<SVGRectElement>) => {
    setTip({ i, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="relative" onPointerLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full max-w-full" role="img" aria-label="Daily P and L bars">
        <line
          x1={pad}
          y1={midY}
          x2={w - pad}
          y2={midY}
          stroke="oklch(0.4 0.02 260)"
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        {bars.map((b, i) => {
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
                rx={3}
                fill={fill}
                opacity={0.9}
              />
            );
          }
          return (
            <rect key={b.date} x={x} y={midY} width={barW} height={Math.max(bh, 1)} rx={3} fill={fill} opacity={0.9} />
          );
        })}
        {bars.map((b, i) => (
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
      </svg>
      {tip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[100] rounded-lg border border-white/[0.12] bg-[oklch(0.11_0.035_266/0.98)] px-3 py-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)]"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          <p className="font-display text-[15px] tabular-nums tracking-[-0.02em] text-zinc-50">
            {formatSignedPnlAmount(bars[tip.i].pnl, currency)}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{bars[tip.i].date}</p>
        </div>
      ) : null}
    </div>
  );
}

function WeeklyTrend({
  weekly,
  currency,
}: {
  weekly: { label: string; total: number }[];
  currency: string;
}) {
  if (weekly.length === 0) return null;
  const last = weekly.slice(-6);
  const maxAbs = Math.max(...last.map((w) => Math.abs(w.total)), 1e-6);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {last.map((w) => (
        <div
          key={w.label}
          className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]"
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">Week of</p>
          <p className="mt-1 font-mono text-[12px] text-zinc-400">{w.label}</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn("h-full rounded-full", w.total >= 0 ? "bg-emerald-400/85" : "bg-rose-400/85")}
              style={{ width: `${(Math.abs(w.total) / maxAbs) * 100}%` }}
            />
          </div>
          <p
            className={cn(
              "mt-3 font-display text-lg tabular-nums tracking-[-0.02em]",
              w.total >= 0 ? "text-emerald-200" : "text-rose-200",
            )}
          >
            {fmtPnl(w.total, currency)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function StatsPageClient({ userId, initialWorkspace }: Props) {
  const { displayCurrency } = useAccess();
  const { data, ready } = useUserWorkspace(userId, { initialWorkspace });
  const stats = useMemo(() => computeTradingStats(data.journal), [data.journal]);

  const netR = stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0;

  return (
    <div className="space-y-10">
      <PageHeader
        variant="signature"
        eyebrow="Performance"
        title="Stats"
        description="Simple summaries from your journal — cumulative curve, daily bars, and week rhythm."
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
          description="Log days in your journal — charts fill in from your P&amp;L."
          action={
            <Link href="/app/journal" className={cn(appPrimaryCta, "inline-flex items-center gap-1.5")}>
              Open journal
              <ArrowUpRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <>
          <section
            className="grid gap-5 rounded-2xl border border-[oklch(0.52_0.12_252/0.18)] bg-[linear-gradient(165deg,oklch(0.14_0.038_262/0.94),oklch(0.09_0.03_266/0.92))] p-6 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Summary at a glance"
          >
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

          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardCard eyebrow="Range" title="Best & worst day" description="Total P&L for that calendar day.">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.06] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200/70">Best</p>
                  <p className="mt-2 font-display text-2xl text-emerald-100">
                    {stats.bestDay ? fmtPnl(stats.bestDay.pnl, displayCurrency) : "—"}
                  </p>
                  <p className="mt-1 text-[12px] text-zinc-500">{stats.bestDay?.date ?? ""}</p>
                </div>
                <div className="rounded-xl border border-rose-400/15 bg-rose-500/[0.06] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose-200/70">Worst</p>
                  <p className="mt-2 font-display text-2xl text-rose-100">
                    {stats.worstDay ? fmtPnl(stats.worstDay.pnl, displayCurrency) : "—"}
                  </p>
                  <p className="mt-1 text-[12px] text-zinc-500">{stats.worstDay?.date ?? ""}</p>
                  {!stats.worstDay && stats.dailyBars.length === 1 ? (
                    <p className="mt-2 text-[11px] leading-snug text-zinc-600">Log another day to see a worst-day comparison.</p>
                  ) : null}
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              eyebrow="Average"
              title="Green vs red days"
              description="Mean P&L when the day closed your way — or against you."
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Avg green day</p>
                  <p className="mt-2 font-display text-2xl tabular-nums text-emerald-200">
                    {stats.avgGreenDay != null ? fmtPnl(stats.avgGreenDay, displayCurrency) : "—"}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Avg red day</p>
                  <p className="mt-2 font-display text-2xl tabular-nums text-rose-200">
                    {stats.avgRedDay != null ? fmtPnl(stats.avgRedDay, displayCurrency) : "—"}
                  </p>
                </div>
              </div>
              {stats.flatDays > 0 ? (
                <p className="mt-4 text-[13px] text-zinc-500">{stats.flatDays} flat day(s) in the sample.</p>
              ) : null}
            </DashboardCard>
          </div>

          <DashboardCard
            eyebrow="Trend"
            title="Cumulative P&L"
            description="Running total of daily P&amp;L, oldest to newest."
            variant="inset"
            className="overflow-hidden"
          >
            <CumulativeChart points={stats.cumulative} currency={displayCurrency} />
          </DashboardCard>

          <DashboardCard eyebrow="Days" title="Daily P&amp;L" description="One bar per calendar day." variant="inset">
            <DailyBars bars={stats.dailyBars} currency={displayCurrency} />
          </DashboardCard>

          <DashboardCard eyebrow="Weeks" title="Weekly totals" description="Recent weeks — same rhythm as the calendar.">
            <WeeklyTrend weekly={stats.weekly} currency={displayCurrency} />
          </DashboardCard>
        </>
      )}
    </div>
  );
}
