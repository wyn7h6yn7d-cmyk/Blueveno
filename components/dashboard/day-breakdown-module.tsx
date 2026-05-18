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
      detail: days === 1 ? "1d" : `${days}d`,
      days,
    };
  }
  const red = raw.match(/(\d+)\s+red/i);
  if (red) {
    const days = Number(red[1]);
    return {
      variant: "red",
      title: "Red streak",
      detail: days === 1 ? "1d" : `${days}d`,
      days,
    };
  }
  return { variant: "neutral", title: "—", detail: "—", days: 0 };
}

function SupportItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2 whitespace-nowrap">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-600">{label}</span>
      <span className="truncate font-display text-[15px] font-semibold tabular-nums tracking-tight sm:text-[16px]">
        {children}
      </span>
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
  const lossLabelShort = lossMetricLabel === "Smallest green day" ? "Smallest +" : "Worst";

  return (
    <section
      className={cn(
        appCardPrimary,
        "relative overflow-hidden px-5 py-5 sm:px-7 sm:py-6",
        "shadow-[0_0_56px_-30px_oklch(0.48_0.14_252/0.48)]",
      )}
      aria-label="Day breakdown"
    >
      <div
        className="pointer-events-none absolute -right-16 top-0 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.48_0.14_252/0.14),transparent_68%)]"
        aria-hidden
      />

      <header className="relative flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-[1.15rem] font-semibold tracking-[-0.03em] text-zinc-50 sm:text-[1.22rem]">
            Day breakdown
          </h2>
          <p className="mt-0.5 hidden text-[13px] text-zinc-600 sm:block">
            Average · split · momentum
          </p>
        </div>
      </header>

      {/* Main composition */}
      <div className="relative mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(10.5rem,auto)_minmax(5.5rem,6.5rem)] lg:gap-5 xl:gap-8">
        {/* Hero — average + trend */}
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">Average day</p>
          <p
            className={cn(
              "font-display mt-1 text-[2.5rem] leading-[0.95] tabular-nums tracking-[-0.045em] sm:text-[3rem]",
              pnlClass(hasEntries ? averageDay : null),
            )}
          >
            {hasEntries ? moneyOrDash(averageDay, displayCurrency) : "—"}
          </p>
          <p className="mt-1.5 whitespace-nowrap text-[13px] tabular-nums text-zinc-600">
            {hasEntries ? `${tradedDays} traded days` : "Log days to begin"}
          </p>
          <div className="mt-5 h-11 w-full max-w-[15rem] opacity-90">
            <PnlTrendSparkline points={trendPoints} height={44} />
          </div>
        </div>

        {/* Donut — dominant visual */}
        <div className="flex flex-col items-center justify-self-center">
          <DonutMetric
            green={hasEntries ? winningDays : 0}
            red={hasEntries ? losingDays : 0}
            size="lg"
            legend="inline"
            className="[&_p]:text-zinc-50"
          />
          {hasEntries && (avgGreenDay !== null || avgRedDay !== null) ? (
            <p className="mt-2 flex max-w-full items-center justify-center gap-3 whitespace-nowrap text-[12px] tabular-nums">
              {avgGreenDay !== null ? (
                <span className="text-emerald-300/85">{moneyOrDash(avgGreenDay, displayCurrency)}</span>
              ) : null}
              {avgGreenDay !== null && avgRedDay !== null ? (
                <span className="size-0.5 rounded-full bg-zinc-700" aria-hidden />
              ) : null}
              {avgRedDay !== null ? (
                <span className="text-rose-300/85">{moneyOrDash(avgRedDay, displayCurrency)}</span>
              ) : null}
            </p>
          ) : null}
        </div>

        {/* Streak — compact insight */}
        <div
          className={cn(
            "flex flex-col items-center border-t border-white/[0.06] pt-6 lg:border-l lg:border-t-0 lg:items-end lg:justify-self-center lg:pl-6 lg:pt-0",
            streak.variant === "green" && "border-emerald-500/25 lg:border-emerald-500/20",
            streak.variant === "red" && "border-rose-500/25 lg:border-rose-500/20",
          )}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">Streak</p>
          <p
            className={cn(
              "mt-1 max-w-[6.5rem] truncate font-display text-[1.35rem] font-semibold leading-none tracking-tight sm:max-w-none sm:text-[1.5rem]",
              streak.variant === "green" && "text-emerald-200",
              streak.variant === "red" && "text-rose-200",
              streak.variant === "neutral" && "text-zinc-500",
            )}
          >
            {hasEntries ? streak.title : "—"}
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[13px] tabular-nums text-zinc-500">
            {hasEntries ? streak.detail : "—"}
          </p>
          <div className="mt-3 flex items-end gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => {
              const active = hasEntries && i >= 5 - Math.min(streak.days, 5);
              return (
                <span
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all",
                    active && streak.variant === "green" && "bg-emerald-400/90",
                    active && streak.variant === "red" && "bg-rose-400/90",
                    active && streak.variant === "neutral" && "bg-zinc-600",
                    !active && "bg-white/[0.08]",
                    active ? "h-5" : "h-2.5",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Support strip — one line, no boxes */}
      <div className="relative mt-7 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-8 sm:gap-y-2">
        <SupportItem label="Best">
          <span className={pnlClass(hasEntries ? bestDay : null)}>
            {hasEntries ? moneyOrDash(bestDay, displayCurrency) : "—"}
          </span>
        </SupportItem>
        <SupportItem label={lossLabelShort}>
          <span className={pnlClass(hasEntries ? lossMetricValue : null)}>
            {hasEntries ? moneyOrDash(lossMetricValue, displayCurrency) : "—"}
          </span>
        </SupportItem>
        <SupportItem label="Days">
          <span className="text-zinc-100">{hasEntries ? tradedDays : "—"}</span>
        </SupportItem>
        <SupportItem label="Win">
          <span className="text-zinc-100">
            {hasEntries && winRate !== null && Number.isFinite(winRate) ? `${Math.round(winRate)}%` : "—"}
          </span>
        </SupportItem>
      </div>
    </section>
  );
}
