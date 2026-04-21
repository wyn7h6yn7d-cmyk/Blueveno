"use client";

import { useId, useState } from "react";
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
      ? "bg-[oklch(0.08_0.03_268/0.55)] border-[oklch(0.42_0.06_260/0.2)]"
      : "bg-[oklch(0.055_0.035_270/0.35)] border-[oklch(0.45_0.08_260/0.12)] border-dashed";
  }
  if (tone === "up") {
    return [
      "bg-[linear-gradient(155deg,oklch(0.28_0.11_155/0.55)_0%,oklch(0.12_0.06_158/0.75)_55%,oklch(0.08_0.04_160/0.85)_100%)]",
      "border-emerald-400/45 shadow-[inset_0_1px_0_0_oklch(0.88_0.08_155/0.18),0_12px_40px_-28px_oklch(0.45_0.14_155/0.35)]",
    ].join(" ");
  }
  if (tone === "down") {
    return [
      "bg-[linear-gradient(155deg,oklch(0.3_0.1_18/0.5)_0%,oklch(0.14_0.06_22/0.78)_55%,oklch(0.09_0.04_20/0.88)_100%)]",
      "border-rose-400/42 shadow-[inset_0_1px_0_0_oklch(0.9_0.06_15/0.1),0_12px_40px_-28px_oklch(0.45_0.16_15/0.32)]",
    ].join(" ");
  }
  return "bg-[oklch(0.1_0.03_268/0.7)] border-white/[0.1] shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]";
}

type CalendarSectionProps = {
  className?: string;
};

export function CalendarSection({ className }: CalendarSectionProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const listDomId = useId();
  const listId = `${listDomId}-weeks`;

  return (
    <section
      id="calendar"
      className={cn(
        "scroll-mt-28 relative border-t border-white/[0.06] py-28 sm:scroll-mt-32 sm:py-32 lg:py-40",
        className,
      )}
      aria-labelledby="cal-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(60vh,560px)] bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,oklch(0.38_0.12_252/0.14),transparent_65%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-10">
        <div className="mb-14 flex flex-col gap-10 lg:mb-20 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[oklch(0.62_0.12_252)]">Signature</p>
            <h2
              id="cal-heading"
              className="font-display mt-5 text-[clamp(2.5rem,6.5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-zinc-50"
            >
              One glance.
              <br />
              <span className="bg-gradient-to-r from-zinc-100 via-[oklch(0.88_0.05_250)] to-[oklch(0.62_0.14_252)] bg-clip-text text-transparent">
                One week understood.
              </span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-[1.6] tracking-[-0.02em] text-zinc-500 sm:text-[16px]">
              Green, red, flat — week totals on the rail.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600 lg:justify-end">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400/80" aria-hidden />
              Win
            </span>
            <span className="text-zinc-700">·</span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-rose-400/80" aria-hidden />
              Loss
            </span>
          </div>
        </div>

        <div
          className={cn(
            "relative overflow-hidden rounded-[2rem] border border-[oklch(0.5_0.13_252/0.45)]",
            "bg-[linear-gradient(168deg,oklch(0.1_0.045_264/0.97)_0%,oklch(0.045_0.035_272/0.99)_45%,oklch(0.055_0.04_268/0.98)_100%)]",
            "shadow-[0_48px_120px_-48px_rgba(0,0,0,0.85),inset_0_1px_0_0_oklch(1_0_0/0.06)]",
          )}
        >
          {/* Product chrome */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] px-6 py-5 sm:px-10 sm:py-6">
            <div className="flex items-baseline gap-4">
              <span className="font-display text-[clamp(1.75rem,3vw,2.35rem)] font-semibold tracking-[-0.04em] text-zinc-50">
                April
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">2025</span>
            </div>
            <p className="max-w-xs text-right text-[12px] leading-snug text-zinc-600 sm:text-[13px]">Tap a day to focus.</p>
          </div>

          {/* Column labels — airy, not a table header */}
          <div className="hidden border-b border-white/[0.05] px-6 pb-4 pt-2 sm:block sm:px-10 lg:px-12">
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
              <div
                className="flex w-[min(7.5rem,22%)] shrink-0 items-end justify-center pb-1 lg:w-[9.5rem]"
                aria-hidden
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.68_0.12_252)]">
                  Week
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12" id={listId}>
            <div className="flex flex-col gap-5 lg:gap-6">
              {calendarRows.map((row, ri) => {
                const sum = weekRowSum(row);
                const weekLabel = `Week ${ri + 1}`;

                return (
                  <motion.div
                    key={`week-${ri}`}
                    role="group"
                    aria-label={`${weekLabel} of April`}
                    initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: ri * 0.05 }
                    }
                    className={cn(
                      "rounded-[1.35rem] border border-white/[0.06]",
                      "bg-[linear-gradient(180deg,oklch(0.09_0.04_266/0.55)_0%,oklch(0.055_0.035_270/0.4)_100%)]",
                      "p-3 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)] sm:p-4 lg:p-5",
                    )}
                  >
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
                      <div className="grid min-w-0 flex-1 grid-cols-7 gap-2 lg:gap-3">
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
                                      "font-mono text-[11px] tabular-nums sm:text-[12px]",
                                      tone === "empty" ? "text-zinc-600" : "text-zinc-400/90",
                                    )}
                                  >
                                    {day}
                                  </span>
                                  <span
                                    className={cn(
                                      "font-display text-[15px] tabular-nums tracking-[-0.03em] sm:text-[17px] lg:text-[18px]",
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
                            "relative flex min-h-[4.75rem] flex-col justify-between rounded-2xl border p-3 transition-[transform,box-shadow,border-color] duration-200 sm:min-h-[5.75rem] sm:p-3.5 lg:min-h-[6.75rem] lg:p-4",
                            toneStyles(tone, weekend),
                            isSelectable &&
                              "cursor-pointer hover:z-[1] hover:brightness-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.14_252/0.85)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.07_0.04_268)]",
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
                                onClick={() =>
                                  setSelectedDay((s) => (s === day ? null : (day as string)))
                                }
                                whileTap={reducedMotion ? undefined : { scale: 0.985 }}
                                transition={{ type: "spring", stiffness: 520, damping: 28 }}
                              >
                                <span className="relative z-[1] flex h-full flex-col justify-between text-left">
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

                      {/* Week total rail — visually dominant, not a table cell */}
                      <div
                        className={cn(
                          "flex w-full min-h-[4rem] flex-col justify-center rounded-2xl border border-[oklch(0.52_0.14_252/0.38)] px-5 py-5 sm:min-h-0 sm:w-[min(9.5rem,26%)] sm:shrink-0 sm:px-4 lg:w-[10.5rem] lg:px-6 lg:py-6",
                          "bg-[linear-gradient(160deg,oklch(0.16_0.06_262/0.75)_0%,oklch(0.09_0.045_268/0.85)_100%)]",
                          "shadow-[inset_0_1px_0_0_oklch(0.55_0.12_252/0.2),0_16px_48px_-32px_oklch(0.35_0.12_252/0.4)]",
                        )}
                      >
                        <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-500 lg:text-[10px]">
                          Week total
                        </span>
                        <span
                          className={cn(
                            "font-display mt-2 text-[clamp(1.5rem,3.8vw,2.35rem)] font-semibold tabular-nums tracking-[-0.045em] lg:mt-3",
                            sum > 0 ? "text-emerald-200" : sum < 0 ? "text-rose-200" : "text-zinc-500",
                          )}
                        >
                          {formatWeekTotal(sum)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
