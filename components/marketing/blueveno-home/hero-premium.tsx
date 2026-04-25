"use client";

import { useId, useMemo, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight, CheckCircle2, ExternalLink, LineChart, Shield, Target } from "lucide-react";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { cn } from "@/lib/utils";

type ViewMode = "day" | "chart" | "week";

const MODES: { id: ViewMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "chart", label: "Chart" },
  { id: "week", label: "Week" },
];
const SUPPORT_CARDS = [
  { icon: LineChart, title: "Trade. Journal. Improve.", subtitle: "All in one calm workspace." },
  { icon: Shield, title: "Private by design.", subtitle: "Your data stays yours." },
  { icon: Target, title: "Built for consistency.", subtitle: "Better habits, better results." },
] as const;

const WEEK_DAYS = [
  { day: "Mon", pnl: 120 },
  { day: "Tue", pnl: -45 },
  { day: "Wed", pnl: 180 },
  { day: "Thu", pnl: 90 },
  { day: "Fri", pnl: -20 },
] as const;

function formatPnl(value: number) {
  const prefix = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${prefix}$${Math.abs(value).toLocaleString()}`;
}

function weekCellClass(n: number) {
  if (n > 0)
    return "border-emerald-400/45 bg-[linear-gradient(160deg,oklch(0.24_0.085_160/0.66),oklch(0.11_0.05_165/0.52))] text-emerald-50";
  if (n < 0)
    return "border-rose-400/40 bg-[linear-gradient(160deg,oklch(0.25_0.07_24/0.6),oklch(0.11_0.04_24/0.5))] text-rose-50";
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
      {[36, 70, 104, 138, 172, 206, 240].map((y) => (
        <line key={y} x1="16" y1={y} x2="404" y2={y} stroke="oklch(0.64 0.04 248)" strokeOpacity="0.18" strokeWidth="1" />
      ))}
      <line x1="20" y1="138" x2="400" y2="138" stroke="oklch(0.66 0.12 252)" strokeOpacity="0.4" strokeWidth="1.1" />
      <path
        d="M 30 195 C 72 172, 94 140, 132 132 C 158 126, 176 148, 206 145 C 230 142, 244 114, 270 108 C 305 98, 337 121, 387 82"
        fill="none"
        stroke={`url(#${gid}-stroke)`}
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.95"
      />
    </svg>
  );
}

function DayPanel() {
  const discipline = ["Followed plan", "Respected stop", "No revenge trade"];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-[linear-gradient(168deg,oklch(0.1_0.042_262/0.96),oklch(0.05_0.03_268/0.98))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">THU · MAY 8</p>
          <p className="mt-2 font-display text-xl font-semibold tracking-[-0.035em] text-zinc-100">NQ</p>
        </div>
        <p className="font-display text-[clamp(1.7rem,4.6vw,2.5rem)] font-semibold tabular-nums tracking-[-0.05em] text-emerald-300 [text-shadow:0_0_40px_oklch(0.56_0.15_155/0.3)]">
          +$180
        </p>
      </div>

      <div className="flex-1 py-6">
        <p className="mt-3 max-w-[44ch] text-[15px] leading-[1.6] tracking-[-0.015em] text-zinc-300 sm:text-[16px]">
          Opening drive only. Size held. No revenge after the flush.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Calm", "Focused", "Hesitant", "Tilted"].map((mood) => (
            <span
              key={mood}
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.14em]",
                mood === "Focused"
                  ? "border-[oklch(0.72_0.1_252/0.5)] bg-[oklch(0.32_0.09_252/0.35)] text-[oklch(0.9_0.03_252)]"
                  : "border-white/[0.14] bg-white/[0.03] text-zinc-400",
              )}
            >
              {mood}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-4 border-t border-white/[0.06] pt-5">
        <div className="space-y-2.5">
          {discipline.map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="size-1.5 rounded-full bg-emerald-300" />
              {item}
            </div>
          ))}
        </div>
        <div className="flex min-w-[8.7rem] flex-col rounded-2xl border border-[oklch(0.55_0.12_252/0.35)] bg-[oklch(0.09_0.04_266/0.6)] px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Discipline</span>
          <span className="mt-1 font-display text-xl font-semibold tracking-[-0.035em] text-zinc-100">3/3</span>
          <span className="text-xs text-zinc-400">100%</span>
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
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-300">Saved chart</span>
        </div>
        <span className="rounded-lg border border-white/[0.1] bg-black/40 px-2.5 py-1 font-mono text-[10px] text-zinc-400">NQ · 08 May</span>
      </div>

      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-2xl border border-[oklch(0.5_0.13_252/0.45)] bg-[linear-gradient(165deg,oklch(0.07_0.04_268/0.98),oklch(0.04_0.03_272/0.99))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08),0_20px_56px_-30px_oklch(0_0_0/0.92)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.42_0.12_252/0.08),transparent_42%)]" />
        <div className="relative h-full min-h-0 p-3 sm:p-4">
          <ChartPreviewSvg />
        </div>
      </div>

      <div className="mt-4 shrink-0 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
        <div>
          <p className="font-mono text-[12px] font-semibold tracking-wide text-zinc-200">NQ · Session close</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">Review attached</p>
        </div>
        <Link
          href="/signup"
          className={cn(
            "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[oklch(0.55_0.14_252/0.55)]",
            "bg-[linear-gradient(180deg,oklch(0.28_0.09_262/0.96),oklch(0.14_0.05_268/0.98))] px-5 py-2.5 text-[13px] font-semibold text-zinc-50",
            "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.1),0_8px_24px_-12px_oklch(0.35_0.12_252/0.5)] transition hover:border-[oklch(0.68_0.12_252/0.65)] hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.55_0.12_252/0.45)]",
          )}
        >
          Open chart
          <ExternalLink className="size-4 opacity-90" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function WeekPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[linear-gradient(165deg,oklch(0.092_0.046_262/0.98),oklch(0.046_0.03_268/0.99))] p-3.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08)] sm:p-4">
      <div className="shrink-0 grid grid-cols-1 gap-2 border-b border-white/[0.07] pb-3.5 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.1] bg-[linear-gradient(170deg,oklch(0.1_0.04_264/0.82),oklch(0.06_0.03_270/0.86))] px-3.5 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Week summary</p>
          <p className="mt-1.5 font-display text-[1.75rem] font-semibold tracking-[-0.05em] text-emerald-300 sm:text-[1.95rem]">{formatPnl(1247.63)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.1] bg-[linear-gradient(170deg,oklch(0.1_0.04_264/0.82),oklch(0.06_0.03_270/0.86))] px-3.5 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Discipline score</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <span className="relative inline-flex size-9 items-center justify-center rounded-full border border-emerald-400/55 bg-[radial-gradient(circle_at_45%_30%,oklch(0.3_0.08_160/0.4),transparent_70%)] text-sm font-semibold text-emerald-300">
              87
            </span>
            <div>
              <p className="text-[1rem] font-semibold text-emerald-200">Great week</p>
              <p className="text-xs text-zinc-400">Keep building.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 pt-2.5">
        <div className="overflow-x-auto pb-1">
          <div className="grid h-[10.8rem] min-w-[33.5rem] grid-cols-[5.8rem_repeat(5,minmax(0,1fr))_5.8rem] grid-rows-[auto_repeat(4,minmax(0,1fr))] gap-x-1.5 gap-y-1.5">
            <div className="px-2" />
            {WEEK_DAYS.map((d) => (
              <div
                key={d.day}
                className="pb-0.5 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-500"
              >
                {d.day}
              </div>
            ))}
            <div className="pb-0.5 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-500">Week total</div>
            {[
              { label: "May 5 - 11", values: [186.4, -42.1, 248.75, 123.3, 205.6], total: 721.95 },
              { label: "May 12 - 18", values: [-153.2, 97.6, 310.4, -68.5, 229.1], total: 415.4 },
              { label: "May 19 - 25", values: [267.9, 134.4, -71.3, 142.2, 188.7], total: 661.9 },
              { label: "May 26 - Jun 1", values: [89.3, -33.8, 0, 0, 0], total: 55.5 },
            ].map((row) => (
              <div key={row.label} className="contents">
                <div className="flex items-center pl-2 text-[10px] text-zinc-500">
                  {row.label}
                </div>
                {row.values.map((value, idx) => (
                  <div
                    key={`${row.label}-${idx}`}
                    className={cn(
                      "flex items-center justify-center rounded-lg border px-1 text-[10px] font-medium tabular-nums sm:text-[11px]",
                      weekCellClass(value),
                    )}
                  >
                    {value === 0 ? "—" : formatPnl(value)}
                  </div>
                ))}
                <div className="flex items-center justify-center rounded-lg border border-emerald-400/38 bg-emerald-400/12 px-1 text-[10px] font-semibold tabular-nums text-emerald-200 sm:text-[11px]">
                  {formatPnl(row.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-[1fr_1fr_0.78fr]">
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 sm:p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Behavior today</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Calm", "Focused", "Hesitant", "Tilted"].map((chip) => (
                <span key={chip} className="rounded-full border border-white/[0.12] bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-300">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-2.5 sm:p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Discipline checks</p>
            <div className="mt-2 space-y-1">
              {["Followed plan", "Respected stop", "No revenge trade"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <CheckCircle2 className="size-3.5 text-blue-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative col-span-2 flex min-h-[5.5rem] items-center justify-center overflow-hidden rounded-xl border border-white/[0.09] bg-[linear-gradient(160deg,oklch(0.08_0.04_266/0.8),oklch(0.05_0.03_270/0.9))] p-2 text-center lg:col-span-1">
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_45%,oklch(0.55_0.13_250/0.35),transparent_60%)]" />
            <span className="pointer-events-none absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.58_0.12_250/0.35)]" />
            <span className="pointer-events-none absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.58_0.12_250/0.2)]" />
            <p className="relative text-[11px] leading-tight text-zinc-300">Consistency compounds.</p>
          </div>
        </div>
      </div>

      <div className="mt-2 grid shrink-0 grid-cols-1 items-center gap-2 border-t border-white/[0.06] pt-2.5 sm:grid-cols-[1fr_auto_auto] sm:gap-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="rounded-md border border-white/[0.1] bg-white/[0.03] px-1.5 py-1 text-[10px] text-zinc-300">Linked chart</span>
          <span className="size-1 rounded-full bg-emerald-400" />
          <span>Review ready</span>
        </div>
        <div className="flex items-center gap-2 sm:justify-self-end">
          <span className="rounded-full border border-white/[0.12] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-zinc-300">Week</span>
          <button type="button" className="rounded-lg border border-white/[0.1] px-3 py-1.5 text-[11px] text-zinc-200">
            View notes
          </button>
        </div>
      </div>
    </div>
  );
}

type BottomStripProps = { mode: ViewMode };

function HeroProductBottomStrip({ mode }: BottomStripProps) {
  const copy =
    mode === "day"
      ? { left: "Mood + discipline logged", right: "Calm / Focused / Hesitant / Tilted" }
      : mode === "chart"
        ? { left: "Linked chart review", right: "Saved chart attached" }
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
        className="ml-3 inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[oklch(0.72_0.12_252)] transition hover:text-zinc-200 sm:text-[11px]"
      >
        Sign in
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export function HeroPremium() {
  const [mode, setMode] = useState<ViewMode>("week");
  const [isHovering, setIsHovering] = useState(false);
  const reducedMotion = useReducedMotion();
  const reduced = reducedMotion === true;
  const rotateX = useSpring(0, { stiffness: 220, damping: 24, mass: 0.55 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 24, mass: 0.55 });
  const scale = useSpring(1, { stiffness: 180, damping: 24, mass: 0.65 });
  const tabId = useId();
  const panelId = `${tabId}-panel`;

  const slabStyle = useMemo(
    () =>
      ({
        transformStyle: "preserve-3d",
        "--bv-tilt-strength": isHovering ? "1" : "0",
      }) as CSSProperties,
    [isHovering],
  );

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

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 10);
    rotateX.set((0.5 - py) * 8);
    scale.set(1.012);
  }

  function onPointerEnter(e: PointerEvent<HTMLDivElement>) {
    if (reduced || e.pointerType !== "mouse") return;
    setIsHovering(true);
  }

  function onPointerLeave() {
    setIsHovering(false);
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <section
      id="hero"
      className="relative overflow-x-clip border-b border-white/[0.08] pb-12 pt-[4.5rem] sm:pb-14 sm:pt-[5.25rem] lg:pb-14 lg:pt-24"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(42vh,320px)] bg-[linear-gradient(180deg,oklch(0.1_0.06_262/0.35)_0%,transparent_72%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-7 xl:gap-9">
          <div className="text-left">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[oklch(0.66_0.1_252)]">PREMIUM TRADING JOURNAL</p>
            <h1
              id="hero-heading"
              className="mt-4 [font-family:var(--font-heading),Georgia,serif] text-[clamp(2.2rem,5vw,4.25rem)] font-semibold leading-[0.97] tracking-[-0.056em] text-zinc-50 sm:mt-5"
            >
              Track the result.
              <br />
              <span className="bg-gradient-to-r from-zinc-100 via-[oklch(0.9_0.05_250)] to-[oklch(0.62_0.15_252)] bg-clip-text text-transparent">
                Review the behavior.
              </span>
            </h1>
            <p className="mt-5 max-w-[26rem] text-[16px] leading-[1.52] tracking-[-0.016em] text-zinc-300">
              Log the day. Save the chart.
              <br />
              See the week in one clear place.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3 sm:gap-4">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="/app">Open workspace</PremiumGhostLink>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 lg:mt-9">
              {SUPPORT_CARDS.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="text-left">
                  <div className="mb-2 inline-flex size-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03]">
                    <Icon className="size-4 text-zinc-300" />
                  </div>
                  <p className="text-xs font-medium text-zinc-300">{title}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[860px] [perspective:1800px] lg:mx-0 lg:max-w-none">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-9 -inset-y-7 rounded-[2.35rem] bg-[conic-gradient(from_120deg_at_62%_24%,transparent_0deg,oklch(0.66_0.16_248/0.28)_62deg,transparent_122deg,oklch(0.62_0.14_252/0.22)_210deg,transparent_300deg)] blur-[30px]"
            />
            <motion.div
              className={cn(
                "relative rounded-2xl p-[1px] sm:rounded-[1.85rem]",
                "bg-[linear-gradient(145deg,oklch(0.55_0.14_252/0.65)_0%,oklch(0.2_0.06_268/0.42)_40%,oklch(0.52_0.15_252/0.58)_100%)]",
                "shadow-[0_46px_128px_-52px_rgba(0,0,0,0.92),0_0_0_1px_oklch(0.46_0.11_252/0.24),0_0_90px_-48px_oklch(0.6_0.14_252/0.44),0_0_130px_-44px_oklch(0.66_0.16_252/0.42),inset_0_1px_0_0_oklch(0.7_0.1_252/0.13)]",
              )}
              style={{ ...slabStyle, rotateX, rotateY, scale }}
              onPointerMove={onPointerMove}
              onPointerEnter={onPointerEnter}
              onPointerLeave={onPointerLeave}
            >
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -inset-7 rounded-[2.2rem] bg-[radial-gradient(ellipse_at_70%_20%,oklch(0.58_0.16_252/0.28),transparent_62%)]"
                animate={reduced ? undefined : { opacity: [0.55, 0.92, 0.55] }}
                transition={reduced ? undefined : { duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />
              <div
                className={cn(
                  "relative overflow-hidden rounded-[calc(1rem-1px)] sm:rounded-[calc(1.75rem-1px)]",
                  "bg-[linear-gradient(172deg,oklch(0.092_0.045_262/0.995),oklch(0.042_0.028_272/0.998))]",
                  "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08),inset_0_-36px_72px_-52px_oklch(0_0_0/0.62)]",
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_88%_-12%,oklch(0.44_0.14_252/0.19),transparent_52%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,oklch(0_0_0/0.18)_95%)]" />
                <div className="relative z-[1]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/[0.09] px-4 py-3.5 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex gap-1.5" aria-hidden>
                        <span className="size-2 rounded-full bg-[oklch(0.45_0.14_25)] shadow-[0_0_8px_oklch(0.5_0.14_25/0.4)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.65_0.12_88)] shadow-[0_0_8px_oklch(0.65_0.12_88/0.35)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.5_0.12_152)] shadow-[0_0_8px_oklch(0.5_0.12_152/0.35)]" />
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500 sm:text-[10px]">Blueveno workspace</span>
                    </div>
                    <span className="inline-flex items-center gap-2">
                      <span className="bv-live-dot size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_14px_oklch(0.65_0.14_155/0.55)]" aria-hidden />
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/95 sm:text-[10px]">Live</span>
                    </span>
                  </div>

                  <div className="border-b border-white/[0.06] bg-[linear-gradient(180deg,oklch(0.07_0.04_268/0.55),transparent)] px-3 py-3 sm:px-5 sm:py-3.5">
                    <LayoutGroup id={`${tabId}-hero-tabs`}>
                      <div
                        role="tablist"
                        aria-label="Preview mode"
                        onKeyDown={onTabKeyDown}
                        className="relative grid w-full grid-cols-3 gap-1 rounded-2xl bg-black/65 p-1.5 ring-1 ring-[oklch(0.48_0.1_252/0.3)] sm:gap-1.5 sm:p-2"
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
                                "relative z-[1] flex min-h-[2.55rem] min-w-0 items-center justify-center rounded-xl px-2 py-2 text-center text-[13px] font-semibold leading-none tracking-[-0.02em] transition-colors duration-300 sm:min-h-[2.75rem] sm:text-[14px]",
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

                  <div className="border-b border-white/[0.05] px-4 py-4 sm:px-7 sm:py-5 lg:px-8 lg:py-5">
                    {/* Fixed height so Day / Chart / Week never change the slab size when switching */}
                    <div className="relative h-[25.6rem] sm:h-[27rem] lg:h-[28rem]">
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
