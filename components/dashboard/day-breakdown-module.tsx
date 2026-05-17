"use client";

import type { ReactNode } from "react";
import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { appCardPrimary, appKicker, appMetricLabel } from "@/lib/ui/app-surface";
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
      <p className={cn(appKicker, "whitespace-nowrap")}>{label}</p>
      <div className="mt-1.5 text-[15px] font-semibold leading-none tracking-tight text-zinc-100 sm:text-[16px]">
        {children}
      </div>
    </div>
  );
}

function GreenRedSplit({ green, red, empty }: { green: number; red: number; empty: boolean }) {
  if (empty) return <span className="text-zinc-500">—</span>;
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap tabular-nums">
      <span className="text-emerald-200/95">{green}</span>
      <span className="text-[13px] font-normal text-zinc-600">green /</span>
      <span className="text-rose-200/95">{red}</span>
      <span className="text-[13px] font-normal text-zinc-600">red</span>
    </span>
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
      className={cn(appCardPrimary, "overflow-hidden px-5 py-5 sm:px-7 sm:py-6")}
      aria-label="Day breakdown"
    >
      <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <h2 className="font-display text-[1.15rem] font-semibold tracking-[-0.03em] text-zinc-50 sm:text-[1.25rem]">
            Day breakdown
          </h2>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-zinc-500">
            Your logged days, average result, range, and current momentum.
          </p>
        </div>
        {greenDayShare !== null ? (
          <p
            className={cn(
              "inline-flex shrink-0 items-center self-start rounded-full px-3 py-1.5 text-[12px] font-medium",
              "border border-emerald-400/20 bg-emerald-500/[0.08] text-zinc-300",
            )}
          >
            <span className="tabular-nums text-emerald-200">{greenDayShare}%</span>
            <span className="ml-1.5 text-zinc-500">green days</span>
          </p>
        ) : null}
      </header>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(10.5rem,12.5rem)] lg:gap-8 lg:items-stretch">
        <div className="min-w-0 lg:py-1">
          <p className={appMetricLabel}>Average day</p>
          <p
            className={cn(
              "font-display mt-2.5 text-[2.15rem] leading-none tabular-nums tracking-[-0.04em] sm:text-[2.65rem]",
              pnlClass(hasEntries ? averageDay : null),
            )}
          >
            {hasEntries ? moneyOrDash(averageDay, displayCurrency) : "—"}
          </p>
          <p className="mt-2.5 text-[13px] text-zinc-500">
            {hasEntries
              ? `Across ${tradedDays} traded day${tradedDays === 1 ? "" : "s"}`
              : "Log days to see your average"}
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-5 border-t border-white/[0.08] pt-5 sm:gap-x-10 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-8">
          <CompactStat label="Traded days">
            <span className="tabular-nums">{hasEntries ? tradedDays : "—"}</span>
          </CompactStat>
          <CompactStat label="Green / red">
            <GreenRedSplit green={winningDays} red={losingDays} empty={!hasEntries} />
          </CompactStat>
          <CompactStat label="Best day">
            <span className={cn("tabular-nums", pnlClass(hasEntries ? bestDay : null))}>
              {hasEntries ? moneyOrDash(bestDay, displayCurrency) : "—"}
            </span>
          </CompactStat>
          <CompactStat label={lossMetricLabel}>
            <span className={cn("tabular-nums", pnlClass(hasEntries ? lossMetricValue : null))}>
              {hasEntries ? moneyOrDash(lossMetricValue, displayCurrency) : "—"}
            </span>
          </CompactStat>
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-col justify-between rounded-xl px-4 py-4 sm:px-4.5",
            "border-t border-white/[0.08] pt-5 lg:border-t-0 lg:pt-0",
            streak.variant === "green" && "bg-emerald-500/[0.07]",
            streak.variant === "red" && "bg-rose-500/[0.07]",
            streak.variant === "neutral" && "bg-white/[0.03]",
          )}
        >
          <div>
            <p className={cn(appKicker, "whitespace-nowrap")}>Current streak</p>
            <p
              className={cn(
                "mt-2 text-[17px] font-semibold leading-tight tracking-tight",
                streak.variant === "green" && "text-emerald-200",
                streak.variant === "red" && "text-rose-200",
                streak.variant === "neutral" && "text-zinc-400",
              )}
            >
              {hasEntries ? streak.title : "—"}
            </p>
            <p className="mt-1 whitespace-nowrap text-[13px] text-zinc-500">
              {hasEntries ? streak.detail : "No momentum yet"}
            </p>
          </div>
          <div className="mt-4">
            <div className="h-1 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-500",
                  streak.variant === "green" && "bg-emerald-400/75",
                  streak.variant === "red" && "bg-rose-400/75",
                  streak.variant === "neutral" && "bg-zinc-600/50",
                )}
                style={{ width: hasEntries ? `${streakProgress}%` : "0%" }}
              />
            </div>
            {hasEntries && tradedDays > 0 ? (
              <p className="mt-2 text-[11px] tabular-nums text-zinc-600">
                {streak.days} of {tradedDays} recent days
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-white/[0.08] pt-5 sm:grid-cols-2 sm:gap-5">
        <div className="relative min-w-0 pl-3.5">
          <span className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-emerald-400/55" aria-hidden />
          <p className={appKicker}>Avg green day</p>
          <p className={cn("mt-1.5 text-[17px] font-semibold tabular-nums tracking-tight", pnlClass(avgGreenDay))}>
            {hasEntries ? moneyOrDash(avgGreenDay, displayCurrency) : "—"}
          </p>
        </div>
        <div className="relative min-w-0 pl-3.5">
          <span className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-rose-400/55" aria-hidden />
          <p className={appKicker}>Avg red day</p>
          <p className={cn("mt-1.5 text-[17px] font-semibold tabular-nums tracking-tight", pnlClass(avgRedDay))}>
            {hasEntries ? moneyOrDash(avgRedDay, displayCurrency) : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
