"use client";

import type { KeyboardEvent, MutableRefObject } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { calendarRows, dayCellTone, monthTotalSum, pnlMap } from "./data";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

type HeroMode = "day" | "chart" | "month";

const modes: { id: HeroMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "chart", label: "Chart" },
  { id: "month", label: "Month" },
];

const order: HeroMode[] = ["day", "chart", "month"];

const ease = [0.22, 1, 0.36, 1] as const;
const springTab = { type: "spring" as const, stiffness: 420, damping: 32 };

const leftStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

type HeroProductSlabProps = {
  mode: HeroMode;
  groupId: string;
  tabRefs: MutableRefObject<(HTMLButtonElement | null)[]>;
  onTabKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  go: (m: HeroMode) => void;
};

function HeroProductSlab({ mode, groupId, tabRefs, onTabKeyDown, go }: HeroProductSlabProps) {
  return (
    <div className="relative flex w-full min-h-[min(620px,78vh)] flex-col lg:min-h-[min(720px,82vh)]">
      <div
        className="relative rounded-[1.35rem] p-[1px] bg-[linear-gradient(145deg,oklch(0.44_0.12_252/0.5),oklch(0.2_0.06_268/0.32)_42%,oklch(0.36_0.1_252/0.42))] shadow-[0_0_0_1px_oklch(0.52_0.12_252/0.14),0_64px_160px_-60px_rgba(0,0,0,0.94),0_0_80px_-40px_oklch(0.48_0.14_252/0.18)]"
        role="region"
        aria-label="Product preview"
      >
        <div
          className="relative z-10 flex h-full min-h-[inherit] flex-col overflow-hidden rounded-[calc(1.35rem-1px)] bg-[oklch(0.032_0.048_274)]"
          style={{ boxShadow: "inset 0 0 0 1px oklch(0.52 0.12 252 / 0.12)" }}
        >
          <div className="relative flex min-h-[inherit] flex-col">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[oklch(0.52_0.12_252/0.16)] bg-[linear-gradient(180deg,oklch(0.052_0.046_268/0.95)_0%,oklch(0.042_0.044_270)_100%)] px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex shrink-0 gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-[oklch(0.55_0.12_252/0.45)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.55_0.12_252/0.24)]" />
                  <span className="size-2.5 rounded-full bg-[oklch(0.55_0.12_252/0.12)]" />
                </span>
                <span className="truncate font-mono text-[10px] tracking-[0.14em] text-zinc-500 sm:inline">Session</span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="relative inline-flex size-2 rounded-full bg-emerald-400/90 shadow-[0_0_0_3px_oklch(0.72_0.14_160/0.2)]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">Live</span>
              </div>
            </div>

            <div
              className="flex shrink-0 justify-center border-b border-[oklch(0.52_0.12_252/0.12)] bg-[oklch(0.036_0.046_272)] px-3 py-3.5 sm:px-6 sm:py-4"
              role="tablist"
              aria-label="Preview mode"
              onKeyDown={onTabKeyDown}
            >
              <div className="relative grid w-full max-w-lg grid-cols-3 rounded-full border border-white/[0.1] bg-[oklch(0.055_0.042_268)] p-1 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)]">
                {modes.map((m, i) => {
                  const selected = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${groupId}-${m.id}`}
                      aria-selected={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => go(m.id)}
                      className={cn(
                        "relative flex min-h-[44px] min-w-0 items-center justify-center rounded-full border border-transparent py-3 text-center text-[12px] font-medium tracking-[-0.02em] transition-colors duration-200 sm:min-h-[48px] sm:py-2.5 sm:text-[13px]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.14_252/0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[oklch(0.04_0.04_270)]",
                        "active:scale-[0.98] motion-reduce:active:scale-100",
                        selected ? "text-[oklch(0.035_0.045_268)]" : "text-zinc-500 hover:text-zinc-200",
                      )}
                    >
                      {selected ? (
                        <motion.span
                          layoutId="hero-mode-pill"
                          className="absolute inset-0 rounded-full bg-[oklch(0.52_0.13_252)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_16px_48px_-18px_oklch(0.4_0.14_252/0.7)]"
                          transition={springTab}
                        />
                      ) : null}
                      <span className="relative z-10 px-2">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative flex min-h-[min(460px,56vh)] flex-1 flex-col lg:min-h-[560px]">
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div
                  className="absolute inset-0 opacity-[0.22]"
                  style={{
                    backgroundImage:
                      "linear-gradient(oklch(0.52_0.12_252/0.2) 1px, transparent 1px), linear-gradient(90deg, oklch(0.52_0.12_252/0.2) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.12_252/0.25)] to-transparent" />
              </div>

              <AnimatePresence mode="wait">
                {mode === "day" && (
                  <motion.div
                    key="day"
                    role="tabpanel"
                    id={`${groupId}-panel-day`}
                    aria-labelledby={`${groupId}-day`}
                    initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease }}
                    className="absolute inset-0 flex flex-col p-5 sm:p-7 lg:p-9"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.07] pb-5">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-600">Trading day</p>
                        <p className="font-mono mt-2.5 text-[13px] tracking-[0.12em] text-zinc-300">THU · 24 APR · RTH</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-[oklch(0.52_0.14_252/0.4)] bg-[oklch(0.52_0.12_252/0.16)] px-3.5 py-2 font-mono text-[13px] font-semibold tracking-[0.1em] text-[oklch(0.9_0.06_250)]">
                          NQ
                        </span>
                        <span className="rounded-lg border border-white/[0.1] bg-white/[0.05] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                          Long
                        </span>
                      </div>
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-8 pt-8 lg:grid-cols-12 lg:gap-10 lg:pt-10">
                      <div className="flex flex-col justify-center lg:col-span-7">
                        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-600">Daily P&amp;L</p>
                        <motion.p
                          className="font-display mt-3 text-[clamp(3.5rem,12vw,6rem)] font-bold tabular-nums leading-[0.92] tracking-[-0.065em] text-emerald-200"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.08, duration: 0.45, ease }}
                        >
                          +$180
                        </motion.p>
                        <div className="mt-5 max-w-[200px]">
                          <HeroDaySparkline />
                        </div>
                        <p className="font-mono mt-5 text-[11px] text-zinc-600">Net · 1R risk</p>
                      </div>
                      <div className="flex flex-col justify-center border-t border-white/[0.06] pt-8 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
                        <div className="h-px w-10 bg-gradient-to-r from-[oklch(0.52_0.14_252/0.6)] to-transparent" aria-hidden />
                        <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">Note</p>
                        <p className="mt-4 text-[15px] leading-[1.75] tracking-[-0.015em] text-zinc-400">
                          Opening drive only. Size held. No revenge after the flush.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === "chart" && (
                  <motion.div
                    key="chart"
                    role="tabpanel"
                    id={`${groupId}-panel-chart`}
                    aria-labelledby={`${groupId}-chart`}
                    initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease }}
                    className="absolute inset-0 flex flex-col p-5 sm:p-7 lg:p-9"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-600">Linked chart</p>
                    <div className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[oklch(0.52_0.12_252/0.28)] bg-[oklch(0.04_0.04_270)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07),0_32px_80px_-48px_rgba(0,0,0,0.9)]">
                      <div className="flex items-center gap-2 border-b border-white/[0.08] bg-[oklch(0.055_0.045_268)] px-3 py-2.5 sm:px-4">
                        <span className="flex gap-1" aria-hidden>
                          <span className="size-2 rounded-full bg-zinc-600" />
                          <span className="size-2 rounded-full bg-zinc-600/70" />
                          <span className="size-2 rounded-full bg-zinc-600/45" />
                        </span>
                        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/[0.06] bg-[oklch(0.03_0.04_272)] px-3 py-1.5 font-mono text-[10px] text-zinc-500 sm:text-[11px]">
                          <span className="text-emerald-500/90" aria-hidden>
                            ●
                          </span>
                          <span className="truncate text-[oklch(0.78_0.09_250)]">linked-chart.com/session/xK9… · NQ1!</span>
                        </div>
                        <span className="shrink-0 rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-emerald-300/90">
                          Linked
                        </span>
                      </div>
                      <div className="relative min-h-[220px] flex-1 sm:min-h-[260px] lg:min-h-[300px]">
                        <ChartPreviewSvg />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <span className="font-mono text-[10px] text-zinc-600">Last</span>
                          <span className="font-mono text-[12px] tabular-nums text-zinc-300">18,432.50</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 border-t border-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                        <a
                          href="/signup"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full border border-[oklch(0.52_0.14_252/0.5)] bg-[oklch(0.52_0.12_252/0.22)] px-6 text-[13px] font-semibold text-zinc-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)] transition hover:border-[oklch(0.6_0.14_252/0.6)] hover:bg-[oklch(0.52_0.12_252/0.32)] active:scale-[0.99] motion-reduce:active:scale-100 sm:w-auto"
                        >
                          Open chart
                          <ExternalLink className="size-3.5 opacity-85 transition group-hover:opacity-100" strokeWidth={2} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                {mode === "month" && (
                  <motion.div
                    key="month"
                    role="tabpanel"
                    id={`${groupId}-panel-month`}
                    aria-labelledby={`${groupId}-month`}
                    initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                    transition={{ duration: 0.4, ease }}
                    className="absolute inset-0 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8"
                  >
                    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.07] pb-4">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-zinc-600">Month</p>
                        <p className="mt-2 font-mono text-[12px] text-zinc-400">April · Mon — Sun</p>
                      </div>
                      <span className="rounded-lg border border-[oklch(0.52_0.12_252/0.25)] bg-[oklch(0.52_0.12_252/0.08)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.65_0.11_252)]">
                        30 days
                      </span>
                    </div>

                    <div className="mt-4 flex min-h-0 flex-1 flex-col">
                      <div className="mb-2 hidden grid-cols-7 gap-1 sm:grid sm:gap-1.5">
                        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                          <div
                            key={`${d}-${i}`}
                            className={`text-center font-mono text-[8px] uppercase tracking-[0.18em] sm:text-[9px] ${i >= 5 ? "text-zinc-600" : "text-zinc-500"}`}
                          >
                            {d}
                          </div>
                        ))}
                      </div>

                      <div className="flex min-h-0 flex-1 flex-col gap-1.5 sm:gap-2">
                        {calendarRows.map((row, ri) => (
                          <div key={ri} className="grid min-h-0 min-w-0 flex-1 grid-cols-7 gap-1 sm:gap-1.5">
                            {row.map((day, di) => {
                              const tone = dayCellTone(day);
                              const pnl = day ? pnlMap[day] : undefined;
                              const toneClass =
                                tone === "empty"
                                  ? "bg-[oklch(0.07_0.035_270/0.55)]"
                                  : tone === "up"
                                    ? "bg-emerald-500/[0.32] shadow-[inset_0_0_0_1px_oklch(0.72_0.14_155/0.45)]"
                                    : tone === "down"
                                      ? "bg-rose-500/[0.28] shadow-[inset_0_0_0_1px_oklch(0.65_0.2_15/0.42)]"
                                      : "bg-white/[0.07] shadow-[inset_0_0_0_1px_oklch(1_0_0/0.12)]";
                              const display =
                                typeof pnl === "number" && pnl !== 0
                                  ? `${pnl > 0 ? "+" : "−"}$${Math.abs(pnl)}`
                                  : "—";

                              return (
                                <div
                                  key={`${ri}-${di}-${day || "pad"}`}
                                  className={cn(
                                    "flex min-h-[2.65rem] min-w-0 flex-col justify-between overflow-hidden rounded-md p-1 sm:min-h-[3.1rem] sm:rounded-lg sm:p-2",
                                    toneClass,
                                  )}
                                >
                                  {day ? (
                                    <>
                                      <span className="font-mono text-[9px] font-medium tabular-nums text-zinc-500 sm:text-[10px]">{day}</span>
                                      <span
                                        className={cn(
                                          "block w-full min-w-0 text-center font-display text-[clamp(0.55rem,2.6vw,0.625rem)] tabular-nums leading-[1.05] [overflow-wrap:anywhere] sm:text-xs sm:leading-none",
                                          typeof pnl === "number" && pnl > 0
                                            ? "text-emerald-100"
                                            : typeof pnl === "number" && pnl < 0
                                              ? "text-rose-100"
                                              : "text-zinc-500",
                                        )}
                                      >
                                        {display}
                                      </span>
                                    </>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[oklch(0.52_0.14_252/0.28)] bg-[linear-gradient(135deg,oklch(0.08_0.06_262/0.6)_0%,oklch(0.05_0.05_270/0.5)_100%)] px-4 py-3.5 sm:px-6 sm:py-5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">Month total</span>
                        <span className="font-display text-2xl tabular-nums tracking-[-0.05em] text-emerald-100 sm:text-3xl lg:text-4xl">
                          {(() => {
                            const s = monthTotalSum(calendarRows);
                            if (s === 0) return "—";
                            return `${s > 0 ? "+" : "−"}$${Math.abs(s)}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroDaySparkline() {
  return (
    <svg className="h-10 w-full text-[oklch(0.52_0.14_252)]" viewBox="0 0 120 32" fill="none" aria-hidden>
      <path
        d="M0 24 L12 20 L24 26 L36 14 L48 18 L60 8 L72 12 L84 4 L96 10 L108 6 L120 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function HeroSection() {
  const [mode, setMode] = useState<HeroMode>("day");
  const groupId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const advanceGateRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const go = useCallback((m: HeroMode) => setMode(m), []);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      const el = advanceGateRef.current;
      if (el?.contains(document.activeElement)) return;
      setMode((m) => order[(order.indexOf(m) + 1) % order.length]!);
    }, 18000);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const onTabKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const i = order.indexOf(mode);
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = (i + 1) % order.length;
        go(order[next]!);
        queueMicrotask(() => tabRefs.current[next]?.focus());
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (i - 1 + order.length) % order.length;
        go(order[prev]!);
        queueMicrotask(() => tabRefs.current[prev]?.focus());
      }
    },
    [go, mode],
  );

  return (
    <section
      className="relative overflow-hidden pt-[calc(4.5rem+env(safe-area-inset-top))] pb-20 sm:pb-28 lg:min-h-[min(100vh,960px)] lg:pb-36"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute left-0 right-0 top-[calc(3.75rem+env(safe-area-inset-top))] h-px bg-gradient-to-r from-transparent via-[oklch(0.52_0.14_252/0.4)] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-[1520px] gap-12 px-5 sm:px-8 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.22fr)] lg:items-center lg:gap-10 lg:px-10 xl:gap-14 xl:px-12">
        <motion.div
          className="flex max-w-xl flex-col justify-center lg:max-w-none lg:pr-4 xl:pr-8"
          variants={leftStagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeUp}
            className="font-mono text-[10px] uppercase tracking-[0.42em] text-[oklch(0.58_0.11_252)]"
          >
            Premium trading journal
          </motion.p>
          <motion.h1
            id="hero-heading"
            variants={fadeUp}
            className="font-display mt-8 text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[0.92] tracking-[-0.055em] text-zinc-50 lg:mt-10"
          >
            One surface.
            <br />
            <span className="text-gradient-cobalt [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">Full verdict.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-7 max-w-[36ch] text-[15px] leading-relaxed tracking-[-0.02em] text-zinc-500"
          >
            Log the day, link the chart, read the month — one disciplined surface.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-3 sm:gap-4">
            <PremiumPrimaryLink href="/signup">Open Blueveno</PremiumPrimaryLink>
            <PremiumGhostLink href="/app">Workspace</PremiumGhostLink>
          </motion.div>
        </motion.div>

        <motion.div
          ref={advanceGateRef}
          className="relative min-w-0"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -8, 0],
                }
          }
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <HeroProductSlab mode={mode} groupId={groupId} tabRefs={tabRefs} onTabKeyDown={onTabKeyDown} go={go} />
        </motion.div>
      </div>
    </section>
  );
}

function ChartPreviewSvg() {
  const uid = useId().replace(/:/g, "");
  const fillId = `bv-hero-chart-${uid}`;
  return (
    <svg className="h-full w-full min-h-[200px]" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.52 0.14 252 / 0.4)" />
          <stop offset="100%" stopColor="oklch(0.52 0.14 252 / 0)" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="oklch(0.05 0.04 268)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="0"
          y1={48 + i * 40}
          x2="400"
          y2={48 + i * 40}
          stroke="oklch(1 0 0 / 0.04)"
          strokeWidth="1"
        />
      ))}
      <path
        d="M0 150 L40 138 L80 158 L120 108 L160 128 L200 78 L240 98 L280 58 L320 82 L360 48 L400 62 L400 240 L0 240 Z"
        fill={`url(#${fillId})`}
      />
      <motion.path
        d="M0 150 L40 138 L80 158 L120 108 L160 128 L200 78 L240 98 L280 58 L320 82 L360 48 L400 62"
        fill="none"
        stroke="oklch(0.68 0.12 252)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.6 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease }}
      />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line
          key={i}
          x1={36 + i * 40}
          y1={62 + (i % 4) * 6}
          x2={36 + i * 40}
          y2={128 + (i % 3) * 8}
          stroke={i % 2 === 0 ? "oklch(0.72 0.14 155 / 0.9)" : "oklch(0.68 0.18 15 / 0.85)"}
          strokeWidth="7"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
