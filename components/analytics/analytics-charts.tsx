"use client";

import { useId, useState } from "react";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import type { WeeklyReflectionStat } from "@/lib/user-data/trading-stats";
import { cn } from "@/lib/utils";

function fmtPnl(n: number | null, currency: string) {
  if (n === null || !Number.isFinite(n)) return "—";
  return formatSignedPnlAmount(n, currency);
}

export function CumulativeChart({
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

export function DailyBars({ bars, currency }: { bars: { date: string; pnl: number }[]; currency: string }) {
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

export function WeeklyTrend({ weekly, currency }: { weekly: { label: string; total: number }[]; currency: string }) {
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

export function MoodDistributionChart({
  moodBreakdown,
}: {
  moodBreakdown: { calm: number; focused: number; hesitant: number; tilted: number };
}) {
  const rows = [
    { label: "Calm", value: moodBreakdown.calm, color: "oklch(0.58 0.12 200)" },
    { label: "Focused", value: moodBreakdown.focused, color: "oklch(0.72 0.12 252)" },
    { label: "Hesitant", value: moodBreakdown.hesitant, color: "oklch(0.69 0.11 90)" },
    { label: "Tilted", value: moodBreakdown.tilted, color: "oklch(0.58 0.16 20)" },
  ];
  const total = rows.reduce((sum, r) => sum + r.value, 0);
  if (total === 0) {
    return (
      <p className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-8 text-center text-[13px] text-zinc-500">
        Log mood on a few days to see how your state shows up.
      </p>
    );
  }

  let offset = 0;
  const slices = rows
    .filter((r) => r.value > 0)
    .map((row) => {
      const pct = row.value / total;
      const start = offset;
      offset += pct;
      return { ...row, start, end: offset };
    });
  const gradient = slices
    .map((s) => `${s.color} ${(s.start * 100).toFixed(2)}% ${(s.end * 100).toFixed(2)}%`)
    .join(", ");

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
      <div
        className="relative mx-auto size-[9.5rem] rounded-full sm:mx-0"
        style={{ background: `conic-gradient(${gradient})` }}
        role="img"
        aria-label="Mood distribution chart"
      >
        <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-[oklch(0.1_0.035_266/0.98)] ring-1 ring-white/[0.08]">
          <p className="font-display text-[1.75rem] font-semibold tabular-nums text-zinc-50">{total}</p>
          <p className="text-[12px] text-zinc-500">entries</p>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map((row) => {
          const pct = Math.round((row.value / total) * 100);
          return (
            <div key={row.label} className="flex items-center gap-3">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <p className="text-zinc-200">{row.label}</p>
                  <p className="tabular-nums text-zinc-400">
                    {row.value} <span className="text-zinc-600">({pct}%)</span>
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: row.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DisciplineTrend({ weekly, weeklyReflections }: { weekly: { weekStart: string; label: string; total: number }[]; weeklyReflections: WeeklyReflectionStat[] }) {
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

