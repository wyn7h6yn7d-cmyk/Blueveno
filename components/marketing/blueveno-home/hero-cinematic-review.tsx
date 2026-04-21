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

/** Demo week rows: 5 weeks × 7 day P&L-ish values + weekly sum label */
const WEEK_DEMO: { days: number[]; weekTotal: number }[] = [
  { days: [240, -120, 0, 480, -80, 320, 190], weekTotal: 1030 },
  { days: [-200, 150, 410, 0, -90, 220, 180], weekTotal: 670 },
  { days: [100, 100, -300, 400, 200, -150, 0], weekTotal: 350 },
  { days: [0, 520, -100, -100, 300, 0, 440], weekTotal: 1060 },
  { days: [-50, 80, 120, -200, 0, 350, 110], weekTotal: 410 },
];

const TV_SAMPLE = "https://www.tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21";

function money(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString()}`;
}

function dayTone(n: number) {
  if (n > 0) return "bg-emerald-500/22 text-emerald-100 border-emerald-400/25";
  if (n < 0) return "bg-rose-500/18 text-rose-100 border-rose-400/22";
  return "bg-white/[0.04] text-zinc-400 border-white/[0.08]";
}

function ChartPreviewSvg() {
  const gid = useId();
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full max-h-[240px]" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.45 0.12 252)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="oklch(0.08 0.03 268)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill={`url(#${gid}-fade)`} rx="12" />
      {/* grid */}
      {[40, 80, 120, 160, 200].map((y) => (
        <line key={y} x1="24" y1={y} x2="376" y2={y} stroke="oklch(0.4 0.02 260)" strokeOpacity="0.25" strokeWidth="1" />
      ))}
      {[56, 112, 168, 224, 280, 336].map((x) => (
        <line key={x} x1={x} y1="32" x2={x} y2="188" stroke="oklch(0.4 0.02 260)" strokeOpacity="0.2" strokeWidth="1" />
      ))}
      <line x1="24" y1="120" x2="376" y2="120" stroke="oklch(0.55 0.1 252)" strokeOpacity="0.35" strokeWidth="1.25" />
      {/* candles */}
      {(
        [
          { x: 48, y: 140, w: 18, h: 32, tone: "emerald" as const },
          { x: 88, y: 128, w: 22, h: 40, tone: "emerald" as const },
          { x: 128, y: 132, w: 20, h: 28, tone: "rose" as const },
          { x: 168, y: 118, w: 24, h: 48, tone: "emerald" as const },
          { x: 208, y: 125, w: 20, h: 36, tone: "rose" as const },
          { x: 248, y: 108, w: 22, h: 52, tone: "emerald" as const },
          { x: 288, y: 115, w: 20, h: 38, tone: "emerald" as const },
          { x: 328, y: 100, w: 24, h: 56, tone: "emerald" as const },
        ] as const
      ).map((c, i) => (
        <g key={i}>
          <line
            x1={c.x + c.w / 2}
            y1={c.y - 8}
            x2={c.x + c.w / 2}
            y2={c.y + c.h + 8}
            stroke={c.tone === "emerald" ? "oklch(0.72 0.14 155)" : "oklch(0.68 0.16 18)"}
            strokeWidth="2"
          />
          <rect
            x={c.x}
            y={c.y}
            width={c.w}
            height={c.h}
            rx="3"
            fill={c.tone === "emerald" ? "oklch(0.55 0.14 155)" : "oklch(0.52 0.16 18)"}
            opacity="0.92"
          />
        </g>
      ))}
    </svg>
  );
}

function DaySurface() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12">
      <div className="space-y-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.62_0.1_252)]">Session</p>
          <p className="font-display mt-3 text-[clamp(1.75rem,3.5vw,2.35rem)] font-semibold tracking-[-0.04em] text-zinc-50">
            Tuesday, April 15
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 font-mono text-[13px] tracking-wide text-zinc-200">
            NQ
          </span>
          <span className="text-[13px] text-zinc-500">CME · Day session</span>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Day P&amp;L</p>
          <p className="font-display mt-2 text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tabular-nums tracking-[-0.045em] text-emerald-200">
            +2.4 R
          </p>
        </div>
        <blockquote className="border-l-2 border-[oklch(0.55_0.12_252/0.55)] pl-5 text-[15px] leading-relaxed text-zinc-400">
          Clean trend off the open. Reduced size into the close — booked before the late chop.
        </blockquote>
      </div>
      <div className="hidden h-48 w-px bg-gradient-to-b from-transparent via-white/[0.12] to-transparent lg:block" aria-hidden />
      <div className="rounded-2xl border border-white/[0.08] bg-black/30 p-5 lg:max-w-[14rem]">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Status</p>
        <p className="mt-3 font-mono text-[13px] text-emerald-200/90">Logged · synced</p>
        <p className="mt-4 text-[12px] leading-relaxed text-zinc-600">One tap from your calendar and stats.</p>
      </div>
    </div>
  );
}

function ChartSurface() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
      <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.1_0.03_264/0.9),oklch(0.06_0.025_268/0.95))] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Saved chart</span>
          <span className="rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-zinc-400">NQ · 15m</span>
        </div>
        <div className="pt-4">
          <ChartPreviewSvg />
        </div>
      </div>
      <div className="flex flex-col justify-center space-y-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">TradingView</p>
          <p className="mt-3 break-all font-mono text-[12px] leading-relaxed text-zinc-400">{TV_SAMPLE}</p>
        </div>
        <a
          href={TV_SAMPLE}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group inline-flex w-fit items-center gap-2 rounded-xl border border-[oklch(0.55_0.12_252/0.4)] bg-[linear-gradient(180deg,oklch(0.22_0.06_262/0.9),oklch(0.14_0.045_266/0.95))] px-5 py-3 text-[13px] font-medium text-zinc-100",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08)] transition hover:border-[oklch(0.58_0.12_252/0.55)]",
          )}
        >
          Open chart
          <ExternalLink className="size-4 opacity-80 transition group-hover:translate-x-0.5" strokeWidth={1.75} />
        </a>
        <p className="text-[13px] leading-relaxed text-zinc-600">
          The exact chart you reviewed — one link, forever attached to the day.
        </p>
      </div>
    </div>
  );
}

function WeekSurface() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[oklch(0.62_0.1_252)]">Month view</p>
          <p className="font-display mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-50">April — week totals</p>
        </div>
        <p className="font-mono text-[11px] text-zinc-500">Daily P&amp;L · USD</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.09] bg-[linear-gradient(168deg,oklch(0.11_0.035_262/0.85),oklch(0.07_0.028_266/0.9))] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-8 gap-2 border-b border-white/[0.06] pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            {days.map((d, i) => (
              <div key={`${d}-${i}`} className="text-center">
                {d}
              </div>
            ))}
            <div className="text-center text-[oklch(0.72_0.1_252)]">Σ</div>
          </div>
          <div className="mt-3 space-y-2">
            {WEEK_DEMO.map((row, wi) => (
              <div key={wi} className="grid grid-cols-8 gap-2">
                {row.days.map((v, di) => (
                  <div
                    key={di}
                    className={cn(
                      "flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center font-mono text-[11px] tabular-nums sm:text-[12px]",
                      dayTone(v),
                    )}
                  >
                    {v === 0 ? "—" : money(v)}
                  </div>
                ))}
                <div
                  className={cn(
                    "flex min-h-[44px] flex-col items-center justify-center rounded-lg border px-1 py-2 text-center font-mono text-[12px] font-semibold tabular-nums sm:text-[13px]",
                    row.weekTotal >= 0
                      ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-100"
                      : "border-rose-400/35 bg-rose-500/12 text-rose-100",
                  )}
                >
                  {money(row.weekTotal)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBackgroundMotion({ reduced }: { reduced: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* base depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,oklch(0.38_0.11_252/0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_100%,oklch(0.22_0.07_258/0.2),transparent_65%)]" />
      {/* slow grid drift — existing global utility */}
      <div
        className={cn(
          "absolute inset-[-40%] opacity-[0.07] motion-reduce:opacity-0",
          !reduced && "bg-market-grid-drift",
        )}
      />
      {/* coordinate crosshair — static + subtle */}
      <svg className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="50" y1="0" x2="50" y2="100" stroke="oklch(0.65 0.1 252)" strokeWidth="0.03" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="oklch(0.65 0.1 252)" strokeWidth="0.03" vectorEffect="non-scaling-stroke" />
      </svg>
      {/* scanning band — CSS animation */}
      {!reduced ? (
        <motion.div
          className="absolute inset-x-0 top-0 h-[45%] bg-[linear-gradient(180deg,transparent,oklch(0.55_0.1_252/0.04),transparent)]"
          animate={{ y: ["-20%", "120%"] }}
          transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      ) : null}
      {/* fine waveform lines — very low contrast */}
      <div
        className="absolute inset-0 opacity-[0.045] motion-reduce:opacity-0 bg-market-wave"
        style={{ mixBlendMode: "screen" }}
      />
    </div>
  );
}

export function HeroCinematicReview() {
  const [mode, setMode] = useState<ViewMode>("week");
  const reducedMotion = useReducedMotion();
  const reduced = reducedMotion === true;
  const tabId = useId();
  const panelId = `${tabId}-panel`;

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
      className="relative overflow-hidden border-b border-white/[0.06] pb-20 pt-28 sm:pb-28 sm:pt-32"
      aria-labelledby="hero-heading"
    >
      <HeroBackgroundMotion reduced={reduced} />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* copy block — centered, not left-rail */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[oklch(0.68_0.1_252)]">Blueveno</p>
          <h1
            id="hero-heading"
            className="font-display mt-5 text-[clamp(2.1rem,5.5vw,3.35rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-50"
          >
            Your session.
            <br />
            <span className="text-[oklch(0.88_0.06_250)]">One surface.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed tracking-[-0.015em] text-zinc-400 sm:text-base">
            Log the day. Note what mattered. Save the chart. See the week in color.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
            <PremiumGhostLink href="/pricing">View pricing</PremiumGhostLink>
          </div>
        </div>

        {/* single product object */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="rounded-[28px] border border-white/[0.12] bg-[linear-gradient(145deg,oklch(0.14_0.04_262/0.5),oklch(0.08_0.03_268/0.65))] p-[1px] shadow-[0_40px_120px_-48px_rgba(0,0,0,0.85),inset_0_1px_0_0_oklch(1_0_0_/0.08)]">
            <div className="overflow-hidden rounded-[27px] bg-[linear-gradient(168deg,oklch(0.1_0.035_264/0.97),oklch(0.055_0.03_268/0.98))]">
              {/* chrome bar */}
              <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400/90 shadow-[0_0_12px_oklch(0.65_0.14_155/0.5)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Live preview</span>
                </div>
                <div
                  role="tablist"
                  aria-label="Preview mode"
                  onKeyDown={onTabKeyDown}
                  className="flex w-full gap-1 rounded-xl border border-white/[0.08] bg-black/40 p-1 sm:w-auto"
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
                          "relative flex-1 rounded-lg px-4 py-2.5 text-[13px] font-medium tracking-[-0.02em] transition sm:flex-none sm:px-5",
                          selected
                            ? "text-zinc-50"
                            : "text-zinc-500 hover:text-zinc-300",
                        )}
                      >
                        {selected ? (
                          <motion.span
                            layoutId="hero-tab"
                            className="absolute inset-0 rounded-lg border border-white/[0.1] bg-white/[0.08] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.1)]"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        ) : null}
                        <span className="relative z-10">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* morphing body */}
              <div className="min-h-[min(520px,72vh)] p-6 sm:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    id={panelId}
                    key={mode}
                    role="tabpanel"
                    aria-labelledby={`${tabId}-${mode}`}
                    initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 }}
                    transition={{ duration: reduced ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {mode === "day" ? <DaySurface /> : null}
                    {mode === "chart" ? <ChartSurface /> : null}
                    {mode === "week" ? <WeekSurface /> : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="border-t border-white/[0.05] px-6 py-4 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[11px] text-zinc-600">
                    Journal · calendar · stats — €5.99/mo after trial
                  </p>
                  <Link
                    href="/login"
                    className="font-mono text-[11px] uppercase tracking-[0.16em] text-[oklch(0.72_0.1_252)] hover:text-zinc-200"
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
