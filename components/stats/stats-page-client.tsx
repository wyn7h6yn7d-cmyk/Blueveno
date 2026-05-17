"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  LayoutGrid,
  LineChart,
  Sparkles,
  UserCheck,
  Wallet,
} from "lucide-react";
import { SectionNav, type SectionNavItem } from "@/components/app/section-nav";
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
import { useAppToast } from "@/components/app/app-toast-provider";
import { InlineFeedback } from "@/components/app/inline-feedback";
import { formatUserError } from "@/lib/feedback/format-error";
import { feedbackToneFromMessage } from "@/lib/feedback/feedback-tone";
import { PRODUCT_ANALYTICS_EVENTS } from "@/lib/analytics/product-events";
import { trackExportCsvClicked, trackProductEvent } from "@/lib/analytics/track-product-event";
import { createClient } from "@/lib/supabase/client";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import { mapTradingAccountRow } from "@/lib/trading-accounts/map";
import {
  applyEntryFilters,
  DAY_COLOR_FILTER_LABELS,
  EMPTY_ENTRY_FILTERS,
  FILTER_DIMENSION_ALL_LABEL,
  filterChips,
  hasActiveFilters,
  parseFiltersFromParams,
  uniqueValues,
  writeFiltersToParams,
  type EntryFilters,
} from "@/lib/user-data/entry-filters";
import { appFilterShell, appFormSelect } from "@/lib/ui/app-form";
import type { JournalRow } from "@/lib/user-data/types";
import { Input } from "@/components/ui/input";
import { fileDate, recordsToCsv, triggerCsvDownload } from "@/lib/export/csv";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { computeMonthlyReview } from "@/lib/user-data/monthly-review";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import { MonthlyReviewCard } from "@/components/reports/monthly-review-card";
import { DEFAULT_STATS_TAB, parseStatsTab, type StatsTabId } from "@/lib/stats/stats-tabs";

type Props = {
  userId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

function fmtPnl(n: number | null, currency: string) {
  if (n === null) return "—";
  return formatSignedPnlAmount(n, currency);
}

function formatDisciplineDisplay(score: number | null | undefined): string {
  if (score === null || score === undefined || !Number.isFinite(score)) return "—";
  return `${Math.round(score)}%`;
}

function formatProfitFactor(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return value.toFixed(2);
}

type TagPerformanceRow = {
  label: string;
  totalPnl: number;
  averagePnl: number | null;
  entries: number;
};

function computeTagPerformance(
  entries: JournalRow[],
  pick: (row: JournalRow) => string | undefined,
  skip: (label: string) => boolean,
  minEntries = 2,
): TagPerformanceRow[] {
  const map = new Map<string, { sum: number; count: number }>();
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null || !Number.isFinite(pnl)) continue;
    const label = pick(row)?.trim();
    if (!label || skip(label)) continue;
    const prev = map.get(label) ?? { sum: 0, count: 0 };
    map.set(label, { sum: prev.sum + pnl, count: prev.count + 1 });
  }
  return [...map.entries()]
    .filter(([, v]) => v.count >= minEntries)
    .map(([label, v]) => ({
      label,
      totalPnl: v.sum,
      averagePnl: v.count > 0 ? v.sum / v.count : null,
      entries: v.count,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);
}

function AccountComparisonTable({
  rows,
  currency,
}: {
  rows: Array<{
    id: string;
    name: string;
    type: string;
    pnl: number;
    winRate: number | null;
    tradedDays: number;
    disciplineScore: number | null;
  }>;
  currency: string;
}) {
  if (rows.length <= 1) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 text-sm text-zinc-500">
        Add another account to compare performance.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-[12px]" aria-label="Account comparison">
        <thead>
          <tr className="border-b border-white/[0.1] app-kicker text-[11px]">
            <th scope="col" className="min-w-[10rem] px-3 py-2.5 text-left font-medium">
              Account
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Net P&amp;L
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Trade win
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Traded days
            </th>
            <th scope="col" className="whitespace-nowrap px-3 py-2.5 text-left font-medium">
              Discipline
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-white/[0.06] transition-colors last:border-b-0 hover:bg-white/[0.03]">
              <td className="max-w-[14rem] px-3 py-2.5 align-middle">
                <p className="truncate text-zinc-200">
                  {row.name} <span className="text-zinc-500">({row.type})</span>
                </p>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums">
                <span className={cn(row.pnl > 0 ? "text-emerald-200" : row.pnl < 0 ? "text-rose-200" : "text-zinc-300")}>
                  {fmtPnl(row.pnl, currency)}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums text-zinc-300">
                {row.winRate !== null ? `${row.winRate}%` : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums text-zinc-300">{row.tradedDays}</td>
              <td className="whitespace-nowrap px-3 py-2.5 align-middle tabular-nums text-zinc-300">
                {formatDisciplineDisplay(row.disciplineScore)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TagPerformanceList({
  rows,
  currency,
  emptyLabel,
}: {
  rows: TagPerformanceRow[];
  currency: string;
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[12px] text-zinc-500">
        {emptyLabel}
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {rows.slice(0, 6).map((row) => (
        <div key={row.label} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-white/[0.07] bg-black/15 px-3.5 py-2.5">
          <div>
            <p className="text-[13px] text-zinc-200">{row.label}</p>
            <p className="text-[11px] text-zinc-500">
              Avg {fmtPnl(row.averagePnl, currency)} · {row.entries} entries
            </p>
          </div>
          <p
            className={cn(
              "font-mono text-[12px] tabular-nums",
              row.totalPnl > 0 ? "text-emerald-200" : row.totalPnl < 0 ? "text-rose-200" : "text-zinc-300",
            )}
          >
            {fmtPnl(row.totalPnl, currency)}
          </p>
        </div>
      ))}
    </div>
  );
}

function CumulativeChart({
  points,
  currency,
  compact = false,
}: {
  points: { i: number; t: string; y: number }[];
  currency: string;
  compact?: boolean;
}) {
  const [tipIndex, setTipIndex] = useState<number | null>(null);
  const uid = useId();
  const fillId = `${uid}-cum-fill`;
  const w = 860;
  const h = compact ? 220 : 320;
  const pad = 32;
  if (points.length < 2) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl border border-white/[0.06] bg-black/20 px-5 text-center text-[13px] text-zinc-500",
          compact ? "h-36" : "h-44",
        )}
      >
        Add a few trading days to unlock performance and behavior patterns.
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
          <p className="app-kicker">Current</p>
          <p className="mt-1 font-mono text-[13px] tabular-nums text-zinc-100">{formatSignedPnlAmount(endY, currency)}</p>
        </div>
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
          <p className="app-kicker">Change</p>
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

  const tipPoint =
    tipIndex !== null
      ? (() => {
          const b = visibleBars[tipIndex];
          const x = pad + tipIndex * step + step / 2;
          const bh = (Math.abs(b.pnl) / maxAbs) * maxH;
          const y = b.pnl >= 0 ? midY - bh : midY + bh;
          return { x, y, pnl: b.pnl, date: b.date };
        })()
      : null;

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
      {tipPoint ? (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-[20] rounded-lg border border-white/[0.12] bg-[oklch(0.11_0.035_266/0.98)] px-3 py-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.75)]",
            tipPoint.x > w - 130 ? "-translate-x-full -translate-y-[115%]" : "-translate-x-1/2 -translate-y-[115%]",
          )}
          style={{
            left: `${(tipPoint.x / w) * 100}%`,
            top: `${Math.max(((tipPoint.y - 8) / h) * 100, 8)}%`,
          }}
        >
          <p className="font-display text-[15px] tabular-nums tracking-[-0.02em] text-zinc-50">
            {formatSignedPnlAmount(tipPoint.pnl, currency)}
          </p>
          <p className="mt-0.5 font-mono text-[11px] text-zinc-500">{tipPoint.date}</p>
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useAppToast();
  const { displayCurrency } = useAccess();
  const { data, ready, activeAccountId } = useUserWorkspace(userId, { initialWorkspace });
  const [weeklyReflections, setWeeklyReflections] = useState<WeeklyReflectionStat[]>([]);
  const [monthlyFocusRows, setMonthlyFocusRows] = useState<Array<{ weekStart: string; nextWeekFocus: string | null }>>([]);
  const [latestReviewRule, setLatestReviewRule] = useState<string | null>(null);
  const [latestReviewConfidence, setLatestReviewConfidence] = useState<number | null>(null);
  const [accountComparisonRows, setAccountComparisonRows] = useState<
    Array<{ id: string; name: string; type: string; pnl: number; winRate: number | null; tradedDays: number; disciplineScore: number | null }>
  >([]);
  const [personalRules, setPersonalRules] = useState<Array<{ id: string; title: string; is_active: boolean }>>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EntryFilters>(() => parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
  const [accountScope, setAccountScope] = useState<"active" | "all">(
    searchParams.get("accountScope") === "all" ? "all" : "active",
  );
  const [allAccountEntries, setAllAccountEntries] = useState<JournalRow[]>([]);
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    trackProductEvent(PRODUCT_ANALYTICS_EVENTS.statsOpened, { surface: "stats" });
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      let query = supabase
        .from("weekly_reflections")
        .select("week_start, next_week_rule, next_week_focus, confidence_score")
        .eq("user_id", userId)
        .order("week_start", { ascending: false });
      if (accountScope === "active") {
        if (!activeAccountId) return;
        query = query.eq("account_id", activeAccountId);
      }
      const { data: rows } = await query;
      if (cancelled) return;
      const mapped = ((rows ?? []) as Array<WeeklyReflectionStat & { next_week_rule?: string | null; confidence_score?: number | null }>)
        .filter((r) => Boolean(r.week_start));
      setWeeklyReflections(mapped);
      setMonthlyFocusRows(
        mapped.map((r) => ({
          weekStart: r.week_start,
          nextWeekFocus: (r as { next_week_focus?: string | null }).next_week_focus ?? null,
        })),
      );
      setLatestReviewRule((mapped[0]?.next_week_rule ?? null) as string | null);
      setLatestReviewConfidence((mapped[0]?.confidence_score ?? null) as number | null);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, activeAccountId, accountScope]);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      const { data: rows } = await supabase
        .from("personal_rules")
        .select("id,title,is_active")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      setPersonalRules((rows ?? []) as Array<{ id: string; title: string; is_active: boolean }>);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    setFilters(parseFiltersFromParams(new URLSearchParams(searchParams.toString())));
    setAccountScope(searchParams.get("accountScope") === "all" ? "all" : "active");
  }, [searchParams]);

  useEffect(() => {
    const base = new URLSearchParams(searchParams.toString());
    if (accountScope === "all") base.set("accountScope", "all");
    else base.delete("accountScope");
    const next = writeFiltersToParams(base, filters);
    const nextQuery = next.toString();
    if (nextQuery === searchParams.toString()) return;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [accountScope, filters, pathname, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    if (!userId || accountScope !== "all") return;
    const supabase = createClient();
    void (async () => {
      const fullSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade,session_tag,market_condition,lesson_learned,rule_checks";
      const fallbackSelect =
        "id,created_at,entry_date,entry_time,symbol,setup,r_value,tag,note,chart_link_url,mood_state,followed_plan,respected_stop,no_revenge_trade";

      const primary = await supabase
        .from("journal_entries")
        .select(fullSelect)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const secondary =
        primary.error && /column|schema cache|rule_checks|session_tag|market_condition|lesson_learned/i.test(primary.error.message ?? "")
          ? await supabase
              .from("journal_entries")
              .select(fallbackSelect)
              .eq("user_id", userId)
              .order("created_at", { ascending: false })
          : null;

      const rows = (secondary?.data ?? primary.data ?? []) as JournalRowDb[];
      if (cancelled) return;
      setAllAccountEntries(rows.map(mapJournalRowFromDb));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, accountScope]);

  const baseEntries = accountScope === "all" ? allAccountEntries : data.journal;
  const filteredEntries = useMemo(() => applyEntryFilters(baseEntries, filters), [baseEntries, filters]);
  const stats = useMemo(() => computeTradingStats(filteredEntries, weeklyReflections), [filteredEntries, weeklyReflections]);
  const preferredMonthKey = useMemo(() => {
    if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from)) return filters.from.slice(0, 7);
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }, [filters.from]);
  const monthlyReviewEntries = useMemo(
    () =>
      baseEntries.filter((row) => dayKeyFromRow(row.entryDate, row.createdAt).slice(0, 7) === preferredMonthKey),
    [baseEntries, preferredMonthKey],
  );
  const monthlyReview = useMemo(
    () => computeMonthlyReview(monthlyReviewEntries, monthlyFocusRows, preferredMonthKey),
    [monthlyReviewEntries, monthlyFocusRows, preferredMonthKey],
  );

  const netR = stats.cumulative.length > 0 ? stats.cumulative[stats.cumulative.length - 1]?.y ?? 0 : 0;
  const focusedAvg = stats.correlationHints.find((h) => h.label === "Avg P&L on Focused days")?.avgPnl ?? null;
  const calmAvg = stats.correlationHints.find((h) => h.label === "Avg P&L on Calm days")?.avgPnl ?? null;
  const followedPlanAvg = stats.correlationHints.find((h) => h.label === "Avg P&L when Followed plan = true")?.avgPnl ?? null;
  const notFollowedPlanAvg = stats.correlationHints.find((h) => h.label === "Avg P&L when Followed plan = false")?.avgPnl ?? null;

  const moodAverages = useMemo(() => {
    const buckets = new Map<string, number[]>();
    for (const row of filteredEntries) {
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
  }, [filteredEntries]);

  const bestBehavior = moodAverages[0] ?? null;
  const weakestBehavior = moodAverages[moodAverages.length - 1] ?? null;

  const behaviorInsightHints = useMemo(() => {
    const labels = new Set(stats.correlationHints.map((h) => h.label));
    return {
      calm: labels.has("Avg P&L on Calm days"),
      focused: labels.has("Avg P&L on Focused days"),
      plan: labels.has("Avg P&L when Followed plan = true") && labels.has("Avg P&L when Followed plan = false"),
      mood: bestBehavior != null && weakestBehavior != null,
    };
  }, [stats.correlationHints, bestBehavior, weakestBehavior]);

  const behaviorInsightBlockers = useMemo(() => {
    const rows: string[] = [];
    if (!behaviorInsightHints.calm) {
      rows.push("At least 3 trading days tagged Calm with a numeric day P&L.");
    }
    if (!behaviorInsightHints.focused) {
      rows.push("At least 3 trading days tagged Focused with a numeric day P&L.");
    }
    if (!behaviorInsightHints.plan) {
      rows.push("At least 3 days with Followed plan on and 3 with it off, each with a numeric day P&L.");
    }
    if (!behaviorInsightHints.mood) {
      rows.push("At least 3 trading days that share one mood (Calm, Focused, Hesitant, or Tilted) and have a numeric day P&L.");
    }
    return rows;
  }, [behaviorInsightHints]);

  const rulesAnalytics = useMemo(() => {
    const activeRules = personalRules.filter((r) => r.is_active);
    if (activeRules.length === 0 || filteredEntries.length === 0) {
      return { adherence: null as number | null, mostBroken: null as string | null, breakCost: null as number | null, rows: [] as Array<{ title: string; followedPct: number | null; avgFollowed: number | null; avgBroken: number | null; breakCost: number | null }> };
    }
    const rows = activeRules.map((rule) => {
      let followed = 0;
      let broken = 0;
      let followedSum = 0;
      let brokenSum = 0;
      for (const row of filteredEntries) {
        const pnl = parsePnlAmount(row.r);
        if (pnl === null) continue;
        const flag = Boolean(row.ruleChecks?.[rule.id]);
        if (flag) {
          followed += 1;
          followedSum += pnl;
        } else {
          broken += 1;
          brokenSum += pnl;
        }
      }
      const total = followed + broken;
      return {
        title: rule.title,
        followedPct: total > 0 ? Math.round((followed / total) * 100) : null,
        avgFollowed: followed > 0 ? followedSum / followed : null,
        avgBroken: broken > 0 ? brokenSum / broken : null,
        breakCost: broken > 0 ? brokenSum : null,
        brokenCount: broken,
      };
    });
    const adherenceSamples = rows.map((r) => r.followedPct).filter((v): v is number => v !== null);
    const adherence = adherenceSamples.length > 0
      ? Math.round(adherenceSamples.reduce((s, n) => s + n, 0) / adherenceSamples.length)
      : null;
    const mostBroken = rows.length > 0 ? rows.reduce((a, b) => (b.brokenCount > a.brokenCount ? b : a)).title : null;
    const breakCost = rows.reduce((s, r) => s + (r.breakCost ?? 0), 0);
    return { adherence, mostBroken, breakCost, rows };
  }, [filteredEntries, personalRules]);

  const sectionNavItems = useMemo<SectionNavItem[]>(
    () => [
      { id: "summary", label: "Summary", icon: LayoutGrid },
      { id: "performance", label: "Performance", icon: LineChart },
      { id: "behavior", label: "Behavior", icon: UserCheck },
      { id: "patterns", label: "Patterns", icon: Sparkles },
      { id: "accounts", label: "Accounts", icon: Wallet },
    ],
    [],
  );

  const activeTab = parseStatsTab(searchParams.get("tab"));

  const navigateTab = (tabId: string) => {
    const tab = parseStatsTab(tabId) as StatsTabId;
    const base = new URLSearchParams(searchParams.toString());
    if (tab === DEFAULT_STATS_TAB) base.delete("tab");
    else base.set("tab", tab);
    const nextQuery = base.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  };

  const sessionTagPerformance = useMemo(
    () =>
      computeTagPerformance(
        filteredEntries,
        (row) => row.sessionTag,
        (label) => label === "Other" || label === "—",
      ),
    [filteredEntries],
  );

  const marketConditionPerformance = useMemo(
    () =>
      computeTagPerformance(
        filteredEntries,
        (row) => row.marketCondition,
        (label) => label === "Other" || label === "—",
      ),
    [filteredEntries],
  );

  const mistakeTagPerformance = useMemo(
    () =>
      computeTagPerformance(
        filteredEntries,
        (row) => row.tag,
        (label) => label === "None" || label === "Manual" || label === "—",
      ),
    [filteredEntries],
  );

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;
    const supabase = createClient();
    void (async () => {
      const [{ data: accounts }, { data: entries }] = await Promise.all([
        supabase.from("trading_accounts").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
        supabase
          .from("journal_entries")
          .select("account_id,r_value,entry_date,created_at,followed_plan,respected_stop,no_revenge_trade")
          .eq("user_id", userId),
      ]);
      if (cancelled) return;
      const accountRows = (accounts ?? []).map((row) => mapTradingAccountRow(row as unknown as Record<string, unknown>));
      const byAccount = new Map<
        string,
        { total: number; wins: number; losses: number; daySet: Set<string>; checksDone: number; checksTotal: number }
      >();
      for (const account of accountRows) {
        byAccount.set(account.id, { total: 0, wins: 0, losses: 0, daySet: new Set(), checksDone: 0, checksTotal: 0 });
      }
      for (const row of entries ?? []) {
        const accountId = String(row.account_id ?? "");
        const bucket = byAccount.get(accountId);
        if (!bucket) continue;
        const pnl = parsePnlAmount(String(row.r_value ?? "")) ?? 0;
        bucket.total += pnl;
        if (pnl > 0) bucket.wins += 1;
        if (pnl < 0) bucket.losses += 1;
        const dayKey = row.entry_date ? String(row.entry_date) : row.created_at ? new Date(String(row.created_at)).toISOString().slice(0, 10) : null;
        if (dayKey) bucket.daySet.add(dayKey);
        if (row.followed_plan != null) {
          bucket.checksTotal += 1;
          if (row.followed_plan) bucket.checksDone += 1;
        }
        if (row.respected_stop != null) {
          bucket.checksTotal += 1;
          if (row.respected_stop) bucket.checksDone += 1;
        }
        if (row.no_revenge_trade != null) {
          bucket.checksTotal += 1;
          if (row.no_revenge_trade) bucket.checksDone += 1;
        }
      }
      setAccountComparisonRows(
        accountRows.map((account) => {
          const b = byAccount.get(account.id)!;
          const directional = b.wins + b.losses;
          return {
            id: account.id,
            name: account.name,
            type: account.accountType,
            pnl: b.total,
            winRate: directional > 0 ? Math.round((b.wins / directional) * 100) : null,
            tradedDays: b.daySet.size,
            disciplineScore: b.checksTotal > 0 ? Math.round((b.checksDone / b.checksTotal) * 100) : null,
          };
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const onExportStatsSummary = () => {
    if (exportBusy) return;
    setExportBusy(true);
    setExportMsg(null);
    try {
      const rows = [
        { metric: "account scope", value: accountScope === "all" ? "all accounts" : "active account" },
        { metric: "rows in scope", value: filteredEntries.length },
        { metric: "net pnl", value: netR },
        { metric: "win rate trades pct", value: stats.winRateTrades ?? "" },
        { metric: "profit factor", value: stats.profitFactor ?? "" },
        { metric: "max drawdown", value: stats.maxDrawdown ?? "" },
        { metric: "avg green day", value: stats.avgGreenDay ?? "" },
        { metric: "avg red day", value: stats.avgRedDay ?? "" },
        { metric: "best day", value: stats.bestDay ? `${stats.bestDay.date} (${stats.bestDay.pnl})` : "" },
        {
          metric: stats.worstDay ? "worst day" : "smallest green day",
          value: stats.worstDay
            ? `${stats.worstDay.date} (${stats.worstDay.pnl})`
            : stats.smallestGreenDay
              ? `${stats.smallestGreenDay.date} (${stats.smallestGreenDay.pnl})`
              : "",
        },
      ];
      const csv = recordsToCsv(
        [
          { key: "metric", label: "metric" },
          { key: "value", label: "value" },
        ],
        rows,
      );
      trackExportCsvClicked("stats_summary", "stats");
      triggerCsvDownload(`blueveno-stats-summary-${fileDate()}.csv`, csv);
      setExportMsg("Stats summary export ready.");
    } catch (error) {
      setExportMsg(error instanceof Error ? error.message : "Could not export stats summary.");
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        variant="signature"
        eyebrow="Performance"
        title="Stats"
        description="Track performance, behavior, and recurring patterns."
        actions={
          <div className="app-page-actions-mobile flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <button type="button" onClick={onExportStatsSummary} className={appSecondaryCta} disabled={exportBusy}>
              <ArrowUpRight className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              {exportBusy ? "Exporting…" : "Export summary CSV"}
            </button>
            <Link href="/app/calendar" className={appSecondaryCta}>
              <CalendarDays className="mr-2 size-4 opacity-90" strokeWidth={1.75} />
              Calendar
            </Link>
          </div>
        }
      />
      <InlineFeedback message={exportMsg} tone={feedbackToneFromMessage(exportMsg)} />

      <section className="space-y-2" aria-label="Stats filters">
        <div className={cn(appFilterShell, "flex items-center justify-between gap-2")}>
          <button type="button" onClick={() => setFiltersOpen((v) => !v)} className="text-[13px] text-zinc-300 hover:text-zinc-100">
            {filtersOpen ? "Hide filters" : "Filters"}
          </button>
          <div className="flex items-center gap-2">
            <select
              value={accountScope}
              onChange={(e) => setAccountScope(e.target.value as "active" | "all")}
              className={cn(appFormSelect, "h-8 text-[12px]")}
            >
              <option value="active">Active account</option>
              <option value="all">All accounts</option>
            </select>
            {hasActiveFilters(filters) ? (
              <button type="button" onClick={() => setFilters(EMPTY_ENTRY_FILTERS)} className="text-[12px] text-[oklch(0.78_0.11_252)] hover:underline">
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
        {filtersOpen ? (
          <div className={cn(appFilterShell, "grid gap-2 sm:grid-cols-2 lg:grid-cols-4")}>
            <Input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Search symbol or note" className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[13px]" />
            <Input type="date" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
            <Input type="date" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className="h-9 rounded-lg border-white/[0.1] bg-black/25 text-[12px]" />
            <select value={filters.dayColor} onChange={(e) => setFilters((f) => ({ ...f, dayColor: e.target.value as EntryFilters["dayColor"] }))} className={appFormSelect}>
              {(Object.keys(DAY_COLOR_FILTER_LABELS) as EntryFilters["dayColor"][]).map((key) => (
                <option key={key} value={key}>
                  {DAY_COLOR_FILTER_LABELS[key]}
                </option>
              ))}
            </select>
            {[
              { key: "symbol", values: uniqueValues(baseEntries, (row) => row.sym) },
              { key: "mood", values: uniqueValues(baseEntries, (row) => row.moodState) },
              { key: "setup", values: uniqueValues(baseEntries, (row) => String(row.setup)) },
              { key: "mistake", values: uniqueValues(baseEntries, (row) => String(row.tag)) },
              { key: "session", values: uniqueValues(baseEntries, (row) => row.sessionTag) },
              { key: "market", values: uniqueValues(baseEntries, (row) => row.marketCondition) },
            ].map((item) => (
              <select
                key={item.key}
                value={filters[item.key as keyof EntryFilters] as string}
                onChange={(e) => setFilters((f) => ({ ...f, [item.key]: e.target.value }))}
                className={appFormSelect}
              >
                <option value="all">{FILTER_DIMENSION_ALL_LABEL[item.key] ?? "All"}</option>
                {item.values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            ))}
          </div>
        ) : null}
        {hasActiveFilters(filters) ? (
          <div className="flex flex-wrap gap-1.5">
            {filterChips(filters).map((chip) => (
              <span key={chip} className="rounded-full border border-[oklch(0.58_0.12_252/0.34)] bg-[oklch(0.58_0.12_252/0.14)] px-2 py-0.5 text-[10px] text-zinc-200">
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </section>


      {!ready ? (
        <div className="h-56 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      ) : baseEntries.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No stats yet"
          description="Add a few trading days to unlock performance and behavior patterns."
          action={
            <Link href="/app/journal" className={cn(appPrimaryCta, "inline-flex items-center gap-1.5")}>
              Log the day
              <ArrowUpRight className="size-4" />
            </Link>
          }
        />
      ) : (
        <>
          <SectionNav
            items={sectionNavItems}
            activeId={activeTab}
            onChange={navigateTab}
            ariaLabel="Stats sections"
            variant="sticky"
            className="app-scroll-tabs-x w-full"
          />

          {filteredEntries.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No results for current filters" description="Clear filters to reveal your full stats view." />
          ) : (
            <div
              key={activeTab}
              role="tabpanel"
              id={`stats-tabpanel-${activeTab}`}
              aria-labelledby={`section-tab-${activeTab}`}
              className="space-y-6"
            >
          {activeTab === "summary" ? (
          <>
          <MonthlyReviewCard
            review={monthlyReview}
            displayCurrency={displayCurrency}
            storageKey={`blueveno:monthly-review:stats:${accountScope}:${monthlyReview.monthKey}`}
            title="Monthly review report"
          />
          <section className="grid gap-5 rounded-2xl border border-[oklch(0.52_0.12_252/0.18)] bg-[linear-gradient(165deg,oklch(0.14_0.038_262/0.94),oklch(0.09_0.03_266/0.92))] p-5 sm:p-6 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] min-[460px]:grid-cols-2 lg:grid-cols-4" aria-label="Summary at a glance">
            <div>
              <p className="app-metric-label">Net P&L</p>
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
              <p className="app-metric-label">Win / loss days</p>
              <p className="font-display mt-2 text-3xl tabular-nums text-zinc-50">
                {stats.winDays}
                <span className="text-zinc-600"> · </span>
                {stats.lossDays}
              </p>
            </div>
            <div>
              <p className="app-metric-label">Streak</p>
              <p className="mt-2 font-display text-lg leading-snug tracking-tight text-zinc-100">{stats.streakLabel}</p>
            </div>
            <div>
              <p className="app-metric-label">Trading days</p>
              <p className="font-display mt-2 text-3xl tabular-nums text-zinc-50">{stats.dailyBars.length}</p>
            </div>
          </section>
          <DashboardCard
            eyebrow="Trend"
            title="Cumulative P&L preview"
            description="Running total for your current filter scope."
            variant="inset"
            className="overflow-hidden"
          >
            <CumulativeChart points={stats.cumulative} currency={displayCurrency} compact />
          </DashboardCard>
          </>
          ) : null}

          {activeTab === "performance" ? (
          <>
          <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Performance extremes">
            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3 sm:col-span-2 xl:col-span-3">
              <p className="app-metric-label">Risk &amp; efficiency</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Max drawdown", value: fmtPnl(stats.maxDrawdown, displayCurrency), tone: stats.maxDrawdown ?? 0 },
                  { label: "Profit factor", value: formatProfitFactor(stats.profitFactor), tone: 0 },
                  { label: "Avg green day", value: fmtPnl(stats.avgGreenDay, displayCurrency), tone: stats.avgGreenDay ?? 0 },
                  { label: "Avg red day", value: fmtPnl(stats.avgRedDay, displayCurrency), tone: stats.avgRedDay ?? 0 },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[11px] text-zinc-500">{item.label}</p>
                    <p className={cn("mt-1 font-display text-xl tabular-nums", item.tone > 0 ? "text-emerald-200" : item.tone < 0 ? "text-rose-200" : "text-zinc-100")}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
              <p className="app-metric-label">Best day</p>
              <p className="mt-1.5 font-display text-lg tabular-nums text-emerald-200">{stats.bestDay ? fmtPnl(stats.bestDay.pnl, displayCurrency) : "—"}</p>
              <p className="mt-1 text-[11px] text-zinc-500">{stats.bestDay?.date ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
              <p className="app-metric-label">{stats.worstDay ? "Worst day" : "Smallest green day"}</p>
              <p className="mt-1.5 font-display text-lg tabular-nums text-rose-200">
                {stats.worstDay ? fmtPnl(stats.worstDay.pnl, displayCurrency) : stats.smallestGreenDay ? fmtPnl(stats.smallestGreenDay.pnl, displayCurrency) : "—"}
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">{stats.worstDay?.date ?? stats.smallestGreenDay?.date ?? "—"}</p>
            </div>
          </section>
          <section className="grid gap-4 sm:grid-cols-2" aria-label="Performance headline">
            {[
              { label: "Net P&L", value: fmtPnl(netR, displayCurrency), tone: netR },
              { label: "Trade win rate", value: stats.winRateTrades !== null ? `${stats.winRateTrades}%` : "—", tone: 0 },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/[0.08] bg-black/20 px-3.5 py-3">
                <p className="app-metric-label">{item.label}</p>
                <p className={cn("mt-1.5 font-display text-[1.2rem] tabular-nums", item.tone > 0 ? "text-emerald-200" : item.tone < 0 ? "text-rose-200" : "text-zinc-100")}>
                  {item.value}
                </p>
              </div>
            ))}
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
            <DashboardCard eyebrow="Days" title="Daily P&amp;L bars" description="One bar per trading day." variant="inset" className="overflow-x-auto">
              <DailyBars bars={stats.dailyBars} currency={displayCurrency} />
            </DashboardCard>
            <DashboardCard eyebrow="Weeks" title="Weekly totals trend" description="Recent weeks at a glance.">
              <WeeklyTrend weekly={stats.weekly} currency={displayCurrency} />
            </DashboardCard>
          </section>
          </>
          ) : null}

          {activeTab === "behavior" ? (
          <>
          <section className="grid gap-4 lg:grid-cols-2" aria-label="Behavior charts">
            <DashboardCard eyebrow="Behavior" title="Mood distribution" description="Which mood appears most often.">
              <MoodDistributionChart moodBreakdown={stats.moodBreakdown} />
            </DashboardCard>
            <DashboardCard eyebrow="Discipline" title="Discipline score trend" description="Weekly score with reflection bonus.">
              <DisciplineTrend weekly={stats.weekly} weeklyReflections={weeklyReflections} />
              <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
                <p className="app-metric-label">Weekly focus</p>
                <p className="mt-1.5 text-[12px] text-zinc-300">
                  Rule: {latestReviewRule?.trim() ? latestReviewRule : "No weekly rule saved yet."}
                </p>
                <p className="mt-1 text-[12px] text-zinc-400">
                  Confidence: {latestReviewConfidence ?? "—"}/5
                </p>
              </div>
            </DashboardCard>
          </section>

          <section aria-label="Behavior insights">
            <DashboardCard
              eyebrow="Behavior insights"
              title="How behavior links to your P&L"
              description="Averages day P&L against mood tags and discipline toggles. Unavailable metrics show as — until enough labeled days exist."
            >
              {behaviorInsightBlockers.length > 0 ? (
                <p className="mb-4 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[12px] text-zinc-400">
                  Some comparisons need more labeled days in your current filter scope. Cards below still show what is available.
                </p>
              ) : null}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  { title: "Avg P&L on Focused days", value: focusedAvg },
                  { title: "Avg P&L on Calm days", value: calmAvg },
                  { title: "Avg P&L when followed plan", value: followedPlanAvg },
                  { title: "Avg P&L when plan was not followed", value: notFollowedPlanAvg },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3.5">
                    <p className="app-kicker">
                      {item.title}
                    </p>
                    <p
                      className={cn(
                        "mt-2 font-display text-2xl tabular-nums tracking-[-0.03em]",
                        item.value === null ? "text-zinc-500" : (item.value ?? 0) >= 0 ? "text-emerald-200" : "text-rose-200",
                      )}
                    >
                      {fmtPnl(item.value, displayCurrency)}
                    </p>
                  </div>
                ))}
                <div className="rounded-xl border border-emerald-400/18 bg-emerald-500/[0.06] px-4 py-3.5">
                  <p className="app-metric-label text-emerald-200/85">Best mood</p>
                  <p className="mt-2 font-display text-2xl tracking-[-0.03em] text-emerald-100">{bestBehavior?.state ?? "—"}</p>
                  <p className="mt-1 text-[12px] text-zinc-400">
                    {bestBehavior ? `${fmtPnl(bestBehavior.avg, displayCurrency)} · ${bestBehavior.sample} entries` : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-400/18 bg-rose-500/[0.06] px-4 py-3.5">
                  <p className="app-metric-label text-rose-200/85">Weakest mood</p>
                  <p className="mt-2 font-display text-2xl tracking-[-0.03em] text-rose-100">{weakestBehavior?.state ?? "—"}</p>
                  <p className="mt-1 text-[12px] text-zinc-400">
                    {weakestBehavior ? `${fmtPnl(weakestBehavior.avg, displayCurrency)} · ${weakestBehavior.sample} entries` : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-black/15 px-4 py-3.5">
                  <p className="app-metric-label">Respected stop vs not</p>
                  <p className="mt-2 text-[12px] text-zinc-300">
                    {fmtPnl(stats.stopRespectedAvg, displayCurrency)} vs {fmtPnl(stats.stopNotRespectedAvg, displayCurrency)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-black/15 px-4 py-3.5">
                  <p className="app-metric-label">No revenge vs revenge</p>
                  <p className="mt-2 text-[12px] text-zinc-300">
                    {fmtPnl(stats.noRevengeAvg, displayCurrency)} vs {fmtPnl(stats.revengeAvg, displayCurrency)}
                  </p>
                </div>
              </div>
            </DashboardCard>
          </section>

          <section aria-label="Rules analytics">
            <DashboardCard eyebrow="Rules" title="Rule adherence and impact" description="How consistently rules are followed and what breaks cost.">
              {rulesAnalytics.rows.length === 0 ? (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 text-sm text-zinc-500">
                  Create active rules in Settings to track adherence here.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/[0.08] bg-black/15 px-3.5 py-3">
                      <p className="app-metric-label">Rule adherence</p>
                      <p className="mt-1.5 text-[13px] text-zinc-100">{rulesAnalytics.adherence !== null ? `${rulesAnalytics.adherence}%` : "—"}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-black/15 px-3.5 py-3">
                      <p className="app-metric-label">Most broken rule</p>
                      <p className="mt-1.5 text-[13px] text-zinc-100">{rulesAnalytics.mostBroken ?? "—"}</p>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-black/15 px-3.5 py-3">
                      <p className="app-metric-label">Rule break cost</p>
                      <p className={cn("mt-1.5 text-[13px] tabular-nums", (rulesAnalytics.breakCost ?? 0) <= 0 ? "text-rose-200" : "text-emerald-200")}>
                        {fmtPnl(rulesAnalytics.breakCost, displayCurrency)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {rulesAnalytics.rows.map((row) => (
                      <div key={row.title} className="rounded-lg border border-white/[0.07] bg-black/15 px-3.5 py-2.5 text-[12px]">
                        <p className="text-zinc-200">{row.title}</p>
                        <p className="mt-1 text-zinc-500">
                          Followed {row.followedPct !== null ? `${row.followedPct}%` : "—"} · {fmtPnl(row.avgFollowed, displayCurrency)} when followed vs {fmtPnl(row.avgBroken, displayCurrency)} when broken
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DashboardCard>
          </section>
          </>
          ) : null}

          {activeTab === "patterns" ? (
          <>
          <section className="grid gap-4 lg:grid-cols-2" aria-label="Weekday and symbol performance">
            <DashboardCard eyebrow="Weekday performance" title="How each weekday performs">
              <div className="space-y-2.5">
                {stats.weekdayPerformance.map((row) => (
                  <div key={row.weekday} className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[12px] text-zinc-300">{row.weekday}</p>
                      <p className={cn("font-mono text-[12px] tabular-nums", row.totalPnl > 0 ? "text-emerald-200" : row.totalPnl < 0 ? "text-rose-200" : "text-zinc-300")}>
                        {fmtPnl(row.totalPnl, displayCurrency)}
                      </p>
                    </div>
                    <p className="mt-1 text-[12px] text-zinc-500">
                      Avg {fmtPnl(row.averagePnl, displayCurrency)} · {row.tradedDays} days
                    </p>
                  </div>
                ))}
                <p className="text-[12px] text-zinc-500">
                  Best: {stats.bestWeekday ?? "—"} · Weakest: {stats.weakestWeekday ?? "—"}
                </p>
              </div>
            </DashboardCard>
            <DashboardCard eyebrow="Symbol performance" title="Ranked by contribution">
              <div className="space-y-2">
                {stats.symbolPerformance.length === 0 ? (
                  <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-[12px] text-zinc-500">
                    No symbol-tagged entries in this scope — totals show as —.
                  </p>
                ) : (
                  stats.symbolPerformance.slice(0, 8).map((row) => (
                    <div key={row.symbol} className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-white/[0.07] bg-black/15 px-3.5 py-2.5">
                      <div>
                        <p className="text-[13px] text-zinc-200">{row.symbol}</p>
                        <p className="text-[11px] text-zinc-500">Avg {fmtPnl(row.averagePnl, displayCurrency)} · {row.entries} entries</p>
                      </div>
                      <p className={cn("font-mono text-[12px] tabular-nums", row.totalPnl > 0 ? "text-emerald-200" : row.totalPnl < 0 ? "text-rose-200" : "text-zinc-300")}>
                        {fmtPnl(row.totalPnl, displayCurrency)}
                      </p>
                    </div>
                  ))
                )}
                <p className="text-[12px] text-zinc-500">
                  Best symbol: {stats.bestSymbol ?? "—"} · Most traded: {stats.mostTradedSymbol ?? "—"}
                </p>
              </div>
            </DashboardCard>
          </section>

          <section className="grid gap-4 lg:grid-cols-2" aria-label="Setup and tag performance">
            <DashboardCard eyebrow="Setup" title="Setup performance">
              <TagPerformanceList
                rows={stats.setupPerformance.map((row) => ({
                  label: row.setup,
                  totalPnl: row.totalPnl,
                  averagePnl: row.averagePnl,
                  entries: row.entries,
                }))}
                currency={displayCurrency}
                emptyLabel="No setup-tagged entries in this scope."
              />
              {stats.bestSetup ? <p className="mt-2 text-[12px] text-zinc-500">Best setup: {stats.bestSetup}</p> : null}
            </DashboardCard>
            <DashboardCard eyebrow="Mistakes" title="Mistake tag performance">
              <TagPerformanceList rows={mistakeTagPerformance} currency={displayCurrency} emptyLabel="No mistake tags logged yet." />
              {stats.mostCommonMistake ? (
                <p className="mt-2 text-[12px] text-zinc-500">
                  Most common: {stats.mostCommonMistake}
                  {stats.mistakeCost !== null && Number.isFinite(stats.mistakeCost)
                    ? ` · cost ${fmtPnl(stats.mistakeCost, displayCurrency)}`
                    : ""}
                </p>
              ) : null}
            </DashboardCard>
            <DashboardCard eyebrow="Session" title="Session tag performance">
              <TagPerformanceList rows={sessionTagPerformance} currency={displayCurrency} emptyLabel="No session tags in this scope." />
            </DashboardCard>
            <DashboardCard eyebrow="Market" title="Market condition performance">
              <TagPerformanceList rows={marketConditionPerformance} currency={displayCurrency} emptyLabel="No market conditions in this scope." />
            </DashboardCard>
          </section>
          </>
          ) : null}

          {activeTab === "accounts" ? (
          <>
          <section aria-label="Account comparison">
            <DashboardCard eyebrow="Accounts" title="Account comparison" description="Compare net P&amp;L and discipline across your trading accounts.">
              <AccountComparisonTable rows={accountComparisonRows} currency={displayCurrency} />
            </DashboardCard>
          </section>
          </>
          ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}