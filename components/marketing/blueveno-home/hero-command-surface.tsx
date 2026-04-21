"use client";

import { useCallback, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { calendarRows, dayCellTone, pnlMap, weekRowSum } from "./data";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

type SurfaceMode = "week" | "day" | "chart";

const modes: { id: SurfaceMode; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "chart", label: "Chart" },
];

const heroWeek = calendarRows[1]!;
const ease = [0.22, 1, 0.36, 1] as const;

function formatDayPnl(n: number | undefined) {
  if (n === undefined || n === 0) return "—";
  const sign = n > 0 ? "+" : "−";
  return `${sign}$${Math.abs(n)}`;
}

function weekTotalFmt(n: number) {
  if (n === 0) return "—";
  const sign = n > 0 ? "+" : "−";
  return `${sign}$${Math.abs(n)}`;
}

export function HeroCommandSurface() {
  const [mode, setMode] = useState<SurfaceMode>("week");
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const tabId = (m: SurfaceMode) => `${uid}-tab-${m}`;
  const panelId = (m: SurfaceMode) => `${uid}-panel-${m}`;

  const onKeyNav = useCallback(
    (e: React.KeyboardEvent) => {
      const order: SurfaceMode[] = ["week", "day", "chart"];
      const i = order.indexOf(mode);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setMode(order[(i + 1) % order.length]!);
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setMode(order[(i - 1 + order.length) % order.length]!);
      }
    },
    [mode],
  );

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease };

  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-[calc(4.25rem+env(safe-area-inset-top))] pb-20 sm:pb-28 lg:min-h-[min(100vh,920px)] lg:pb-32"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-[calc(3.5rem+env(safe-area-inset-top))] h-px bg-gradient-to-r from-transparent via-[oklch(0.52_0.14_252/0.35)] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center px-4 sm:px-8">
        <div className="max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[oklch(0.58_0.11_252)]">Blueveno</p>
          <h1
            id="hero-heading"
            className="font-display mt-7 text-[clamp(2.15rem,6.5vw,3.75rem)] font-bold leading-[1.02] tracking-[-0.055em] text-zinc-50"
          >
            Clarity at the close.
          </h1>
          <p className="mx-auto mt-5 max-w-[40ch] text-[15px] leading-relaxed tracking-[-0.02em] text-zinc-500">
            One disciplined surface for the day, your chart, and the numbers—calm review, no noise.
          </p>
        </div>

        {/* Single instrument — morphing review surface */}
        <div className="mt-14 w-full max-w-[960px]">
          <div className="relative rounded-[1.35rem] border border-[oklch(0.5_0.12_252/0.35)] bg-[linear-gradient(165deg,oklch(0.1_0.055_262/0.92)_0%,oklch(0.045_0.048_272/0.96)_45%,oklch(0.032_0.045_276/0.98)_100%)] shadow-[0_0_0_1px_oklch(0.52_0.12_252/0.12),0_48px_120px_-48px_rgba(0,0,0,0.88),inset_0_1px_0_0_oklch(1_0_0/0.06)]">
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.35rem] opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(oklch(0.52_0.12_252/0.14) 1px, transparent 1px), linear-gradient(90deg, oklch(0.52_0.12_252/0.14) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
              aria-hidden
            />

            <div className="relative border-b border-[oklch(0.52_0.12_252/0.14)] px-3 py-3 sm:px-5 sm:py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Review surface</span>
                <span className="font-mono text-[9px] text-zinc-600">Live preview</span>
              </div>
              <div
                className="mt-4 flex justify-center"
                role="tablist"
                aria-label="Surface mode"
                onKeyDown={onKeyNav}
              >
                <div className="inline-flex rounded-full border border-white/[0.08] bg-[oklch(0.055_0.042_268)] p-1">
                  {modes.map((m) => {
                    const on = mode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="tab"
                        id={tabId(m.id)}
                        aria-selected={on}
                        tabIndex={on ? 0 : -1}
                        aria-controls={panelId(m.id)}
                        onClick={() => setMode(m.id)}
                        className={cn(
                          "relative min-h-[44px] rounded-full px-5 py-2.5 text-[12px] font-semibold tracking-[-0.02em] transition-colors sm:px-7 sm:text-[13px]",
                          on ? "text-[oklch(0.04_0.04_268)]" : "text-zinc-500 hover:text-zinc-300",
                        )}
                      >
                        {on ? (
                          <motion.span
                            layoutId="hero-surface-pill"
                            className="absolute inset-0 rounded-full bg-[oklch(0.52_0.13_252)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.18),0_12px_40px_-16px_oklch(0.38_0.14_252/0.65)]"
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                          />
                        ) : null}
                        <span className="relative z-10">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative min-h-[min(420px,62vh)] px-4 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
              <AnimatePresence mode="wait" initial={false}>
                {mode === "week" && (
                  <motion.div
                    key="week"
                    role="tabpanel"
                    id={panelId("week")}
                    aria-labelledby={tabId("week")}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                    transition={transition}
                    className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-zinc-600">Signature week</p>
                      <p className="font-mono mt-2 text-[11px] text-zinc-500">Apr 3 — 9 · Mon — Sun</p>
                      <div className="mt-6 hidden grid-cols-7 gap-2 sm:grid sm:gap-2.5">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <div
                            key={`${d}-${i}`}
                            className={`pb-1 text-center font-mono text-[9px] uppercase tracking-[0.2em] ${i >= 5 ? "text-zinc-600" : "text-zinc-500"}`}
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid min-w-0 grid-cols-7 gap-1 sm:mt-2 sm:gap-2.5">
                        {heroWeek.map((day, di) => {
                          const tone = dayCellTone(day);
                          const pnl = day ? pnlMap[day] : undefined;
                          const toneClass =
                            tone === "empty"
                              ? "bg-[oklch(0.07_0.035_270/0.55)]"
                              : tone === "up"
                                ? "bg-emerald-500/[0.28] shadow-[inset_0_0_0_1px_oklch(0.7_0.14_155/0.42)]"
                                : tone === "down"
                                  ? "bg-rose-500/[0.24] shadow-[inset_0_0_0_1px_oklch(0.62_0.18_15/0.4)]"
                                  : "bg-white/[0.06] shadow-[inset_0_0_0_1px_oklch(1_0_0/0.1)]";
                          return (
                            <motion.div
                              key={`${day}-${di}`}
                              className={cn(
                                "flex min-h-[4.75rem] min-w-0 flex-col justify-between overflow-hidden rounded-lg p-1.5 sm:min-h-[6.25rem] sm:rounded-xl sm:p-3",
                                toneClass,
                              )}
                              initial={reduceMotion ? false : { opacity: 0.75, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: reduceMotion ? 0 : di * 0.04, duration: 0.35, ease }}
                            >
                              {day ? (
                                <>
                                  <span className="shrink-0 font-mono text-[9px] font-medium tabular-nums text-zinc-500 sm:text-[10px]">
                                    {day}
                                  </span>
                                  <span
                                    className={cn(
                                      "block w-full min-w-0 text-center font-display text-[clamp(0.625rem,2.9vw,0.875rem)] tabular-nums leading-[1.1] tracking-[-0.02em] [overflow-wrap:anywhere] sm:text-left sm:text-lg sm:leading-none",
                                      typeof pnl === "number" && pnl > 0
                                        ? "text-emerald-100"
                                        : typeof pnl === "number" && pnl < 0
                                          ? "text-rose-100"
                                          : "text-zinc-500",
                                    )}
                                  >
                                    {formatDayPnl(pnl)}
                                  </span>
                                </>
                              ) : null}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex items-stretch justify-center lg:w-[7.5rem] lg:border-l lg:border-[oklch(0.52_0.12_252/0.12)] lg:pl-8">
                      <div className="flex w-full flex-row items-center justify-between gap-4 rounded-xl border border-[oklch(0.52_0.12_252/0.2)] bg-[oklch(0.06_0.05_268/0.85)] px-5 py-4 lg:h-full lg:w-full lg:flex-col lg:justify-center lg:px-3 lg:py-8">
                        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Week</span>
                        <span className="font-display text-2xl tabular-nums tracking-[-0.04em] text-emerald-100 sm:text-3xl">
                          {weekTotalFmt(weekRowSum(heroWeek))}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === "day" && (
                  <motion.div
                    key="day"
                    role="tabpanel"
                    id={panelId("day")}
                    aria-labelledby={tabId("day")}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                    transition={transition}
                    className="mx-auto max-w-lg"
                  >
                    <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-600">Trading day</p>
                        <p className="font-mono mt-3 text-[12px] tracking-[0.12em] text-zinc-400">THU · 24 APR · RTH</p>
                        <p className="font-display mt-5 text-xl font-semibold tracking-[-0.03em] text-zinc-100 sm:text-2xl">NQ · Day close</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-zinc-600">P&amp;L</p>
                        <p className="font-display mt-2 text-[clamp(3rem,14vw,4.5rem)] font-bold tabular-nums leading-none tracking-[-0.06em] text-emerald-200">
                          +$180
                        </p>
                      </div>
                    </div>
                    <div className="mt-10 space-y-3 border-l-2 border-[oklch(0.52_0.14_252/0.5)] pl-6 text-[15px] leading-[1.7] tracking-[-0.015em] text-zinc-400">
                      <p>Stopped after the drive. Book flat.</p>
                    </div>
                  </motion.div>
                )}

                {mode === "chart" && (
                  <motion.div
                    key="chart"
                    role="tabpanel"
                    id={panelId("chart")}
                    aria-labelledby={tabId("chart")}
                    initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                    transition={transition}
                    className="flex flex-col gap-8"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-[oklch(0.52_0.12_252/0.22)] bg-[oklch(0.045_0.04_270)]">
                      <HeroChartSvg reduceMotion={!!reduceMotion} />
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between font-mono text-[10px] text-zinc-600 sm:text-[11px]">
                        <span>Linked</span>
                        <span className="text-zinc-400">NQ1!</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
                      <p className="min-w-0 flex-1 truncate font-mono text-[12px] text-[oklch(0.78_0.09_250)] sm:text-[13px]">
                        tradingview.com/chart/…
                      </p>
                      <a
                        href="https://www.tradingview.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[oklch(0.52_0.14_252/0.45)] bg-[oklch(0.52_0.12_252/0.15)] px-4 py-2 text-[12px] font-semibold text-zinc-100 transition hover:border-[oklch(0.58_0.14_252/0.55)] hover:bg-[oklch(0.52_0.12_252/0.22)]"
                      >
                        Open
                        <ExternalLink className="size-3.5 opacity-90" strokeWidth={2} />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <PremiumPrimaryLink href="/signup">Register</PremiumPrimaryLink>
          <PremiumGhostLink href="/app">Workspace</PremiumGhostLink>
        </div>
      </div>
    </section>
  );
}

function HeroChartSvg({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <svg className="h-[min(220px,38vh)] w-full" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="hero-cmd-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.52 0.14 252 / 0.35)" />
          <stop offset="100%" stopColor="oklch(0.52 0.14 252 / 0)" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="oklch(0.04 0.04 268)" />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          y1={40 + i * 44}
          x2="400"
          y2={40 + i * 44}
          stroke="oklch(1 0 0 / 0.04)"
          strokeWidth="1"
        />
      ))}
      <path
        d="M0 140 L50 128 L100 148 L150 96 L200 118 L250 72 L300 92 L350 58 L400 72 L400 200 L0 200 Z"
        fill="url(#hero-cmd-fill)"
      />
      <motion.path
        d="M0 140 L50 128 L100 148 L150 96 L200 118 L250 72 L300 92 L350 58 L400 72"
        fill="none"
        stroke="oklch(0.72 0.11 252)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduceMotion ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0.7 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 1.1, ease }}
      />
    </svg>
  );
}
