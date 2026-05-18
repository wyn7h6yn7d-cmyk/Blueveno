"use client";

import type { ReactNode } from "react";
import { DonutMetric } from "@/components/analytics/donut-metric";
import { PnlTrendSparkline } from "@/components/analytics/pnl-trend-sparkline";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { appCardPrimary } from "@/lib/ui/app-surface";
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

const zone =
  "flex min-h-0 min-w-0 flex-col justify-center px-3 py-2.5 sm:px-3.5 sm:py-3";

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
  const bestPos = bestVal !== null ? 50 + (bestVal / span) * 48 : 50;
  const worstPos = worstVal !== null ? 50 - (Math.abs(Math.min(worstVal, 0)) / span) * 48 : 50;

  return (
    <div className="relative mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/[0.1]" aria-hidden />
      {bestVal !== null ? (
        <span
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400"
          style={{ left: `${Math.min(94, Math.max(6, bestPos))}%` }}
        />
      ) : null}
      {worstVal !== null ? (
        <span
          className="absolute top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400"
          style={{ left: `${Math.min(94, Math.max(6, worstPos))}%` }}
        />
      ) : null}
    </div>
  );
}

function StripCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 flex-1 px-2 py-2 text-center sm:px-3">
      <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-600">{label}</p>
      <p className="mt-0.5 whitespace-nowrap font-display text-[14px] font-semibold tabular-nums tracking-tight text-zinc-50">
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
  const directionalDays = winningDays + losingDays;
  const greenDayPct =
    hasEntries && directionalDays > 0
      ? Math.round((winningDays / directionalDays) * 100)
      : hasEntries && tradedDays > 0
        ? Math.round((winningDays / tradedDays) * 100)
        : null;
  return (
    <section
      className={cn(
        appCardPrimary,
        "relative overflow-hidden px-3.5 py-3 sm:px-4 sm:py-3.5",
        "bg-[linear-gradient(158deg,oklch(0.2_0.048_258/0.98),oklch(0.11_0.034_264/0.99))]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.1),0_0_40px_-22px_oklch(0.45_0.14_252/0.42)]",
      )}
      aria-label="Day breakdown"
    >
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-24 bg-[radial-gradient(ellipse_at_top,oklch(0.48_0.14_252/0.1),transparent_70%)]"
        aria-hidden
      />

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
          <span className="shrink-0 whitespace-nowrap rounded-full border border-emerald-400/22 bg-emerald-500/[0.09] px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-emerald-200/95">
            {greenDayPct}% green
          </span>
        ) : null}
      </header>

      {!hasEntries ? (
        <div className="relative mt-2.5 rounded-lg bg-white/[0.02] px-3 py-7 text-center ring-1 ring-inset ring-white/[0.06]">
          <p className="text-[14px] text-zinc-400">No days yet</p>
          <p className="mt-0.5 text-[12px] text-zinc-600">Log trading days to unlock this view.</p>
        </div>
      ) : (
        <>
          {/* Unified 3-zone widget */}
          <div
            className={cn(
              "relative mt-2.5 overflow-hidden rounded-xl",
              "bg-[linear-gradient(165deg,oklch(0.14_0.038_262/0.5),oklch(0.1_0.03_266/0.35))]",
              "ring-1 ring-inset ring-white/[0.07]",
            )}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:divide-x lg:divide-white/[0.06]">
              {/* Zone 1 — average */}
              <div className={zone}>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Average day</p>
                <p
                  className={cn(
                    "font-display mt-0.5 text-[1.65rem] leading-none tabular-nums tracking-[-0.04em] sm:text-[1.85rem]",
                    pnlClass(averageDay),
                  )}
                >
                  {moneyOrDash(averageDay, displayCurrency)}
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[12px] text-zinc-500">
                  Across {tradedDays} traded day{tradedDays === 1 ? "" : "s"}
                </p>
                <div className="mt-2 w-full">
                  <PnlTrendSparkline points={trendPoints} height={38} className="w-full" />
                </div>
              </div>

              {/* Zone 2 — donut */}
              <div className={cn(zone, "items-center text-center")}>
                <DonutMetric green={winningDays} red={losingDays} size="sm" legend={false} />
                <div className="mt-1.5 flex items-center justify-center gap-3 text-[11px] tabular-nums">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-emerald-300/90">
                    <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
                    {winningDays} green
                  </span>
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-rose-300/90">
                    <span className="size-1.5 rounded-full bg-rose-400" aria-hidden />
                    {losingDays} red
                  </span>
                </div>
                {(avgGreenDay !== null || avgRedDay !== null) && (
                  <p className="mt-1 whitespace-nowrap text-[11px] tabular-nums text-zinc-500">
                    {avgGreenDay !== null ? (
                      <span className="text-emerald-300/85">{moneyOrDash(avgGreenDay, displayCurrency)}</span>
                    ) : null}
                    {avgGreenDay !== null && avgRedDay !== null ? (
                      <span className="mx-1 text-zinc-700">/</span>
                    ) : null}
                    {avgRedDay !== null ? (
                      <span className="text-rose-300/85">{moneyOrDash(avgRedDay, displayCurrency)}</span>
                    ) : null}
                  </p>
                )}
              </div>

              {/* Zone 3 — streak + range */}
              <div className={zone}>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Current streak</p>
                <p
                  className={cn(
                    "mt-0.5 whitespace-nowrap font-display text-[1.1rem] font-semibold leading-tight tracking-tight",
                    streak.variant === "green" && "text-emerald-200",
                    streak.variant === "red" && "text-rose-200",
                    streak.variant === "neutral" && "text-zinc-400",
                  )}
                >
                  {streak.title}
                </p>
                <div className="flex items-center gap-2">
                  <p className="whitespace-nowrap text-[12px] text-zinc-500">{streak.detail}</p>
                  <div className="flex items-end gap-0.5" aria-hidden>
                    {Array.from({ length: 5 }).map((_, i) => {
                      const active = i >= 5 - Math.min(streak.days, 5);
                      return (
                        <span
                          key={i}
                          className={cn(
                            "w-1 rounded-full",
                            active && streak.variant === "green" && "bg-emerald-400/90",
                            active && streak.variant === "red" && "bg-rose-400/90",
                            active && streak.variant === "neutral" && "bg-zinc-600",
                            !active && "bg-white/[0.08]",
                            active ? "h-3" : "h-1.5",
                          )}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="mt-2.5 border-t border-white/[0.06] pt-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Range</p>
                  <div className="mt-1 flex items-baseline justify-between gap-1 whitespace-nowrap text-[11px] tabular-nums">
                    <span className="text-zinc-500">
                      <span className={cn("font-medium", pnlClass(bestDay))}>
                        {moneyOrDash(bestDay, displayCurrency)}
                      </span>
                    </span>
                    <span className="text-zinc-500">
                      <span className={cn("font-medium", pnlClass(lossMetricValue))}>
                        {moneyOrDash(lossMetricValue, displayCurrency)}
                      </span>
                    </span>
                  </div>
                  <CompactRangeLine best={bestDay} worst={lossMetricValue} />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom strip */}
          <div className="mt-2 flex divide-x divide-white/[0.06] rounded-lg bg-white/[0.02] ring-1 ring-inset ring-white/[0.05]">
            <StripCell label="Traded days">{tradedDays}</StripCell>
            <StripCell label="Win rate">
              {winRate !== null && Number.isFinite(winRate) ? `${Math.round(winRate)}%` : "—"}
            </StripCell>
            <StripCell label="Best day">
              <span className={pnlClass(bestDay)}>{moneyOrDash(bestDay, displayCurrency)}</span>
            </StripCell>
            <StripCell label={lossMetricLabel}>
              <span className={pnlClass(lossMetricValue)}>{moneyOrDash(lossMetricValue, displayCurrency)}</span>
            </StripCell>
          </div>
        </>
      )}
    </section>
  );
}
