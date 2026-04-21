"use client";

import { useId, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "chart" | "week";

const MODES: { id: ViewMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "chart", label: "Chart" },
  { id: "week", label: "Week" },
];

const WEEK_DEMO_DAYS = [320, -180, 0, 540, -95, 410, 275] as const;
const WEEK_DEMO_TOTAL = WEEK_DEMO_DAYS.reduce<number>((a, b) => a + b, 0);
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const TV_SAMPLE = "https://www.tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21";

function fmtUsd(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

function weekCellClass(n: number) {
  if (n > 0)
    return "border-emerald-400/55 bg-[linear-gradient(158deg,oklch(0.3_0.12_155/0.65),oklch(0.12_0.06_158/0.5))] text-emerald-50 shadow-[inset_0_1px_0_0_oklch(0.88_0.08_155/0.22),0_0_0_1px_oklch(0.55_0.14_155/0.15)]";
  if (n < 0)
    return "border-rose-400/48 bg-[linear-gradient(158deg,oklch(0.32_0.11_18/0.58),oklch(0.13_0.06_22/0.48))] text-rose-50 shadow-[inset_0_1px_0_0_oklch(0.9_0.06_15/0.12),0_0_0_1px_oklch(0.55_0.14_15/0.12)]";
  return "border-white/[0.12] bg-white/[0.04] text-zinc-500";
}

function ChartPreviewSvg() {
  const gid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 420 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.5 0.14 252)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 268)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-stroke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.58 0.14 252)" />
          <stop offset="100%" stopColor="oklch(0.48 0.12 252)" />
        </linearGradient>
      </defs>
      <rect width="420" height="260" fill={`url(#${gid}-fill)`} rx="12" />
      {[44, 84, 124, 164, 204].map((y) => (
        <line key={y} x1="24" y1={y} x2="396" y2={y} stroke="oklch(0.42 0.02 260)" strokeOpacity="0.22" strokeWidth="1" />
      ))}
      <line x1="24" y1="134" x2="396" y2="134" stroke="oklch(0.58 0.1 252)" strokeOpacity="0.45" strokeWidth="1.25" />
      {(
        [
          { x: 48, y: 152, w: 24, h: 48 },
          { x: 96, y: 132, w: 24, h: 64 },
          { x: 144, y: 142, w: 22, h: 52 },
          { x: 192, y: 118, w: 26, h: 72 },
          { x: 240, y: 128, w: 22, h: 58 },
          { x: 288, y: 108, w: 24, h: 76 },
          { x: 336, y: 122, w: 22, h: 58 },
        ] as const
      ).map((c, i) => (
        <g key={i}>
          <line x1={c.x + c.w / 2} y1={c.y - 8} x2={c.x + c.w / 2} y2={c.y + c.h + 8} stroke="oklch(0.72 0.12 252)" strokeWidth="2" />
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="4" fill="oklch(0.52 0.14 155)" opacity="0.88" />
        </g>
      ))}
      <path
        d="M 36 188 Q 128 128 210 108 T 384 88"
        fill="none"
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

function DayPanel() {
  return (
    <div className="flex min-h-0 flex-col justify-between gap-6 sm:gap-8">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[oklch(0.62_0.11_252)]">Session</p>
        <p className="font-display mt-3 text-[clamp(1.35rem,3.2vw,2rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-zinc-50 sm:mt-4">
          Tuesday, April 15
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-3">
          <span className="rounded-lg border border-[oklch(0.55_0.12_252/0.5)] bg-[oklch(0.14_0.06_262/0.65)] px-3 py-1.5 font-mono text-[13px] font-medium tracking-wide text-zinc-100 sm:px-4 sm:py-2 sm:text-[14px]">
            NQ
          </span>
          <span className="text-[13px] text-zinc-500 sm:text-[14px]">CME · Regular session</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-zinc-500">Day P&amp;L</p>
        <p className="font-display mt-2 text-[clamp(1.5rem,4vw,2.25rem)] font-semibold tabular-nums tracking-[-0.045em] text-emerald-200 sm:mt-3">
          +$2,847
        </p>
      </div>
      <p className="max-w-md border-l-2 border-[oklch(0.55_0.12_252/0.75)] pl-4 text-[13px] leading-[1.55] text-zinc-400 sm:pl-5 sm:text-[14px]">
        Trend off the open; flat before the late chop.
      </p>
    </div>
  );
}

function ChartPanel() {
  return (
    <div className="flex min-h-0 flex-col gap-5 sm:gap-6">
      <div className="relative overflow-hidden rounded-xl border border-[oklch(0.52_0.12_252/0.28)] bg-[linear-gradient(168deg,oklch(0.09_0.04_264/0.95),oklch(0.045_0.03_268/0.98))] p-1 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.07)] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2 sm:px-5 sm:py-2.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px]">Linked chart</span>
          <span className="rounded-md border border-white/[0.08] bg-black/35 px-2 py-0.5 font-mono text-[9px] text-zinc-400 sm:text-[10px]">
            NQ · 15m
          </span>
        </div>
        <div className="max-h-[min(160px,28vh)] p-2 pt-1 sm:max-h-[200px] sm:p-4 sm:pt-2">
          <ChartPreviewSvg />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <p className="max-w-sm font-mono text-[10px] leading-relaxed text-zinc-500 sm:text-[11px]">Same row as the session.</p>
        <a
          href={TV_SAMPLE}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[oklch(0.58_0.12_252/0.5)] sm:rounded-xl",
            "bg-[linear-gradient(180deg,oklch(0.26_0.08_262/0.95),oklch(0.14_0.045_266/0.98))] px-4 py-2.5 text-[13px] font-semibold text-zinc-50 sm:px-6 sm:py-3 sm:text-[14px]",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08)] transition hover:border-[oklch(0.65_0.12_252/0.65)]",
          )}
        >
          Open chart
          <ExternalLink className="size-3.5 opacity-90 sm:size-4" strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

function WeekPanel() {
  return (
    <div className="flex min-h-0 flex-col gap-5 sm:gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2 sm:gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.62_0.11_252)]">Week</p>
          <p className="font-display mt-2 text-[clamp(1.1rem,2.5vw,1.5rem)] font-semibold tracking-[-0.03em] text-zinc-50 sm:mt-2.5">
            April — at a glance
          </p>
        </div>
        <p className="font-mono text-[10px] text-zinc-600 sm:text-[11px]">Daily P&amp;L · USD</p>
      </div>

      <div className="grid min-w-0 grid-cols-7 gap-1 sm:gap-2.5">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center font-mono text-[7px] uppercase tracking-[0.1em] text-zinc-600 sm:text-[9px] sm:tracking-[0.12em]">
            {d}
          </div>
        ))}
        {WEEK_DEMO_DAYS.map((v, i) => (
          <div
            key={i}
            className={cn(
              "flex min-h-[3.25rem] min-w-0 flex-col items-center justify-center overflow-hidden rounded-lg border px-0.5 py-1.5 sm:min-h-[5rem] sm:rounded-xl sm:px-1 sm:py-2.5 lg:min-h-[5.5rem]",
              weekCellClass(v),
            )}
          >
            <span className="w-full min-w-0 px-0.5 text-center font-mono text-[clamp(0.55rem,2.5vw,0.7rem)] tabular-nums leading-tight [overflow-wrap:anywhere] sm:text-[12px]">
              {v === 0 ? "—" : fmtUsd(v)}
            </span>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-[oklch(0.58_0.14_252/0.55)] bg-[linear-gradient(135deg,oklch(0.2_0.06_262/0.55),oklch(0.1_0.04_268/0.75))] px-4 py-4 sm:rounded-2xl sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.45_0.14_252/0.08),transparent_45%)]" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500 sm:text-[10px]">Week total</p>
            <p className="font-display mt-1.5 text-[clamp(1.35rem,4vw,2rem)] font-semibold tabular-nums tracking-[-0.04em] text-emerald-200 sm:mt-2">
              {fmtUsd(WEEK_DEMO_TOTAL)}
            </p>
          </div>
          <p className="max-w-[11rem] text-[11px] leading-snug text-zinc-500 sm:text-right sm:text-[12px]">The rhythm of the week.</p>
        </div>
      </div>
    </div>
  );
}

export function HeroPremium() {
  const [mode, setMode] = useState<ViewMode>("week");
  const reducedMotion = useReducedMotion();
  const reduced = reducedMotion === true;
  const tabId = useId();
  const panelId = `${tabId}-panel`;

  const panelTransition = reduced
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const };

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const idx = MODES.findIndex((m) => m.id === mode);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setMode(MODES[(idx + 1) % MODES.length].id);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setMode(MODES[(idx - 1 + MODES.length) % MODES.length].id);
    }
  }

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-white/[0.08] pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,320px)] bg-[linear-gradient(180deg,oklch(0.1_0.06_262/0.35)_0%,transparent_72%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.02fr)] lg:items-center lg:gap-12 xl:gap-14">
          {/* Copy — left on desktop, stacked on mobile */}
          <div className="text-center lg:text-left">
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[oklch(0.62_0.11_252)]">Blueveno</p>
            <h1
              id="hero-heading"
              className="font-display mt-5 text-[clamp(1.65rem,4vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-50 sm:mt-6"
            >
              Cold precision.{" "}
              <span className="bg-gradient-to-r from-zinc-100 via-[oklch(0.9_0.04_250)] to-[oklch(0.65_0.12_252)] bg-clip-text text-transparent">
                One ledger.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-[26rem] text-[15px] leading-[1.55] tracking-[-0.018em] text-zinc-400 sm:text-[16px] lg:mx-0">
              Journal, chart, week — one surface. No spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="/pricing">Plans</PremiumGhostLink>
            </div>
          </div>

          {/* Preview — right on desktop */}
          <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:max-w-none">
            <div
              className={cn(
                "relative rounded-2xl p-[1px] sm:rounded-[1.65rem]",
                "bg-[linear-gradient(145deg,oklch(0.44_0.12_252/0.55),oklch(0.18_0.06_268/0.35)_38%,oklch(0.38_0.12_252/0.48))]",
                "shadow-[0_28px_80px_-40px_rgba(0,0,0,0.82),0_0_0_1px_oklch(0.45_0.1_252/0.18)]",
              )}
            >
              <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-[linear-gradient(168deg,oklch(0.11_0.04_264/0.98),oklch(0.055_0.03_268/0.99))] sm:rounded-[calc(1.65rem-1px)]">
                <div className="relative z-[1]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-6 sm:py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex gap-1.5" aria-hidden>
                        <span className="size-2 rounded-full bg-[oklch(0.45_0.14_25)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.65_0.12_88)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.5_0.12_152)]" />
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[10px]">Workspace</span>
                    </div>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-400/90 sm:text-[10px]">Live</span>
                  </div>

                  <div className="border-b border-white/[0.06] px-3 py-3 sm:px-5">
                    <div
                      role="tablist"
                      aria-label="Preview mode"
                      onKeyDown={onTabKeyDown}
                      className="grid w-full grid-cols-3 gap-0 rounded-xl bg-black/55 p-1 ring-1 ring-white/[0.07] sm:rounded-2xl sm:p-1.5"
                    >
                      {MODES.map(({ id, label }) => {
                        const selected = mode === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="tab"
                            id={`${tabId}-${id}`}
                            aria-selected={selected}
                            aria-controls={panelId}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setMode(id)}
                            className={cn(
                              "relative flex min-h-[2.5rem] min-w-0 items-center justify-center rounded-lg border border-transparent px-1 py-2 text-center text-[12px] font-medium leading-none tracking-[-0.02em] transition-colors duration-200 sm:min-h-[2.75rem] sm:rounded-xl sm:py-2.5 sm:text-[13px]",
                              selected
                                ? "border-white/[0.1] bg-[linear-gradient(180deg,oklch(0.24_0.07_262/0.92),oklch(0.12_0.04_268/0.95))] text-zinc-50 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.1)]"
                                : "text-zinc-500 hover:text-zinc-300",
                            )}
                          >
                            <span className="relative z-10">{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-b border-white/[0.05] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        id={panelId}
                        key={mode}
                        role="tabpanel"
                        aria-labelledby={`${tabId}-${mode}`}
                        initial={reduced ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? undefined : { opacity: 0, y: -6 }}
                        transition={panelTransition}
                      >
                        {mode === "day" ? <DayPanel /> : null}
                        {mode === "chart" ? <ChartPanel /> : null}
                        {mode === "week" ? <WeekPanel /> : null}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="border-t border-white/[0.05]" />

                  <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-3.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600 sm:text-[10px]">Surface</p>
                    <Link
                      href="/login"
                      className="font-mono text-[9px] uppercase tracking-[0.18em] text-[oklch(0.72_0.11_252)] transition hover:text-zinc-200 sm:text-[10px]"
                    >
                      Sign in →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
