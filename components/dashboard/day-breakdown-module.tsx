"use client";

import type { ReactNode } from "react";
import { DonutMetric } from "@/components/analytics/donut-metric";
import { PnlTrendSparkline } from "@/components/analytics/pnl-trend-sparkline";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { appCardShell, appInnerPanel } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type Props = {
  hasEntries: boolean;
  displayCurrency: string;
  tradedDays: number;
  winningDays: number;
  losingDays: number;
  winRate: number | null;
  averageDay: number | null;
  bestDay: number | null;
  lossMetricLabel: string;
  lossMetricValue: number | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  streakRaw: string;
  dailyPnls: number[];
};

const softPanel = cn(appInnerPanel, "bg-white/[0.02]");

function moneyOrDash(value: number | null, currency: string): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return formatSignedPnlAmount(value, currency);
}

function pnlClass(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value) || value === 0) {
    return "text-zinc-50";
  }
  return value > 0 ? "text-emerald-200" : "text-rose-200";
}

function parseStreak(raw: string): {
  variant: "green" | "red" | "neutral";
  title: string;
  detail: string;
  days: number;
} {
  const green = raw.match(/(\d+)\s+green/i);
  if (green) {
    const days = Number(green[1]);
    return {
      variant: "green",
      title: "Green streak",
      detail: days === 1 ? "1 day" : `${days} days`,
      days,
    };
  }
  const red = raw.match(/(\d+)\s+red/i);
  if (red) {
    const days = Number(red[1]);
    return {
      variant: "red",
      title: "Red streak",
      detail: days === 1 ? "1 day" : `${days} days`,
      days,
    };
  }
  return { variant: "neutral", title: "—", detail: "No active run", days: 0 };
}

function CompactRangeLine({ best, worst }: { best: number | null; worst: number | null }) {
  const bestVal = best !== null && Number.isFinite(best) ? best : null;
  const worstVal = worst !== null && Number.isFinite(worst) ? worst : null;
  if (bestVal === null && worstVal === null) return null;

  const span = Math.max(Math.abs(bestVal ?? 0), Math.abs(worstVal ?? 0), 1);
  const bestPos = bestVal !== null ? 50 + (bestVal / span) * 46 : 50;
  const worstPos = worstVal !== null ? 50 - (Math.abs(Math.min(worstVal, 0)) / span) * 46 : 50;

  return (
    <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/15 to-transparent"
        aria-hidden
      />
      {bestVal !== null ? (
        <span
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_10px_oklch(0.5_0.14_155/0.55)]"
          style={{ left: `${Math.min(94, Math.max(6, bestPos))}%` }}
        />
      ) : null}
      {worstVal !== null ? (
        <span
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400 shadow-[0_0_10px_oklch(0.5_0.15_15/0.5)]"
          style={{ left: `${Math.min(94, Math.max(6, worstPos))}%` }}
        />
      ) : null}
    </div>
  );
}

function MetricPill({
  label,
  children,
  valueClassName,
}: {
  label: string;
  children: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-lg bg-white/[0.035] px-2.5 py-2 ring-1 ring-inset ring-white/[0.05] sm:px-3 sm:py-2.5">
      <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.11em] text-zinc-600">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 whitespace-nowrap font-display text-[14px] font-semibold tabular-nums tracking-tight text-zinc-50 sm:text-[15px]",
          valueClassName,
        )}
      >
        {children}
      </p>
    </div>
  );
}

export function DayBreakdownModule({
  hasEntries,
  displayCurrency,
  tradedDays,
  winningDays,
  losingDays,
  winRate,
  averageDay,
  bestDay,
  lossMetricLabel,
  lossMetricValue,
  avgGreenDay,
  avgRedDay,
  streakRaw,
  dailyPnls,
}: Props) {
  const streak = hasEntries ? parseStreak(streakRaw) : parseStreak("");
  const trendPoints = dailyPnls.filter((p) => Number.isFinite(p)).slice(-14);
  const trendPositive = averageDay !== null && Number.isFinite(averageDay) ? averageDay >= 0 : true;
  const directionalDays = winningDays + losingDays;
  const greenDayPct =
    hasEntries && directionalDays > 0
      ? Math.round((winningDays / directionalDays) * 100)
      : hasEntries && tradedDays > 0
        ? Math.round((winningDays / tradedDays) * 100)
        : null;

  return (
    <section
      className={cn(appCardShell, "relative overflow-hidden px-3.5 py-3 sm:px-4 sm:py-3.5")}
      aria-label="Day breakdown"
    >
      <header className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[1.05rem] font-semibold tracking-[-0.03em] text-zinc-50">
            Day breakdown
          </h2>
          <p className="mt-0.5 truncate text-[12px] text-zinc-500">
            Average result, green/red split, and current momentum.
          </p>
        </div>
        {greenDayPct !== null ? (
          <span className="shrink-0 whitespace-nowrap rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-emerald-200/95 shadow-[0_0_20px_-8px_oklch(0.42_0.16_155/0.5)]">
            {greenDayPct}% green days
          </span>
        ) : null}
      </header>

      {!hasEntries ? (
        <div className={cn("relative mt-2.5 px-3 py-7 text-center", softPanel)}>
          <p className="text-[14px] text-zinc-400">No days yet</p>
          <p className="mt-0.5 text-[12px] text-zinc-600">Log trading days to unlock this view.</p>
        </div>
      ) : (
        <>
          <div className="relative mt-2.5 grid grid-cols-1 gap-2 lg:grid-cols-3">
            {/* Left — average hero */}
            <div className={cn("flex min-h-0 flex-col justify-center px-3.5 py-3", softPanel)}>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Average day</p>
              <p
                className={cn(
                  "font-display mt-0.5 text-[1.75rem] leading-none tabular-nums tracking-[-0.04em] sm:text-[1.95rem]",
                  pnlClass(averageDay),
                )}
              >
                {moneyOrDash(averageDay, displayCurrency)}
              </p>
              <p className="mt-0.5 whitespace-nowrap text-[12px] text-zinc-500">
                Across {tradedDays} traded day{tradedDays === 1 ? "" : "s"}
              </p>
              <div className="mt-2.5 w-full rounded-lg bg-black/15 px-1 pt-1">
                <PnlTrendSparkline points={trendPoints} height={50} positive={trendPositive} className="w-full" />
              </div>
            </div>

            {/* Center — donut centerpiece */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center px-3 py-3 text-center",
                softPanel,
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,oklch(0.48_0.14_252/0.14),transparent_62%)]"
                aria-hidden
              />
              <div className="relative">
                <DonutMetric green={winningDays} red={losingDays} size="md" legend={false} />
              </div>
              <div className="relative mt-2 flex items-center justify-center gap-4 text-[11px] tabular-nums">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-emerald-300/95">
                  <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_oklch(0.5_0.14_155/0.45)]" aria-hidden />
                  {winningDays} green
                </span>
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-rose-300/95">
                  <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_oklch(0.5_0.15_15/0.4)]" aria-hidden />
                  {losingDays} red
                </span>
              </div>
              {(avgGreenDay !== null || avgRedDay !== null) && (
                <p className="relative mt-1.5 whitespace-nowrap text-[11px] tabular-nums text-zinc-500">
                  {avgGreenDay !== null ? (
                    <>
                      avg green{" "}
                      <span className="text-emerald-300/90">{moneyOrDash(avgGreenDay, displayCurrency)}</span>
                    </>
                  ) : null}
                  {avgGreenDay !== null && avgRedDay !== null ? (
                    <span className="mx-1.5 text-zinc-700">·</span>
                  ) : null}
                  {avgRedDay !== null ? (
                    <>
                      avg red <span className="text-rose-300/90">{moneyOrDash(avgRedDay, displayCurrency)}</span>
                    </>
                  ) : null}
                </p>
              )}
            </div>

            {/* Right — streak + range */}
            <div className={cn("flex flex-col justify-center px-3.5 py-3", softPanel)}>
              <div>
                <span
                  className={cn(
                    "inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium",
                    streak.variant === "green" &&
                      "border border-emerald-400/25 bg-emerald-500/12 text-emerald-200/95",
                    streak.variant === "red" && "border border-rose-400/25 bg-rose-500/12 text-rose-200/95",
                    streak.variant === "neutral" && "border border-white/10 bg-white/[0.04] text-zinc-500",
                  )}
                >
                  Active streak
                </span>
                <p
                  className={cn(
                    "mt-2 whitespace-nowrap font-display text-[1.35rem] font-semibold leading-none tracking-tight sm:text-[1.45rem]",
                    streak.variant === "green" && "text-emerald-200",
                    streak.variant === "red" && "text-rose-200",
                    streak.variant === "neutral" && "text-zinc-400",
                  )}
                >
                  {streak.title}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="whitespace-nowrap text-[13px] text-zinc-500">{streak.detail}</p>
                  <div className="flex items-end gap-1" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const active = i >= 5 - Math.min(streak.days, 5);
                      return (
                        <span
                          key={i}
                          className={cn(
                            "w-2 rounded-full transition-all",
                            active && streak.variant === "green" && "bg-emerald-400 shadow-[0_0_10px_oklch(0.5_0.14_155/0.5)]",
                            active && streak.variant === "red" && "bg-rose-400 shadow-[0_0_10px_oklch(0.5_0.15_15/0.45)]",
                            active && streak.variant === "neutral" && "bg-zinc-500",
                            !active && "bg-white/[0.08]",
                            active ? "h-5" : "h-2",
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t border-white/[0.05] pt-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Range</p>
                <div className="mt-1.5 flex items-baseline justify-between gap-2 whitespace-nowrap text-[12px] tabular-nums">
                  <span className="text-zinc-500">
                    best{" "}
                    <span className={cn("font-medium", pnlClass(bestDay))}>
                      {moneyOrDash(bestDay, displayCurrency)}
                    </span>
                  </span>
                  <span className="text-zinc-500">
                    {lossMetricLabel === "Smallest green day" ? "smallest" : "worst"}{" "}
                    <span className={cn("font-medium", pnlClass(lossMetricValue))}>
                      {moneyOrDash(lossMetricValue, displayCurrency)}
                    </span>
                  </span>
                </div>
                <CompactRangeLine best={bestDay} worst={lossMetricValue} />
              </div>
            </div>
          </div>

          {/* Metric pills */}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricPill label="Traded days">{tradedDays}</MetricPill>
            <MetricPill label="Win rate">
              {winRate !== null && Number.isFinite(winRate) ? `${Math.round(winRate)}%` : "—"}
            </MetricPill>
            <MetricPill label="Best day" valueClassName={pnlClass(bestDay)}>
              {moneyOrDash(bestDay, displayCurrency)}
            </MetricPill>
            <MetricPill label={lossMetricLabel} valueClassName={pnlClass(lossMetricValue)}>
              {moneyOrDash(lossMetricValue, displayCurrency)}
            </MetricPill>
          </div>
        </>
      )}
    </section>
  );
}
