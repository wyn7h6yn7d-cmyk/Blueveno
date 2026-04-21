"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { calendarRows, dayCellTone, pnlMap, weekRowSum } from "./data";
import { cn } from "@/lib/utils";

function formatWeekTotal(n: number) {
  if (n === 0) return "—";
  const sign = n > 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

function formatDay(pnl: number | undefined) {
  if (pnl === undefined) return "—";
  if (pnl === 0) return "—";
  const sign = pnl > 0 ? "+" : "−";
  return `${sign}$${Math.abs(pnl).toLocaleString()}`;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const WEEKDAYS_MOBILE = ["M", "T", "W", "T", "F", "S", "S"] as const;

function toneStyles(tone: ReturnType<typeof dayCellTone>, weekend: boolean) {
  if (tone === "empty") {
    return weekend
      ? "bg-[oklch(0.075_0.035_268/0.6)] border-[oklch(0.42_0.06_260/0.22)]"
      : "bg-[oklch(0.05_0.035_270/0.4)] border-[oklch(0.42_0.08_260/0.14)] border-dashed";
  }
  if (tone === "up") {
    return [
      "bg-[linear-gradient(152deg,oklch(0.32_0.12_155/0.62)_0%,oklch(0.13_0.07_158/0.78)_55%,oklch(0.085_0.05_160/0.88)_100%)]",
      "border-emerald-400/55 shadow-[inset_0_1px_0_0_oklch(0.88_0.09_155/0.22),0_14px_44px_-26px_oklch(0.42_0.16_155/0.42)]",
    ].join(" ");
  }
  if (tone === "down") {
    return [
      "bg-[linear-gradient(152deg,oklch(0.34_0.11_18/0.58)_0%,oklch(0.15_0.07_22/0.8)_55%,oklch(0.095_0.05_20/0.9)_100%)]",
      "border-rose-400/50 shadow-[inset_0_1px_0_0_oklch(0.9_0.07_15/0.12),0_14px_44px_-26px_oklch(0.42_0.18_15/0.4)]",
    ].join(" ");
  }
  return "bg-[oklch(0.1_0.03_268/0.72)] border-white/[0.11] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.07)]";
}

type CalendarSectionProps = {
  className?: string;
};

export function CalendarSection({ className }: CalendarSectionProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  return (
    <section
      id="calendar"
      className={cn(
        "scroll-mt-28 relative border-t border-white/[0.07] py-16 sm:scroll-mt-32 sm:py-20 lg:py-28",
        className,
      )}
      aria-labelledby="cal-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,oklch(0.12_0.06_262/0.25)_0%,transparent_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[oklch(0.62_0.12_252)]">Signature</p>
            <h2
              id="cal-heading"
              className="font-display mt-4 text-[clamp(1.65rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-50 sm:mt-5"
            >
              One glance.
              <br />
              <span className="bg-gradient-to-r from-zinc-100 via-[oklch(0.88_0.05_250)] to-[oklch(0.62_0.14_252)] bg-clip-text text-transparent">
                Total clarity.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-[1.55] tracking-[-0.02em] text-zinc-500 sm:mt-5 sm:text-[15px]">
              Green, red, flat — week totals on the rail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 lg:justify-end">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400/85" aria-hidden />
              Win
            </span>
            <span className="text-zinc-700">·</span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-rose-400/85" aria-hidden />
              Loss
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8">
          {calendarRows.map((row, ri) => {
            const sum = weekRowSum(row);
            const weekLabel = `Week ${ri + 1}`;
            const featured = ri === 1;

            return (
              <motion.article
                key={`week-${ri}`}
                role="group"
                aria-label={`${weekLabel} of April`}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-32px" }}
                transition={
                  reducedMotion
                    ? { duration: 0 }
                    : { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: ri * 0.02 }
                }
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-3 sm:p-4 sm:rounded-[1.35rem] lg:p-6",
                  "border-[oklch(0.52_0.13_252/0.42)]",
                  "bg-[linear-gradient(168deg,oklch(0.1_0.045_264/0.92)_0%,oklch(0.048_0.038_272/0.96)_100%)]",
                  "shadow-[0_24px_64px_-44px_rgba(0,0,0,0.85),inset_0_1px_0_0_oklch(1_0_0/0.06)]",
                  featured &&
                    "ring-1 ring-[oklch(0.55_0.14_252/0.35)] shadow-[0_28px_72px_-40px_oklch(0.35_0.12_252/0.3),inset_0_1px_0_0_oklch(1_0_0/0.07)]",
                )}
              >
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-3 sm:mb-4 sm:gap-3 sm:pb-4">
                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                    <span className="font-display text-[clamp(1.2rem,2.5vw,1.65rem)] font-semibold tracking-[-0.04em] text-zinc-50">
                      April
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">2025</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">· {weekLabel}</span>
                  </div>
                  {featured ? (
                    <span className="rounded-full border border-[oklch(0.55_0.12_252/0.35)] bg-[oklch(0.14_0.06_262/0.5)] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[oklch(0.78_0.1_252)]">
                      Featured
                    </span>
                  ) : (
                    <p className="text-[12px] text-zinc-600 sm:text-[13px]">Tap a day.</p>
                  )}
                </div>

                <div className="hidden border-b border-white/[0.05] pb-3 sm:block">
                  <div className="flex gap-3 lg:gap-4">
                    <div className="grid min-w-0 flex-1 grid-cols-7 gap-2 lg:gap-3">
                      {WEEKDAYS.map((d) => (
                        <div
                          key={d}
                          className={cn(
                            "pb-1 text-center font-mono text-[10px] uppercase tracking-[0.2em]",
                            d === "Sat" || d === "Sun" ? "text-zinc-600" : "text-zinc-500",
                          )}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="flex w-[min(7.5rem,22%)] shrink-0 items-end justify-center pb-1 lg:w-[10rem]">
                      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.68_0.12_252)]">
                        Week
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-5">
                  <p className="mb-3 px-1 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600 sm:hidden">
                    {weekLabel}
                  </p>

                  <div className="mb-3 grid grid-cols-7 gap-1.5 sm:hidden">
                    {WEEKDAYS_MOBILE.map((d, idx) => (
                      <div
                        key={`${d}-${idx}`}
                        className={cn(
                          "text-center font-mono text-[8px] uppercase tracking-[0.14em]",
                          idx >= 5 ? "text-zinc-600" : "text-zinc-500",
                        )}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-4">
                    <div className="grid min-w-0 flex-1 grid-cols-7 gap-1 sm:gap-2 lg:gap-3">
                      {row.map((day, di) => {
                        const tone = dayCellTone(day);
                        const pnl = day ? pnlMap[day] : undefined;
                        const weekend = di >= 5;
                        const isSelectable = Boolean(day);
                        const isSelected = Boolean(day) && selectedDay === day;

                        const content = (
                          <>
                            {day ? (
                              <>
                                <span
                                  className={cn(
                                    "shrink-0 font-mono text-[10px] tabular-nums sm:text-[12px]",
                                    tone === "empty" ? "text-zinc-600" : "text-zinc-400/90",
                                  )}
                                >
                                  {day}
                                </span>
                                <span
                                  className={cn(
                                    "block w-full min-w-0 break-words text-center font-display leading-[1.15] tabular-nums tracking-[-0.02em] [overflow-wrap:anywhere] [word-break:break-word] sm:text-left",
                                    "text-[clamp(0.625rem,2.85vw,0.8125rem)] sm:text-[17px] lg:text-[18px]",
                                    typeof pnl === "number"
                                      ? pnl > 0
                                        ? "text-emerald-100"
                                        : pnl < 0
                                          ? "text-rose-100"
                                          : "text-zinc-400"
                                      : "text-zinc-500",
                                  )}
                                >
                                  {formatDay(pnl)}
                                </span>
                              </>
                            ) : null}
                          </>
                        );

                        const baseTile = cn(
                          "relative flex min-h-[3.65rem] min-w-0 flex-col justify-between overflow-hidden rounded-xl border p-1.5 transition-[transform,box-shadow,border-color] duration-200 sm:min-h-[4.75rem] sm:rounded-2xl sm:p-2.5 lg:min-h-[5.5rem] lg:p-3",
                          toneStyles(tone, weekend),
                          isSelectable &&
                            "cursor-pointer hover:z-[1] hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.14_252/0.85)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.07_0.04_268)]",
                          isSelected &&
                            "z-[2] ring-2 ring-[oklch(0.62_0.14_252/0.9)] ring-offset-2 ring-offset-[oklch(0.07_0.04_268)]",
                        );

                        if (isSelectable) {
                          return (
                            <motion.button
                              key={`${ri}-${di}-${day}`}
                              type="button"
                              aria-pressed={isSelected}
                              aria-label={`April ${day}, ${formatDay(pnl)}`}
                              className={baseTile}
                              onClick={() => setSelectedDay((s) => (s === day ? null : (day as string)))}
                              whileTap={reducedMotion ? undefined : { scale: 0.988 }}
                              transition={{ type: "spring", stiffness: 520, damping: 28 }}
                            >
                              <span className="relative z-[1] flex h-full min-w-0 flex-col justify-between gap-0.5 text-left">
                                {content}
                              </span>
                            </motion.button>
                          );
                        }

                        return (
                          <div key={`${ri}-${di}-empty`} className={baseTile}>
                            {content}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className={cn(
                        "flex w-full min-h-[3.5rem] flex-col justify-center rounded-xl border px-4 py-3.5 sm:min-h-0 sm:w-[min(9rem,28%)] sm:shrink-0 sm:rounded-2xl sm:px-4 sm:py-4 lg:w-[10rem] lg:px-5 lg:py-5",
                        "border-[oklch(0.55_0.14_252/0.42)]",
                        "bg-[linear-gradient(158deg,oklch(0.18_0.07_262/0.82)_0%,oklch(0.09_0.045_268/0.9)_100%)]",
                        "shadow-[inset_0_1px_0_0_oklch(0.55_0.12_252/0.22),0_18px_52px_-34px_oklch(0.38_0.12_252/0.45)]",
                      )}
                    >
                      <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-500 lg:text-[10px]">
                        Week total
                      </span>
                      <span
                        className={cn(
                          "block min-w-0 break-words font-display mt-2 text-[clamp(1.2rem,6.5vw,2.5rem)] font-semibold tabular-nums tracking-[-0.045em] [overflow-wrap:anywhere] lg:mt-3",
                          sum > 0 ? "text-emerald-200" : sum < 0 ? "text-rose-200" : "text-zinc-500",
                        )}
                      >
                        {formatWeekTotal(sum)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
