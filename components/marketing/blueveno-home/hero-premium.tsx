"use client";

import { useId, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "chart" | "week";

const MODES: { id: ViewMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "chart", label: "Chart" },
  { id: "week", label: "Week" },
];

/** Demo week: 4 green, 1 red, 2 flat — sums to +€642 */
const WEEK_DEMO_DAYS = [250, 180, 150, 162, -100, 0, 0] as const;
const WEEK_DEMO_TOTAL = WEEK_DEMO_DAYS.reduce<number>((a, b) => a + b, 0);
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const TV_SAMPLE = "https://www.tradingview.com/chart/?symbol=CME_MINI%3ANQ1%21";

function fmtEur(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}€${Math.abs(n).toLocaleString()}`;
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
    <svg viewBox="0 0 420 280" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.52 0.16 252)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 268)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}-stroke`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.62 0.16 252)" />
          <stop offset="100%" stopColor="oklch(0.48 0.12 252)" />
        </linearGradient>
        <radialGradient id={`${gid}-glow`} cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.45 0.14 252)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="oklch(0.08 0.03 268)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="420" height="280" fill={`url(#${gid}-glow)`} rx="14" />
      <rect width="420" height="280" fill={`url(#${gid}-fill)`} rx="14" />
      {[40, 76, 112, 148, 184, 220].map((y) => (
        <line key={y} x1="20" y1={y} x2="400" y2={y} stroke="oklch(0.38 0.02 260)" strokeOpacity="0.28" strokeWidth="1" />
      ))}
      <line x1="20" y1="140" x2="400" y2="140" stroke="oklch(0.58 0.12 252)" strokeOpacity="0.5" strokeWidth="1.35" />
      {(
        [
          { x: 44, y: 158, w: 26, h: 52 },
          { x: 96, y: 134, w: 26, h: 72 },
          { x: 148, y: 146, w: 24, h: 58 },
          { x: 198, y: 118, w: 28, h: 82 },
          { x: 252, y: 128, w: 24, h: 68 },
          { x: 300, y: 108, w: 26, h: 84 },
          { x: 352, y: 124, w: 24, h: 64 },
        ] as const
      ).map((c, i) => (
        <g key={i}>
          <line x1={c.x + c.w / 2} y1={c.y - 8} x2={c.x + c.w / 2} y2={c.y + c.h + 8} stroke="oklch(0.72 0.12 252)" strokeOpacity="0.85" strokeWidth="2" />
          <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="4" fill="oklch(0.48 0.14 155)" opacity="0.9" />
        </g>
      ))}
      <path
        d="M 32 198 Q 132 118 210 98 T 388 76"
        fill="none"
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="2.75"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}

function DayPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(165deg,oklch(0.1_0.045_262/0.95),oklch(0.055_0.03_268/0.98))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.07)] sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">
          <span className="text-[oklch(0.8_0.11_252)]">THU</span> · MAY 8
        </p>
        <p className="font-display text-[clamp(1.7rem,4.6vw,2.55rem)] font-semibold tabular-nums tracking-[-0.05em] text-emerald-300 [text-shadow:0_0_44px_oklch(0.56_0.15_155/0.34)]">
          +$180
        </p>
      </div>

      <div className="flex-1 py-6">
        <p className="font-display text-[clamp(1.2rem,2.8vw,1.6rem)] font-semibold tracking-[-0.03em] text-zinc-100">NQ Long</p>
        <p className="mt-3 max-w-[44ch] text-[15px] leading-[1.6] tracking-[-0.015em] text-zinc-300 sm:text-[16px]">
          Clean drive, no revenge entries. Followed plan and protected gains into close.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-white/[0.06] pt-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Signature</p>
          <p className="mt-1 font-display text-[clamp(1.05rem,2vw,1.35rem)] font-semibold tracking-[-0.03em] text-zinc-100">
            Discipline Score
          </p>
          <p className="mt-1 text-[12px] text-zinc-400">Mood: Focused · Plan, stop, and execution all respected.</p>
        </div>
        <div className="relative flex size-[4.75rem] items-center justify-center rounded-full border border-emerald-400/45 bg-[radial-gradient(circle_at_40%_30%,oklch(0.34_0.1_155/0.58),oklch(0.13_0.06_160/0.42))] shadow-[inset_0_1px_0_0_oklch(0.9_0.07_155/0.18),0_0_30px_oklch(0.45_0.14_155/0.22)]">
          <span className="font-display text-[1.05rem] font-semibold tabular-nums tracking-[-0.04em] text-emerald-100">100</span>
        </div>
      </div>
    </div>
  );
}

function ChartPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(168deg,oklch(0.095_0.045_262/0.96),oklch(0.05_0.03_268/0.99))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.07)] sm:p-6">
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-400/40 blur-[3px]" aria-hidden />
            <span className="relative size-2 rounded-full bg-emerald-400 shadow-[0_0_12px_oklch(0.72_0.16_155/0.7)]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-300">TradingView linked</span>
        </div>
        <span className="rounded-lg border border-white/[0.1] bg-black/40 px-2.5 py-1 font-mono text-[10px] text-zinc-400">NQ · 15m</span>
      </div>

      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-[oklch(0.5_0.13_252/0.45)] bg-[linear-gradient(165deg,oklch(0.07_0.04_268/0.98),oklch(0.04_0.03_272/0.99))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08),0_20px_56px_-30px_oklch(0_0_0/0.92)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.42_0.12_252/0.08),transparent_42%)]" />
        <div className="relative h-full min-h-0 p-3 sm:p-4">
          <ChartPreviewSvg />
        </div>
      </div>

      <div className="mt-4 shrink-0 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
        <div>
          <p className="font-mono text-[12px] font-semibold tracking-wide text-zinc-200">NQ1! · CME</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Saved 15:42 · review linked</p>
        </div>
        <a
          href={TV_SAMPLE}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[oklch(0.55_0.14_252/0.55)]",
            "bg-[linear-gradient(180deg,oklch(0.28_0.09_262/0.96),oklch(0.14_0.05_268/0.98))] px-5 py-2.5 text-[13px] font-semibold text-zinc-50",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.1),0_8px_24px_-12px_oklch(0.35_0.12_252/0.5)] transition hover:border-[oklch(0.68_0.12_252/0.65)] hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.45)]",
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[linear-gradient(165deg,oklch(0.095_0.045_262/0.96),oklch(0.052_0.03_268/0.99))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.07)] sm:p-6">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] pb-5">
        <p className="font-display text-[clamp(1.2rem,3vw,1.65rem)] font-semibold tracking-[-0.035em] text-zinc-50">
          This week
        </p>
        <div className="text-right">
          <p className="font-display text-[clamp(1.5rem,4vw,2.1rem)] font-semibold tabular-nums tracking-[-0.045em] text-emerald-300 [text-shadow:0_0_40px_oklch(0.55_0.14_155/0.3)]">
            {fmtEur(WEEK_DEMO_TOTAL)}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 pt-5 pb-8">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-[oklch(0.55_0.12_252/0.35)] bg-[linear-gradient(160deg,oklch(0.22_0.08_262/0.82),oklch(0.1_0.05_268/0.9))] px-4 py-3 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08),0_18px_42px_-28px_oklch(0.35_0.12_252/0.35)]">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">Signature</p>
            <p className="mt-1 font-display text-[1rem] font-semibold tracking-[-0.03em] text-zinc-100">Week Quality</p>
          </div>
          <div className="relative flex h-10 min-w-[5.5rem] items-center justify-center rounded-xl border border-[oklch(0.62_0.13_252/0.42)] bg-[oklch(0.12_0.05_266/0.7)]">
            <span className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_40%,oklch(0.55_0.14_252/0.2),transparent_72%)]" />
            <span className="relative font-display text-[1.1rem] font-semibold tracking-[-0.04em] text-[oklch(0.86_0.08_252)]">87%</span>
          </div>
        </div>
        <div className="grid h-full min-h-0 min-w-0 grid-cols-7 grid-rows-[auto_minmax(0,1fr)] gap-x-1.5 gap-y-2 sm:gap-x-2">
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="pb-0.5 text-center font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-500 sm:text-[9px]"
            >
              {d}
            </div>
          ))}
          {WEEK_DEMO_DAYS.map((v, i) => (
            <div
              key={i}
              className={cn(
                "flex min-h-0 min-w-0 flex-col items-center justify-center rounded-xl border px-0.5 py-2 sm:rounded-2xl sm:py-3",
                weekCellClass(v),
              )}
            >
              <span className="w-full min-w-0 px-0.5 text-center font-mono text-[clamp(0.6rem,2.2vw,0.8rem)] font-semibold tabular-nums leading-tight [overflow-wrap:anywhere] sm:text-[13px]">
                {v === 0 ? "—" : fmtEur(v)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="shrink-0 border-t border-white/[0.06] pt-4 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-300 sm:text-[12px]">
        4 green days · 1 red day · 2 flat
      </p>
    </div>
  );
}

type BottomStripProps = { mode: ViewMode };

function HeroProductBottomStrip({ mode }: BottomStripProps) {
  const copy =
    mode === "day"
      ? { left: "Mood + discipline logged", right: "Calm / Focused / Hesitant / Tilted" }
      : mode === "chart"
        ? { left: "TradingView fingerprint", right: "Chart linked to session" }
        : { left: "Weekly quality", right: "Score + reflection ready" };

  return (
    <div className="flex min-h-[3.35rem] items-center justify-between gap-3 px-4 py-3.5 sm:min-h-[3.6rem] sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="size-1.5 shrink-0 rounded-full bg-[oklch(0.55_0.12_252/0.9)] shadow-[0_0_10px_oklch(0.55_0.12_252/0.45)]" aria-hidden />
        <p className="truncate whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 sm:text-[11px]">
          {copy.left}
        </p>
      </div>
      <p className="hidden max-w-[46%] truncate whitespace-nowrap text-right font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500 sm:block sm:text-[11px]">
        {copy.right}
      </p>
      <Link
        href="/login"
        className="ml-3 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.72_0.12_252)] transition hover:text-zinc-200 sm:text-[11px]"
      >
        Sign in →
      </Link>
    </div>
  );
}

export function HeroPremium() {
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
              Track the result.{" "}
              <span className="bg-gradient-to-r from-zinc-100 via-[oklch(0.9_0.04_250)] to-[oklch(0.65_0.12_252)] bg-clip-text text-transparent">
                Review the behavior.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-[26rem] text-[15px] leading-[1.55] tracking-[-0.018em] text-zinc-400 sm:text-[16px] lg:mx-0">
              Log the day, save the chart, and see how you actually traded — calm, focused, hesitant, or tilted.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="/pricing">Plans</PremiumGhostLink>
            </div>
          </div>

          {/* Preview — right on desktop (premium interactive slab) */}
          <div className="relative mx-auto w-full max-w-[620px] lg:mx-0 lg:max-w-none">
            <div
              className={cn(
                "relative rounded-2xl p-[1px] sm:rounded-[1.8rem]",
                "bg-[linear-gradient(145deg,oklch(0.55_0.14_252/0.65)_0%,oklch(0.2_0.06_268/0.42)_40%,oklch(0.52_0.15_252/0.58)_100%)]",
                "shadow-[0_40px_120px_-52px_rgba(0,0,0,0.9),0_0_0_1px_oklch(0.46_0.11_252/0.24),inset_0_1px_0_0_oklch(0.7_0.1_252/0.13)]",
              )}
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_70%_20%,oklch(0.48_0.14_252/0.18),transparent_60%)]"
                animate={reduced ? undefined : { opacity: [0.42, 0.72, 0.42] }}
                transition={reduced ? undefined : { duration: 5.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <div
                className={cn(
                  "relative overflow-hidden rounded-[calc(1rem-1px)] sm:rounded-[calc(1.75rem-1px)]",
                  "bg-[linear-gradient(172deg,oklch(0.092_0.045_262/0.995),oklch(0.042_0.028_272/0.998))]",
                  "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08),inset_0_-36px_72px_-52px_oklch(0_0_0/0.62)]",
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_88%_-12%,oklch(0.44_0.14_252/0.16),transparent_52%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,oklch(0_0_0/0.18)_95%)]" />
                <div className="relative z-[1]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/[0.09] px-4 py-3.5 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex gap-1.5" aria-hidden>
                        <span className="size-2 rounded-full bg-[oklch(0.45_0.14_25)] shadow-[0_0_8px_oklch(0.5_0.14_25/0.4)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.65_0.12_88)] shadow-[0_0_8px_oklch(0.65_0.12_88/0.35)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.5_0.12_152)] shadow-[0_0_8px_oklch(0.5_0.12_152/0.35)]" />
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500 sm:text-[10px]">Workspace</span>
                    </div>
                    <span className="inline-flex items-center gap-2">
                      <span className="bv-live-dot size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_14px_oklch(0.65_0.14_155/0.55)]" aria-hidden />
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/95 sm:text-[10px]">Live</span>
                    </span>
                  </div>

                  <div className="border-b border-white/[0.06] bg-[linear-gradient(180deg,oklch(0.07_0.04_268/0.55),transparent)] px-3 py-3.5 sm:px-5 sm:py-4">
                    <LayoutGroup id={`${tabId}-hero-tabs`}>
                      <div
                        role="tablist"
                        aria-label="Preview mode"
                        onKeyDown={onTabKeyDown}
                        className="relative grid w-full grid-cols-3 gap-1 rounded-2xl bg-black/60 p-1.5 ring-1 ring-[oklch(0.48_0.1_252/0.25)] sm:gap-1.5 sm:p-2"
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
                                "relative z-[1] flex min-h-[2.65rem] min-w-0 items-center justify-center rounded-xl px-2 py-2.5 text-center text-[13px] font-semibold leading-none tracking-[-0.02em] transition-colors duration-300 sm:min-h-[2.85rem] sm:text-[14px]",
                                selected ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300",
                              )}
                            >
                              {selected && !reduced ? (
                                <motion.span
                                  layoutId={`hero-product-tab-${tabId}`}
                                  className="absolute inset-0 z-0 rounded-xl border border-white/[0.12] bg-[linear-gradient(180deg,oklch(0.32_0.1_262/0.95),oklch(0.16_0.06_268/0.98))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.12),0_12px_32px_-18px_oklch(0.35_0.12_252/0.45)]"
                                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                                />
                              ) : selected && reduced ? (
                                <span className="absolute inset-0 z-0 rounded-xl border border-white/[0.12] bg-[linear-gradient(180deg,oklch(0.32_0.1_262/0.95),oklch(0.16_0.06_268/0.98))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.12)]" />
                              ) : null}
                              <span className="relative z-[1]">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </LayoutGroup>
                  </div>

                  <div className="border-b border-white/[0.05] px-4 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-8">
                    {/* Fixed height so Day / Chart / Week never change the slab size when switching */}
                    <div className="relative h-[28.25rem] sm:h-[31.25rem] lg:h-[32rem]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          id={panelId}
                          key={mode}
                          role="tabpanel"
                          aria-labelledby={`${tabId}-${mode}`}
                          className="absolute inset-0 flex min-h-0 flex-col"
                          initial={reduced ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduced ? undefined : { opacity: 0, y: -4 }}
                          transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {mode === "day" ? <DayPanel /> : null}
                          {mode === "chart" ? <ChartPanel /> : null}
                          {mode === "week" ? <WeekPanel /> : null}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="border-t border-white/[0.07] bg-[linear-gradient(0deg,oklch(0.055_0.03_268/0.85),transparent)]">
                    <HeroProductBottomStrip mode={mode} />
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
