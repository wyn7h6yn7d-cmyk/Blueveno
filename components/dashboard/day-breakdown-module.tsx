"use client";

import type { ReactNode } from "react";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";
import { DayRangeIndicator } from "@/components/analytics/day-range-indicator";
import { GreenRedRatioBar } from "@/components/analytics/green-red-ratio-bar";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { appCardPrimary, appMetricLabel } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type Props = {
  hasEntries: boolean;
  displayCurrency: string;
  tradedDays: number;
  winningDays: number;
  losingDays: number;
  averageDay: number | null;
  bestDay: number | null;
  lossMetricLabel: string;
  lossMetricValue: number | null;
  avgGreenDay: number | null;
  avgRedDay: number | null;
  streakRaw: string;
};

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

function CompactStat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className={appMetricLabel}>{label}</p>
      <div className="mt-1.5 text-[15px] font-semibold leading-none tracking-tight text-zinc-100 sm:text-[16px]">
        {children}
      </div>
    </div>
  );
}

export function DayBreakdownModule({
  hasEntries,
  displayCurrency,
  tradedDays,
  winningDays,
  losingDays,
  averageDay,
  bestDay,
  lossMetricLabel,
  lossMetricValue,
  avgGreenDay,
  avgRedDay,
  streakRaw,
}: Props) {
  const greenDayShare =
    hasEntries && tradedDays > 0 ? Math.round((winningDays / tradedDays) * 100) : null;
  const streak = hasEntries ? parseStreak(streakRaw) : parseStreak("");
  const streakProgress =
    hasEntries && tradedDays > 0 && streak.days > 0
      ? Math.min(100, Math.round((streak.days / tradedDays) * 100))
      : 0;

  return (
    <section
      className={cn(
        appCardPrimary,
        "overflow-hidden px-5 py-5 shadow-[0_0_48px_-28px_oklch(0.48_0.14_252/0.45)] sm:px-7 sm:py-6",
      )}
      aria-label="Day breakdown"
    >
      <header className="flex flex-col gap-3 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-[1.2rem] font-semibold tracking-[-0.03em] text-zinc-50 sm:text-[1.3rem]">
            Day breakdown
          </h2>
          <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-zinc-500">
            Average result, day mix, range, and momentum from your logged days.
          </p>
        </div>
        {greenDayShare !== null ? (
          <p className="text-[13px] text-zinc-400">
            <span className="tabular-nums font-medium text-emerald-200">{greenDayShare}%</span> green days
          </p>
        ) : null}
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0">
          <p className={appMetricLabel}>Average day</p>
          <p
            className={cn(
              "font-display mt-2 text-[2.35rem] leading-none tabular-nums tracking-[-0.04em] sm:text-[2.85rem]",
              pnlClass(hasEntries ? averageDay : null),
            )}
          >
            {hasEntries ? moneyOrDash(averageDay, displayCurrency) : "—"}
          </p>
          <p className="mt-2 text-[14px] text-zinc-500">
            {hasEntries
              ? `Across ${tradedDays} traded day${tradedDays === 1 ? "" : "s"}`
              : "Log days to see your average"}
          </p>
          {hasEntries ? (
            <div className="mt-5 max-w-md">
              <GreenRedRatioBar green={winningDays} red={losingDays} />
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <CompactStat label="Traded days">
            <span className="tabular-nums">{hasEntries ? tradedDays : "—"}</span>
          </CompactStat>
          <CompactStat label="Green / red">
            {hasEntries ? (
              <span className="inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums">
                <span className="text-emerald-200">{winningDays}</span>
                <span className="text-[13px] font-normal text-zinc-600">green /</span>
                <span className="text-rose-200">{losingDays}</span>
                <span className="text-[13px] font-normal text-zinc-600">red</span>
              </span>
            ) : (
              <span className="text-zinc-500">—</span>
            )}
          </CompactStat>
          <div className="sm:col-span-2">
            <p className={appMetricLabel}>Best vs worst</p>
            <div className="mt-3">
              <DayRangeIndicator
                best={hasEntries ? bestDay : null}
                worst={hasEntries ? lossMetricValue : null}
                currency={displayCurrency}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 border-t border-white/[0.06] pt-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <p className={appMetricLabel}>Avg green day</p>
            <p className={cn("mt-1.5 font-display text-xl tabular-nums tracking-tight", pnlClass(avgGreenDay))}>
              {hasEntries ? moneyOrDash(avgGreenDay, displayCurrency) : "—"}
            </p>
          </div>
          <div className="min-w-0">
            <p className={appMetricLabel}>Avg red day</p>
            <p className={cn("mt-1.5 font-display text-xl tabular-nums tracking-tight", pnlClass(avgRedDay))}>
              {hasEntries ? moneyOrDash(avgRedDay, displayCurrency) : "—"}
            </p>
          </div>
        </div>

        <div className="min-w-[11rem] lg:text-right">
          <p className={appMetricLabel}>Current streak</p>
          <p
            className={cn(
              "mt-1.5 text-[17px] font-semibold tracking-tight",
              streak.variant === "green" && "text-emerald-200",
              streak.variant === "red" && "text-rose-200",
              streak.variant === "neutral" && "text-zinc-400",
            )}
          >
            {hasEntries ? streak.title : "—"}
          </p>
          <p className="mt-0.5 text-[13px] text-zinc-500">{hasEntries ? streak.detail : "No momentum yet"}</p>
          <div className="mt-3 lg:ml-auto lg:max-w-[12rem]">
            <MiniSparkline positive={streak.variant !== "red"} />
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  streak.variant === "green" && "bg-emerald-400/80",
                  streak.variant === "red" && "bg-rose-400/80",
                  streak.variant === "neutral" && "bg-zinc-600/50",
                )}
                style={{ width: hasEntries ? `${streakProgress}%` : "0%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
