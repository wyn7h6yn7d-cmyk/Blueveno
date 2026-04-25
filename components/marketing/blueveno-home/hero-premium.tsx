"use client";

import { useId, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, LineChart, Shield, Target } from "lucide-react";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { cn } from "@/lib/utils";

type HeroTab = "day" | "chart" | "week";

const HERO_TABS: { id: HeroTab; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "chart", label: "Chart" },
  { id: "week", label: "Week" },
];

const FEATURE_ITEMS = [
  { icon: LineChart, title: "Trade. Journal. Improve.", subtitle: "All in one calm workspace." },
  { icon: Shield, title: "Private by design.", subtitle: "Your data stays yours." },
  { icon: Target, title: "Built for consistency.", subtitle: "Better habits. Better results." },
] as const;

const WEEK_ROWS = [
  { label: "May 5 - 11", dates: [5, 6, 7, 8, 9], values: [186.4, -42.1, 248.75, 123.3, 205.6], total: 721.95 },
  { label: "May 12 - 18", dates: [12, 13, 14, 15, 16], values: [-153.2, 97.6, 310.4, -68.5, 229.1], total: 415.4 },
  { label: "May 19 - 25", dates: [19, 20, 21, 22, 23], values: [267.9, 134.4, -71.3, 142.2, 188.7], total: 661.9 },
  { label: "May 26 - Jun 1", dates: [26, 27, 28, 29, 30], values: [89.3, -33.8, 0, 0, 0], total: 55.5 },
] as const;

const WEEK_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

function money(v: number) {
  const prefix = v > 0 ? "+" : v < 0 ? "-" : "";
  return `${prefix}$${Math.abs(v).toLocaleString()}`;
}

function weekTone(v: number) {
  if (v > 0) {
    return "border-emerald-400/40 bg-[linear-gradient(165deg,oklch(0.28_0.09_160/0.8),oklch(0.12_0.05_165/0.62))] text-emerald-100";
  }
  if (v < 0) {
    return "border-rose-400/40 bg-[linear-gradient(165deg,oklch(0.28_0.08_24/0.78),oklch(0.12_0.04_24/0.6))] text-rose-100";
  }
  return "border-white/[0.12] bg-white/[0.04] text-zinc-500";
}

function HeroChartBackdrop({ reduced }: { reduced: boolean }) {
  const layers = [
    { stroke: "oklch(0.67 0.15 248 / 0.7)", width: 1.4, dur: 24, y: 0 },
    { stroke: "oklch(0.6 0.12 242 / 0.56)", width: 1.1, dur: 31, y: 28 },
    { stroke: "oklch(0.55 0.1 168 / 0.5)", width: 1, dur: 36, y: 56 },
  ] as const;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.05_0.06_266)_0%,oklch(0.024_0.064_272)_48%,oklch(0.017_0.06_278)_100%)]" />
      <div className="absolute inset-0 bg-grid-fine opacity-[0.32]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.62_0.08_250/0.08)_1px,transparent_1px)] bg-[length:92px_100%] opacity-50" />

      {layers.map((layer, index) => (
        <div key={layer.stroke} className="absolute inset-0 overflow-hidden" style={{ opacity: 0.95 - index * 0.18 }}>
          <motion.div
            className="absolute left-0 top-0 flex h-full w-[200%]"
            animate={reduced ? undefined : { x: ["0%", "-50%"] }}
            transition={reduced ? undefined : { duration: layer.dur, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
          >
            {[0, 1].map((copy) => (
              <svg
                key={copy}
                viewBox="0 0 1600 360"
                preserveAspectRatio="none"
                className="h-full w-1/2"
                style={{ transform: `translateY(${layer.y}px)` }}
              >
                <path
                  d="M0 220 C120 182, 235 246, 372 186 C512 122, 614 268, 754 192 C896 116, 1010 234, 1148 168 C1276 110, 1404 210, 1600 136"
                  fill="none"
                  stroke={layer.stroke}
                  strokeWidth={layer.width}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 8px oklch(0.68 0.16 248 / 0.45))" }}
                />
              </svg>
            ))}
          </motion.div>
        </div>
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_64%_at_28%_32%,oklch(0.46_0.14_248/0.25),transparent_64%),radial-gradient(ellipse_74%_52%_at_82%_18%,oklch(0.4_0.13_254/0.2),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_130%_88%_at_50%_45%,oklch(0.05_0.04_268/0)_0%,oklch(0.018_0.045_276/0.62)_100%)]" />
    </div>
  );
}

function ChartSketch() {
  return (
    <svg viewBox="0 0 460 290" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="460" height="290" fill="oklch(0.05 0.04 270)" />
      {[38, 74, 110, 146, 182, 218, 254].map((y) => (
        <line key={y} x1="20" y1={y} x2="440" y2={y} stroke="oklch(0.7 0.06 248 / 0.16)" strokeWidth="1" />
      ))}
      <path
        d="M 22 208 C 80 188, 110 140, 160 134 C 206 126, 228 164, 274 152 C 318 138, 346 92, 390 86 C 412 83, 426 88, 438 92"
        fill="none"
        stroke="oklch(0.67 0.15 252)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M 22 208 C 80 188, 110 140, 160 134 C 206 126, 228 164, 274 152 C 318 138, 346 92, 390 86 C 412 83, 426 88, 438 92 L 438 290 L 22 290 Z"
        fill="url(#fill-glow)"
      />
      <defs>
        <linearGradient id="fill-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.6 0.15 252 / 0.25)" />
          <stop offset="100%" stopColor="oklch(0.12 0.05 268 / 0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WeekSurface() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[1.15rem] border border-white/[0.11] bg-[linear-gradient(165deg,oklch(0.1_0.05_264/0.92),oklch(0.047_0.03_270/0.98))] p-3.5 sm:p-4">
      <div className="grid shrink-0 gap-2.5 border-b border-white/[0.07] pb-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.11] bg-[linear-gradient(170deg,oklch(0.11_0.045_264/0.84),oklch(0.06_0.03_270/0.92))] px-3.5 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">Week summary</p>
          <p className="mt-1.5 font-display text-[2rem] font-semibold tracking-[-0.05em] text-emerald-300 sm:text-[2.2rem]">{money(1247.63)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.11] bg-[linear-gradient(170deg,oklch(0.11_0.045_264/0.84),oklch(0.06_0.03_270/0.92))] px-3.5 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">Discipline score</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <span className="relative inline-flex size-10 items-center justify-center rounded-full border border-emerald-400/55 bg-[radial-gradient(circle_at_45%_30%,oklch(0.3_0.08_160/0.45),transparent_70%)] text-sm font-semibold text-emerald-200">
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
          <div className="grid min-w-[37rem] grid-cols-[6.2rem_repeat(5,minmax(0,1fr))_6.4rem] gap-1.5">
            <div />
            {WEEK_HEADERS.map((h) => (
              <div key={h} className="pb-0.5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                {h}
              </div>
            ))}
            <div className="pb-0.5 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Week total</div>

            {WEEK_ROWS.map((row) => (
              <div key={row.label} className="contents">
                <div className="flex items-center pl-2 text-[10px] text-zinc-500">{row.label}</div>
                {row.values.map((v, idx) => (
                  <div key={`${row.label}-${idx}`} className={cn("flex h-[2.3rem] flex-col items-center justify-center rounded-lg border px-1", weekTone(v))}>
                    <span className="text-[9px] text-white/75">{row.dates[idx]}</span>
                    <span className="font-medium tabular-nums text-[11px] leading-none">{v === 0 ? "—" : money(v)}</span>
                  </div>
                ))}
                <div className="flex h-[2.3rem] items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-400/14 px-1 font-semibold tabular-nums text-[11px] text-emerald-200">
                  {money(row.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-2.5 grid gap-1.5 md:grid-cols-2 lg:grid-cols-[1fr_1fr_0.72fr]">
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Behavior today</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Calm", "Focused", "Hesitant", "Tilted"].map((chip) => (
                <span key={chip} className="rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-300">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">Discipline checks</p>
            <div className="mt-2 space-y-1">
              {["Followed plan", "Respected stop", "No revenge trade"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <CheckCircle2 className="size-3.5 text-blue-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex min-h-[5.85rem] items-center justify-center overflow-hidden rounded-xl border border-white/[0.09] bg-[linear-gradient(160deg,oklch(0.085_0.045_266/0.84),oklch(0.05_0.03_270/0.92))] p-2 text-center">
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_45%,oklch(0.55_0.13_250/0.4),transparent_60%)]" />
            <span className="pointer-events-none absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.58_0.12_250/0.42)]" />
            <span className="pointer-events-none absolute left-1/2 top-1/2 size-[3.8rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.58_0.12_250/0.24)]" />
            <p className="relative text-[11px] leading-tight text-zinc-300">Consistency compounds.</p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 grid shrink-0 grid-cols-1 items-center gap-2 border-t border-white/[0.07] pt-2.5 sm:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-1.5 py-1 text-[10px] text-zinc-300">Linked chart</span>
          <span className="size-1 rounded-full bg-emerald-400" />
          <span>Review ready</span>
        </div>
        <span className="rounded-full border border-white/[0.12] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-zinc-300">Week</span>
        <button type="button" className="rounded-lg border border-white/[0.12] px-3 py-1.5 text-[11px] text-zinc-200">
          View notes
        </button>
      </div>
    </div>
  );
}

function DaySurface() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[1.15rem] border border-white/[0.1] bg-[linear-gradient(168deg,oklch(0.1_0.045_264/0.95),oklch(0.05_0.03_270/0.99))] p-5">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400">THU · MAY 8</p>
          <p className="mt-2 text-xl font-semibold text-zinc-100">NQ</p>
        </div>
        <p className="font-display text-[2.3rem] font-semibold tracking-[-0.05em] text-emerald-300">+$180</p>
      </div>
      <p className="mt-6 text-[15px] leading-[1.62] text-zinc-300">Opening drive only. Size held. No revenge after the flush.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Calm", "Focused", "Hesitant", "Tilted"].map((mood) => (
          <span key={mood} className="rounded-full border border-white/[0.14] bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-zinc-300">
            {mood}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChartSurface() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[1.15rem] border border-white/[0.1] bg-[linear-gradient(168deg,oklch(0.095_0.045_264/0.95),oklch(0.05_0.03_270/0.99))] p-5">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-300">Linked chart</span>
        <span className="rounded-lg border border-white/[0.1] bg-black/40 px-2.5 py-1 font-mono text-[10px] text-zinc-400">NQ · 08 May</span>
      </div>
      <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-[oklch(0.52_0.13_252/0.45)] bg-[linear-gradient(165deg,oklch(0.07_0.04_268/0.98),oklch(0.04_0.03_272/0.99))]">
        <ChartSketch />
      </div>
      <div className="mt-4 border-t border-white/[0.07] pt-4">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl border border-[oklch(0.55_0.14_252/0.55)] bg-[linear-gradient(180deg,oklch(0.28_0.09_262/0.96),oklch(0.14_0.05_268/0.98))] px-5 py-2.5 text-[13px] font-semibold text-zinc-50"
        >
          Open chart
        </Link>
      </div>
    </div>
  );
}

export function HeroPremium() {
  const [tab, setTab] = useState<HeroTab>("week");
  const reduced = useReducedMotion() === true;
  const tabsId = useId();
  const panelId = `${tabsId}-panel`;

  function onTabsKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const idx = HERO_TABS.findIndex((t) => t.id === tab);
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setTab(HERO_TABS[(idx + 1) % HERO_TABS.length].id);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setTab(HERO_TABS[(idx - 1 + HERO_TABS.length) % HERO_TABS.length].id);
    }
  }

  return (
    <section id="hero" className="relative isolate overflow-x-clip border-b border-white/[0.08] pb-16 pt-[6.1rem] sm:pt-[6.7rem] lg:pb-20 lg:pt-[7.8rem]" aria-labelledby="hero-heading">
      <HeroChartBackdrop reduced={reduced} />

      <div className="relative z-10 mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-9 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-center">
          <div className="max-w-[40rem]">
            <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[oklch(0.67_0.11_252)]">PREMIUM TRADING JOURNAL</p>
            <h1 id="hero-heading" className="mt-5 [font-family:var(--font-heading),Georgia,serif] text-[clamp(2.8rem,5.9vw,5.4rem)] font-semibold leading-[0.93] tracking-[-0.06em] text-zinc-50">
              Track the <span className="text-[oklch(0.69_0.16_252)]">result.</span>
              <br />
              Review the <span className="text-[oklch(0.65_0.15_252)]">behavior.</span>
            </h1>
            <p className="mt-6 max-w-[29rem] text-[17px] leading-[1.5] tracking-[-0.015em] text-zinc-300">
              Log the day. Save the chart.
              <br />
              See the week in one clear place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="/app">Open workspace</PremiumGhostLink>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURE_ITEMS.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="rounded-xl border border-white/[0.09] bg-white/[0.02] p-3">
                  <div className="mb-2 inline-flex size-9 items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03]">
                    <Icon className="size-4 text-zinc-300" />
                  </div>
                  <p className="text-[12px] font-medium text-zinc-300">{title}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[980px] lg:translate-x-8">
            <div className="pointer-events-none absolute -inset-x-10 -inset-y-10 rounded-[2.8rem] bg-[conic-gradient(from_126deg_at_62%_24%,transparent_0deg,oklch(0.66_0.16_248/0.36)_70deg,transparent_130deg,oklch(0.6_0.14_252/0.28)_220deg,transparent_320deg)] blur-[34px]" aria-hidden />

            <div className="relative rounded-[2rem] p-[1px] bg-[linear-gradient(145deg,oklch(0.58_0.15_252/0.75)_0%,oklch(0.19_0.06_268/0.45)_42%,oklch(0.54_0.15_252/0.68)_100%)] shadow-[0_64px_150px_-56px_rgba(0,0,0,0.96),0_0_0_1px_oklch(0.5_0.12_252/0.3),0_0_130px_-40px_oklch(0.66_0.16_252/0.56),inset_0_1px_0_0_oklch(0.76_0.1_252/0.18)]">
              <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[linear-gradient(170deg,oklch(0.09_0.05_264/0.995),oklch(0.04_0.028_272/1))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.1),inset_0_-44px_84px_-56px_oklch(0_0_0/0.62)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(112%_86%_at_90%_-8%,oklch(0.46_0.14_252/0.22),transparent_54%)]" />

                <div className="relative z-10 border-b border-white/[0.1] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex gap-1.5" aria-hidden>
                        <span className="size-2 rounded-full bg-[oklch(0.45_0.14_25)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.65_0.12_88)]" />
                        <span className="size-2 rounded-full bg-[oklch(0.5_0.12_152)]" />
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Blueveno workspace</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">Live</span>
                  </div>
                </div>

                <div className="relative z-10 border-b border-white/[0.08] px-4 py-3.5 sm:px-6">
                  <LayoutGroup id={`${tabsId}-tabs`}>
                    <div role="tablist" aria-label="Preview mode" onKeyDown={onTabsKeyDown} className="grid w-full grid-cols-3 gap-1.5 rounded-2xl border border-white/[0.08] bg-black/65 p-1.5">
                      {HERO_TABS.map((t) => {
                        const selected = tab === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            role="tab"
                            id={`${tabsId}-${t.id}`}
                            aria-selected={selected}
                            aria-controls={panelId}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setTab(t.id)}
                            className={cn("relative flex min-h-[2.65rem] items-center justify-center rounded-xl text-[14px] font-semibold tracking-[-0.02em] transition-colors", selected ? "text-zinc-50" : "text-zinc-500 hover:text-zinc-300")}
                          >
                            {selected ? (
                              <motion.span
                                layoutId={`${tabsId}-active`}
                                className="absolute inset-0 rounded-xl border border-white/[0.14] bg-[linear-gradient(180deg,oklch(0.34_0.1_262/0.95),oklch(0.16_0.06_268/0.98))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.14),0_14px_36px_-20px_oklch(0.4_0.14_252/0.55)]"
                                transition={{ type: "spring", stiffness: 410, damping: 34 }}
                              />
                            ) : null}
                            <span className="relative z-10">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </LayoutGroup>
                </div>

                <div className="relative z-10 border-b border-white/[0.08] px-4 py-4 sm:px-6 lg:px-7">
                  <div className="relative h-[30.25rem] sm:h-[31rem] lg:h-[32.2rem]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        id={panelId}
                        key={tab}
                        role="tabpanel"
                        aria-labelledby={`${tabsId}-${tab}`}
                        className="absolute inset-0"
                        initial={reduced ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? undefined : { opacity: 0, y: -6 }}
                        transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {tab === "week" ? <WeekSurface /> : null}
                        {tab === "day" ? <DaySurface /> : null}
                        {tab === "chart" ? <ChartSurface /> : null}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="border-t border-white/[0.08] bg-[linear-gradient(0deg,oklch(0.055_0.03_268/0.9),transparent)] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Weekly quality</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Score + reflection ready</p>
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
