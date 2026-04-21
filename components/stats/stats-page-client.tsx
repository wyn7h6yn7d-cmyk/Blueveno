"use client";

import Link from "next/link";
import { useId, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DashboardCard } from "@/components/app/dashboard-card";
import { EmptyState } from "@/components/app/empty-state";
import { useAccess } from "@/components/access/access-provider";
import { useUserWorkspace } from "@/lib/user-data/use-user-workspace";
import { computeTradingStats, type SessionPnlRow } from "@/lib/user-data/trading-stats";
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

function sessionPnlLabel(s: SessionPnlRow["session"]) {
  return s === "Between" ? "Between sessions" : s;
}

function CumulativeChart({ points }: { points: { i: number; y: number }[] }) {
  const uid = useId();
  const fillId = `${uid}-cum-fill`;
  const w = 560;
  const h = 168;
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
  const toX = (i: number) => pad + (i / Math.max(n - 1, 1)) * (w - pad * 2);
  const toY = (y: number) => pad + (1 - (y - minY) / span) * (h - pad * 2);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.y).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-48 w-full max-w-full" role="img" aria-label="Cumulative P and L">
      <defs>
        <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.58 0.14 252)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="oklch(0.1 0.04 266)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${toX(n - 1)} ${h - pad} L ${toX(0)} ${h - pad} Z`}
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
    </svg>
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
          className="pointer-events-none fixed z-[100] rounded-lg border border-white/[0.12] bg-[oklch(0.11_0.035_266/0.96)] px-3 py-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)] backdrop-blur-sm"
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
        description="Enough context to see how you are doing — tied to the calendar, never a separate analytics product."
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
          title="No performance data yet"
          description="Log trading days in your journal. Stats appear automatically from your P&L values."
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
            className="grid gap-6 rounded-2xl border border-white/[0.08] bg-[linear-gradient(165deg,oklch(0.13_0.035_262/0.95),oklch(0.085_0.028_266/0.92))] p-6 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] sm:grid-cols-2 lg:grid-cols-4"
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
              <p className="mt-2 font-display text-xl leading-snug text-zinc-100">{stats.streakLabel}</p>
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
            eyebrow="Sessions"
            title="P&L by trading session"
            description="Each entry is counted once. Time comes from when the row was saved, or your session time if you use HH:MM, otherwise noon UTC on the entry date. Overlapping FX windows use one bucket: New York, then London, then Tokyo, then Sydney."
            variant="inset"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[min(100%,520px)] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-white/[0.06] font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    <th scope="col" className="py-2 pr-3 font-medium">
                      Session
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium tabular-nums">
                      {"Net P&L"}
                    </th>
                    <th scope="col" className="px-3 py-2 text-right font-medium">
                      Entries
                    </th>
                    <th scope="col" className="py-2 pl-3 text-right font-medium">
                      Win rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.sessionPnl.map((row) => (
                    <tr key={row.session} className="border-b border-white/[0.04] transition last:border-0 hover:bg-white/[0.03]">
                      <td className="py-2.5 pr-3 font-medium text-zinc-200">{sessionPnlLabel(row.session)}</td>
                      <td
                        className={cn(
                          "px-3 py-2.5 text-right font-display tabular-nums",
                          row.totalPnl > 0 && "text-emerald-200",
                          row.totalPnl < 0 && "text-rose-200",
                          row.totalPnl === 0 && "text-zinc-300",
                        )}
                      >
                        {fmtPnl(row.totalPnl, displayCurrency)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono tabular-nums text-zinc-400">{row.entries}</td>
                      <td className="py-2.5 pl-3 text-right font-mono tabular-nums text-zinc-400">
                        {row.entries ? `${Math.round((row.winEntries / row.entries) * 100)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          <DashboardCard
            eyebrow="Trend"
            title="Cumulative P&L"
            description="Running sum of daily P&L, oldest to newest."
            variant="inset"
            className="overflow-hidden"
          >
            <CumulativeChart points={stats.cumulative} />
          </DashboardCard>

          <DashboardCard eyebrow="Days" title="Daily outcomes" description="One bar per calendar day — green above the line, red below." variant="inset">
            <DailyBars bars={stats.dailyBars} currency={displayCurrency} />
          </DashboardCard>

          <DashboardCard eyebrow="Weeks" title="Weekly totals" description="Recent weeks, same rhythm as the calendar rail.">
            <WeeklyTrend weekly={stats.weekly} currency={displayCurrency} />
          </DashboardCard>

          {stats.monthly.length >= 2 ? (
            <DashboardCard eyebrow="Months" title="Monthly rhythm" description="When history builds, months tell a simple story.">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stats.monthly.map((m) => (
                  <div
                    key={m.key}
                    className="rounded-xl border border-white/[0.07] bg-[linear-gradient(155deg,oklch(0.11_0.035_262/0.9),oklch(0.08_0.03_266/0.92))] px-4 py-3.5"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">{m.label}</p>
                    <p
                      className={cn(
                        "mt-2 font-display text-xl tabular-nums",
                        m.total >= 0 ? "text-emerald-200" : "text-rose-200",
                      )}
                    >
                      {fmtPnl(m.total, displayCurrency)}
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
