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

/** Single week — visually dominant row */
const WEEK_DEMO_DAYS = [320, -180, 0, 540, -95, 410, 275] as const;
const WEEK_DEMO_TOTAL = WEEK_DEMO_DAYS.reduce<number>((a, b) => a + b, 0);
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const TV_SAMPLE = "https://www.tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21";

function fmtUsd(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

function cellClass(n: number) {
  if (n > 0)
    return "border-emerald-400/40 bg-[linear-gradient(165deg,oklch(0.22_0.08_155/0.45),oklch(0.1_0.04_160/0.35))] text-emerald-50 shadow-[inset_0_1px_0_0_oklch(0.85_0.06_155/0.15)]";
  if (n < 0)
    return "border-rose-400/35 bg-[linear-gradient(165deg,oklch(0.24_0.07_18/0.4),oklch(0.12_0.04_20/0.32))] text-rose-50 shadow-[inset_0_1px_0_0_oklch(0.9_0.05_15/0.08)]";
  return "border-white/[0.1] bg-white/[0.04] text-zinc-500";
}

function ChartPreviewSvg() {
  const gid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 420 240" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.5 0.14 252)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 268)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-stroke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.55 0.14 252)" />
          <stop offset="100%" stopColor="oklch(0.45 0.12 252)" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" fill={`url(#${gid}-fill)`} rx="14" />
      {[48, 88, 128, 168, 208].map((y) => (
        <line key={y} x1="28" y1={y} x2="392" y2={y} stroke="oklch(0.42 0.02 260)" strokeOpacity="0.22" strokeWidth="1" />
      ))}
      <line x1="28" y1="128" x2="392" y2="128" stroke="oklch(0.58 0.1 252)" strokeOpacity="0.45" strokeWidth="1.5" />
      {(
        [
          { x: 52, y: 148, w: 20, h: 36 },
          { x: 96, y: 132, w: 24, h: 48 },
          { x: 140, y: 138, w: 22, h: 40 },
          { x: 184, y: 118, w: 26, h: 58 },
          { x: 228, y: 128, w: 22, h: 44 },
          { x: 272, y: 108, w: 24, h: 62 },
          { x: 316, y: 118, w: 22, h: 46 },
          { x: 360, y: 98, w: 26, h: 68 },
        ] as const
      ).map((c, i) => (
        <g key={i}>
          <line x1={c.x + c.w / 2} y1={c.y - 10} x2={c.x + c.w / 2} y2={c.y + c.h + 10} stroke="oklch(0.7 0.12 252)" strokeWidth="2" />
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="4" fill="oklch(0.52 0.14 155)" opacity="0.88" />
        </g>
      ))}
      <path
        d="M 40 175 Q 120 120 200 100 T 380 85"
        fill="none"
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

function DayPanel() {
  return (
    <div className="flex min-h-[420px] flex-col justify-between gap-10 lg:min-h-[460px]">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[oklch(0.62_0.11_252)]">Session</p>
        <p className="font-display mt-4 text-[clamp(2rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-zinc-50">
          Tuesday, April 15
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-[oklch(0.55_0.12_252/0.45)] bg-[oklch(0.16_0.06_262/0.55)] px-4 py-2 font-mono text-[14px] font-medium tracking-wide text-zinc-100">
            NQ
          </span>
          <span className="text-[14px] text-zinc-500">CME · Regular session</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-zinc-500">Day P&amp;L</p>
        <p className="font-display mt-3 text-[clamp(2.5rem,6vw,3.75rem)] font-semibold tabular-nums tracking-[-0.05em] text-emerald-200">
          +$2,847
        </p>
      </div>
      <p className="max-w-md border-l-2 border-[oklch(0.55_0.12_252/0.65)] pl-6 text-[15px] leading-[1.6] text-zinc-400">
        Trend off the open; flat before the late chop.
      </p>
    </div>
  );
}

function ChartPanel() {
  return (
    <div className="flex min-h-[420px] flex-col gap-8 lg:min-h-[460px]">
      <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.52_0.12_252/0.28)] bg-[linear-gradient(168deg,oklch(0.09_0.04_264/0.95),oklch(0.045_0.03_268/0.98))] p-1 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.07)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Linked chart</span>
          <span className="rounded-md border border-white/[0.08] bg-black/30 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
            NQ · 15m
          </span>
        </div>
        <div className="p-4 pt-2">
          <ChartPreviewSvg />
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-sm font-mono text-[11px] leading-relaxed text-zinc-500">
          Same row as the session — always in context.
        </p>
        <a
          href={TV_SAMPLE}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[oklch(0.58_0.12_252/0.5)]",
            "bg-[linear-gradient(180deg,oklch(0.26_0.08_262/0.95),oklch(0.14_0.045_266/0.98))] px-6 py-3.5 text-[14px] font-semibold text-zinc-50",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08)] transition hover:border-[oklch(0.65_0.12_252/0.65)]",
          )}
        >
          Open chart
          <ExternalLink className="size-4 opacity-90" strokeWidth={2} />
        </a>
      </div>
    </div>
  );
}

function WeekPanel() {
  return (
    <div className="flex min-h-[420px] flex-col gap-8 lg:min-h-[460px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.62_0.11_252)]">Month rhythm</p>
          <p className="font-display mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-zinc-50">April — week at a glance</p>
        </div>
        <p className="font-mono text-[11px] text-zinc-600">Daily P&amp;L · USD</p>
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600 sm:text-[10px]">
            {d}
          </div>
        ))}
        {WEEK_DEMO_DAYS.map((v, i) => (
          <div
            key={i}
            className={cn(
              "flex min-h-[5.5rem] flex-col items-center justify-center rounded-xl border px-1 py-3 sm:min-h-[6.25rem]",
              cellClass(v),
            )}
          >
            <span className="font-mono text-[11px] tabular-nums sm:text-[12px]">{v === 0 ? "—" : fmtUsd(v)}</span>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.55_0.14_252/0.5)] bg-[linear-gradient(135deg,oklch(0.19_0.055_262/0.55),oklch(0.1_0.04_268/0.75))] px-6 py-6 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_0%_50%,oklch(0.45_0.14_252/0.12),transparent_55%)]" />
        <div className="relative flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">Week total</p>
            <p className="font-display mt-2 text-[clamp(2rem,4.5vw,2.85rem)] font-semibold tabular-nums tracking-[-0.045em] text-emerald-200">
              {fmtUsd(WEEK_DEMO_TOTAL)}
            </p>
          </div>
          <p className="max-w-[12rem] text-right text-[12px] leading-snug text-zinc-500">The week at a glance.</p>
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
    : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

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
      className="relative overflow-hidden border-b border-white/[0.08] pb-28 pt-28 sm:pb-36 sm:pt-32 lg:pb-40 lg:pt-36"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.1_0.06_262/0.55)_0%,transparent_48%,oklch(0.04_0.04_272/0.4)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.14_252/0.35)] to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-20 lg:flex-row lg:items-stretch lg:gap-16 xl:gap-20">
          {/* Left copy */}
          <div className="flex max-w-xl flex-1 flex-col justify-center lg:max-w-[520px] lg:pt-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[oklch(0.62_0.11_252)]">Blueveno</p>
            <h1
              id="hero-heading"
              className="font-display mt-7 text-[clamp(2.5rem,5.5vw,3.85rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-zinc-50"
            >
              Cold precision.{" "}
              <span className="bg-gradient-to-r from-zinc-100 via-[oklch(0.9_0.04_250)] to-[oklch(0.65_0.12_252)] bg-clip-text text-transparent">
                One ledger.
              </span>
            </h1>
            <p className="mt-8 max-w-[24rem] text-[16px] leading-[1.6] tracking-[-0.018em] text-zinc-400 sm:text-[17px]">
              Journal, chart, week — one surface. No spreadsheets.
            </p>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="/pricing">Plans</PremiumGhostLink>
            </div>
          </div>

          {/* Right — single product object */}
          <div className="relative min-w-0 flex-1 lg:max-w-none">
            <div
              className={cn(
                "relative rounded-[2rem] p-[1px]",
                "bg-[linear-gradient(145deg,oklch(0.42_0.12_252/0.55),oklch(0.2_0.06_268/0.35)_40%,oklch(0.35_0.1_252/0.45))]",
                "shadow-[0_32px_100px_-40px_rgba(0,0,0,0.65),0_0_0_1px_oklch(0.45_0.1_252/0.15)]",
              )}
            >
              <div className="overflow-hidden rounded-[calc(2rem-1px)] bg-[linear-gradient(168deg,oklch(0.11_0.04_264/0.98),oklch(0.055_0.03_268/0.99))]">
                <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-7">
                  <div className="flex items-center gap-3">
                    <span className="flex gap-1.5" aria-hidden>
                      <span className="size-2.5 rounded-full bg-[oklch(0.45_0.14_25)]" />
                      <span className="size-2.5 rounded-full bg-[oklch(0.65_0.12_88)]" />
                      <span className="size-2.5 rounded-full bg-[oklch(0.5_0.12_152)]" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Workspace</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/90">Live</span>
                </div>

                <div className="border-b border-white/[0.06] px-4 py-4 sm:px-6">
                  <div
                    role="tablist"
                    aria-label="Preview mode"
                    onKeyDown={onTabKeyDown}
                    className="relative flex w-full rounded-2xl bg-black/50 p-1.5 ring-1 ring-white/[0.06]"
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
                            "relative flex-1 rounded-xl py-3 text-[14px] font-semibold tracking-[-0.02em] transition-colors duration-300",
                            selected ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300",
                          )}
                        >
                          {selected ? (
                            <motion.span
                              layoutId="hero-premium-tab"
                              className="absolute inset-0 rounded-xl border border-white/[0.12] bg-[linear-gradient(180deg,oklch(0.22_0.06_262/0.9),oklch(0.12_0.04_268/0.95))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.1)]"
                              transition={{ type: "spring", stiffness: 420, damping: 34 }}
                            />
                          ) : null}
                          <span className="relative z-10">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="border-b border-white/[0.05] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-11">
                  <AnimatePresence mode="wait">
                    <motion.div
                      id={panelId}
                      key={mode}
                      role="tabpanel"
                      aria-labelledby={`${tabId}-${mode}`}
                      initial={reduced ? false : { opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduced ? undefined : { opacity: 0, y: -10 }}
                      transition={panelTransition}
                    >
                      {mode === "day" ? <DayPanel /> : null}
                      {mode === "chart" ? <ChartPanel /> : null}
                      {mode === "week" ? <WeekPanel /> : null}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] px-6 py-4 sm:px-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Surface</p>
                  <Link
                    href="/login"
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.72_0.11_252)] transition hover:text-zinc-200"
                  >
                    Sign in →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
