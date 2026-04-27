"use client";

import Link from "next/link";
import { useMemo, useRef, type PointerEvent } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { CheckCircle2, LineChart, Shield, Target } from "lucide-react";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";
import { cn } from "@/lib/utils";

const FEATURE_ITEMS = [
  { icon: LineChart, title: "Log the trading day.", subtitle: "P&L, symbol, notes, and linked chart." },
  { icon: Shield, title: "Behavior review.", subtitle: "Mood and discipline checks in one flow." },
  { icon: Target, title: "Weekly reflections.", subtitle: "Review week quality with clear context." },
] as const;

const WEEK_ROWS = [
  { label: "May 5 - 9", values: [160, -42, 210, 98, 74], total: 500 },
  { label: "May 12 - 16", values: [86, 132, -55, 122, 66], total: 351 },
  { label: "May 19 - 23", values: [-18, 88, 176, -34, 120], total: 332 },
  { label: "May 26 - 30", values: [102, 64, 0, 78, -16], total: 228 },
] as const;

function formatPnl(value: number) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(value)}`;
}

function weekCellTone(value: number) {
  if (value > 0) {
    return "border-emerald-400/40 bg-[linear-gradient(165deg,oklch(0.24_0.09_156/0.75),oklch(0.11_0.05_165/0.52))] text-emerald-50";
  }
  if (value < 0) {
    return "border-rose-400/35 bg-[linear-gradient(165deg,oklch(0.24_0.08_26/0.7),oklch(0.11_0.05_24/0.5))] text-rose-50";
  }
  return "border-white/[0.1] bg-white/[0.04] text-zinc-500";
}

function HeroChartLayer({
  className,
  duration,
  reverse,
  pathA,
  pathB,
  glow,
  nodeColor,
  nodeOpacity = 0.72,
  enabled = true,
}: {
  className?: string;
  duration: number;
  reverse?: boolean;
  pathA: string;
  pathB: string;
  glow: string;
  nodeColor: string;
  nodeOpacity?: number;
  enabled?: boolean;
}) {
  const body = (
    <svg viewBox="0 0 1600 300" preserveAspectRatio="none" className="h-full w-[50%] shrink-0">
      <defs>
        <linearGradient id={`line-grad-${duration}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={glow} stopOpacity="0.58" />
          <stop offset="100%" stopColor={glow} stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id={`node-grad-${duration}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={nodeColor} stopOpacity={nodeOpacity} />
          <stop offset="100%" stopColor={nodeColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {[24, 56, 88, 120, 152, 184, 216, 248].map((y) => (
        <line key={y} x1="0" x2="1600" y1={y} y2={y} stroke="oklch(0.62 0.04 248)" strokeOpacity="0.09" strokeWidth="1" />
      ))}
      <path
        d={pathA}
        fill="none"
        stroke={`url(#line-grad-${duration})`}
        strokeWidth="2"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 7px ${glow})` }}
      />
      <path
        d={pathB}
        fill="none"
        stroke={`url(#line-grad-${duration})`}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      {[
        [180, 170],
        [348, 136],
        [522, 178],
        [734, 102],
        [980, 148],
        [1240, 94],
        [1450, 164],
      ].map(([x, y], i) => (
        <g key={`${duration}-${i}`}>
          <circle cx={x} cy={y} r="10" fill={`url(#node-grad-${duration})`} />
          <circle cx={x} cy={y} r="2.1" fill={nodeColor} fillOpacity={nodeOpacity} />
        </g>
      ))}
      {[
        [94, 112],
        [270, 166],
        [610, 126],
        [838, 166],
        [1160, 122],
        [1370, 96],
      ].map(([x, y], i) => (
        <circle key={`minor-${duration}-${i}`} cx={x} cy={y} r="1.35" fill={nodeColor} fillOpacity="0.4" />
      ))}
      <line x1="0" y1="150" x2="1600" y2="150" stroke={glow} strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 6" />
      {[160, 320, 480, 640, 800, 960, 1120, 1280, 1440].map((x) => (
        <line key={`v-${duration}-${x}`} x1={x} y1="0" x2={x} y2="300" stroke={glow} strokeOpacity="0.08" strokeWidth="0.9" />
      ))}
    </svg>
  );

  if (!enabled) {
    return <div className={cn("absolute inset-0 flex w-full", className)}>{body}</div>;
  }

  return (
    <motion.div
      className={cn("absolute inset-0 flex w-[200%]", className)}
      animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
      transition={{ duration, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      aria-hidden
    >
      {body}
      {body}
    </motion.div>
  );
}

function WeekPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-[1.35rem] border border-white/[0.1] bg-[linear-gradient(165deg,oklch(0.1_0.045_262/0.98),oklch(0.05_0.03_270/0.99))] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.08)] sm:p-5">
      <div className="grid grid-cols-1 gap-2.5 border-b border-white/[0.07] pb-3.5 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-white/[0.11] bg-white/[0.03] px-3.5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Week summary</p>
          <p className="mt-1.5 font-display text-[2.1rem] font-semibold tracking-[-0.055em] text-emerald-300">+$1,348</p>
        </div>
        <div className="rounded-xl border border-white/[0.11] bg-white/[0.03] px-3.5 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Discipline score</p>
          <div className="mt-1.5 flex items-center gap-2.5">
            <span className="inline-flex size-11 items-center justify-center rounded-full border border-emerald-400/45 bg-emerald-400/10 text-sm font-semibold text-emerald-300">
              86
            </span>
            <div>
              <p className="text-[13px] font-medium text-zinc-200">High quality week</p>
              <p className="text-[11px] text-zinc-500">Stable and controlled</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <div className="overflow-x-auto pb-1">
          <div className="grid min-w-[30rem] grid-cols-[5.3rem_repeat(5,minmax(0,1fr))_5rem] gap-1.5 sm:min-w-[34rem] sm:grid-cols-[5.6rem_repeat(5,minmax(0,1fr))_5.4rem] lg:min-w-[37rem] lg:grid-cols-[5.7rem_repeat(5,minmax(0,1fr))_5.6rem]">
            <div />
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
              <div key={day} className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">
                {day}
              </div>
            ))}
            <div className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Total</div>
            {WEEK_ROWS.map((row) => (
              <div key={row.label} className="contents">
                <div className="flex items-center text-[10px] text-zinc-500">{row.label}</div>
                {row.values.map((v, idx) => (
                  <div
                    key={`${row.label}-${idx}`}
                    className={cn(
                      "flex min-h-9 items-center justify-center rounded-lg border px-1.5 text-[10px] font-medium tabular-nums",
                      weekCellTone(v),
                    )}
                  >
                    {v === 0 ? "—" : formatPnl(v)}
                  </div>
                ))}
                <div className="flex min-h-9 items-center justify-center rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-1.5 text-[10px] font-semibold text-emerald-200">
                  {formatPnl(row.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-[1fr_1fr_0.8fr]">
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Behavior today</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Calm", "Focused", "Hesitant", "Tilted"].map((chip) => (
                <span key={chip} className="rounded-full border border-white/[0.12] bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-300">
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">Discipline checks</p>
            <div className="mt-2 space-y-1">
              {["Followed plan", "Respected stop", "No revenge trade"].map((item) => (
                <p key={item} className="flex items-center gap-1.5 text-[11px] text-zinc-300">
                  <CheckCircle2 className="size-3.5 text-blue-300" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="relative col-span-2 flex min-h-[5.8rem] items-center justify-center overflow-hidden rounded-xl border border-white/[0.09] bg-[linear-gradient(160deg,oklch(0.08_0.04_266/0.85),oklch(0.05_0.03_270/0.94))] text-center lg:col-span-1">
            <span className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.58_0.12_250/0.38)]" />
            <span className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[oklch(0.58_0.12_250/0.22)]" />
            <p className="relative text-[11px] text-zinc-300">Consistency target</p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 items-center gap-2 border-t border-white/[0.06] pt-3 sm:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span className="rounded-md border border-white/[0.1] bg-white/[0.04] px-1.5 py-1 text-[10px] text-zinc-300">
            Linked chart
          </span>
          <span className="size-1 rounded-full bg-emerald-400" />
          <span>Review ready</span>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center rounded-lg border border-white/[0.1] px-3 py-1.5 text-[11px] text-zinc-200 transition hover:bg-white/[0.06]"
        >
          View notes
        </Link>
      </div>
    </div>
  );
}

export function HeroPremium() {
  const reducedMotion = useReducedMotion();
  const heroMotionEnabled = !reducedMotion;
  const frameRef = useRef<number | null>(null);
  const rotateX = useSpring(0, { stiffness: 260, damping: 25, mass: 0.6 });
  const rotateY = useSpring(0, { stiffness: 260, damping: 25, mass: 0.6 });
  const scale = useSpring(1, { stiffness: 190, damping: 28, mass: 0.65 });

  const slabStyle = useMemo(() => ({ rotateX, rotateY, scale }), [rotateX, rotateY, scale]);

  function onPanelPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reducedMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      rotateY.set((px - 0.5) * 8);
      rotateX.set((0.5 - py) * 7);
      scale.set(1.01);
      frameRef.current = null;
    });
  }

  function onPanelPointerLeave() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <section id="hero" className="relative overflow-hidden border-b border-white/[0.08] pb-16 pt-[6.4rem] lg:pb-20 lg:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.055_0.07_270),oklch(0.028_0.07_276)_58%,oklch(0.02_0.065_280)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,oklch(0.62_0.09_250/0.12)_1px,transparent_1px)] bg-[length:78px_100%] opacity-55" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.62_0.08_250/0.12)_1px,transparent_1px)] bg-[length:100%_54px] opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,oklch(0.64_0.08_248/0.08)_45%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.9]">
        <HeroChartLayer
          duration={198}
          enabled={heroMotionEnabled}
          className="opacity-52"
          pathA="M0 194 C 120 188, 200 160, 286 166 C 390 174, 470 206, 560 198 C 675 186, 725 132, 826 138 C 932 144, 1012 188, 1116 182 C 1220 176, 1312 140, 1422 146 C 1516 152, 1570 184, 1600 194"
          pathB="M0 206 C 96 202, 180 186, 290 190 C 392 194, 468 214, 572 210 C 650 206, 730 184, 824 186 C 922 190, 1014 212, 1126 208 C 1248 200, 1380 174, 1600 206"
          glow="oklch(0.58 0.1 236)"
          nodeColor="oklch(0.7 0.13 238)"
        />
        <HeroChartLayer
          duration={152}
          enabled={heroMotionEnabled}
          className="hidden opacity-[0.78] sm:block"
          pathA="M0 178 C 110 168, 192 132, 280 138 C 376 146, 438 190, 526 180 C 630 166, 696 116, 786 122 C 884 130, 950 176, 1048 166 C 1150 154, 1246 108, 1360 114 C 1478 122, 1546 170, 1600 178"
          pathB="M0 170 C 102 158, 176 126, 254 132 C 360 140, 442 174, 536 164 C 632 152, 704 112, 792 118 C 896 126, 972 160, 1068 150 C 1186 136, 1280 100, 1408 106 C 1516 114, 1580 144, 1600 170"
          glow="oklch(0.64 0.13 248)"
          nodeColor="oklch(0.78 0.12 250)"
        />
        <HeroChartLayer
          duration={124}
          enabled={heroMotionEnabled}
          className="hidden opacity-[0.66] lg:block"
          pathA="M0 210 C 90 204, 170 176, 258 182 C 362 188, 438 214, 544 206 C 636 198, 712 164, 812 170 C 910 176, 1002 212, 1102 204 C 1206 194, 1298 146, 1410 154 C 1512 162, 1582 202, 1600 210"
          pathB="M0 220 C 98 214, 184 198, 286 202 C 376 206, 474 222, 566 218 C 658 212, 760 188, 848 190 C 946 194, 1042 218, 1132 214 C 1248 206, 1346 178, 1600 220"
          glow="oklch(0.58 0.1 168)"
          nodeColor="oklch(0.72 0.11 168)"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_25%_22%,oklch(0.48_0.14_248/0.32),transparent_62%),radial-gradient(ellipse_60%_40%_at_82%_20%,oklch(0.44_0.13_252/0.26),transparent_58%)]" />

      <div className="relative z-10 mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:items-center lg:gap-8">
          <div className="min-w-0">
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.26em] text-[oklch(0.68_0.11_252)]">PREMIUM TRADING JOURNAL</p>
            <h1 className="mt-4 [font-family:var(--font-heading),Georgia,serif] text-[clamp(2.45rem,5.7vw,5.25rem)] font-semibold leading-[0.92] tracking-[-0.062em] text-zinc-50">
              Track the result.
              <br />
              <span className="bg-gradient-to-r from-zinc-100 via-[oklch(0.92_0.04_252)] to-[oklch(0.66_0.15_252)] bg-clip-text text-transparent">
                Review the behavior.
              </span>
            </h1>
            <p className="mt-5 max-w-[31rem] text-[16px] leading-[1.56] text-zinc-300">
              Log your trading day with P&amp;L, symbol, notes, mood, discipline checks, and a linked chart.
              <br />
              Review week quality, weekly reflections, and performance by trading account.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="/login">Open workspace</PremiumGhostLink>
            </div>

            <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURE_ITEMS.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                  <div className="mb-2 inline-flex size-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03]">
                    <Icon className="size-4 text-zinc-300" />
                  </div>
                  <p className="text-[13px] font-medium text-zinc-200">{title}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{subtitle}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-[1060px] [perspective:1700px] lg:mx-0">
            <div className="pointer-events-none absolute -inset-11 rounded-[2.65rem] bg-[conic-gradient(from_120deg_at_58%_24%,transparent_0deg,oklch(0.66_0.16_248/0.4)_65deg,transparent_120deg,oklch(0.62_0.14_252/0.31)_210deg,transparent_300deg)] blur-[40px]" />
            <motion.div
              onPointerMove={onPanelPointerMove}
              onPointerLeave={onPanelPointerLeave}
              style={slabStyle}
              className="relative rounded-[2.2rem] p-[1px] bg-[linear-gradient(150deg,oklch(0.56_0.15_252/0.78),oklch(0.2_0.06_268/0.48)_42%,oklch(0.58_0.16_252/0.71))] shadow-[0_72px_190px_-72px_rgba(0,0,0,0.97),0_0_0_1px_oklch(0.46_0.12_252/0.28),0_0_120px_-35px_oklch(0.68_0.17_252/0.52)]"
            >
              <div className="overflow-hidden rounded-[calc(2.2rem-1px)] bg-[linear-gradient(174deg,oklch(0.094_0.046_262/0.995),oklch(0.042_0.028_272/0.998))] shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.09),inset_0_-40px_78px_-58px_oklch(0_0_0/0.74)]">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex gap-1.5" aria-hidden>
                      <span className="size-2 rounded-full bg-[oklch(0.45_0.14_25)] shadow-[0_0_8px_oklch(0.5_0.14_25/0.4)]" />
                      <span className="size-2 rounded-full bg-[oklch(0.65_0.12_88)] shadow-[0_0_8px_oklch(0.65_0.12_88/0.35)]" />
                      <span className="size-2 rounded-full bg-[oklch(0.5_0.12_152)] shadow-[0_0_8px_oklch(0.5_0.12_152/0.35)]" />
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500 sm:text-[10px]">Blueveno workspace</span>
                  </div>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_14px_oklch(0.65_0.14_155/0.55)]" aria-hidden />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-400/95 sm:text-[10px]">Live</span>
                  </span>
                </div>
                <div className="px-5 pb-5 pt-4 sm:pt-5">
                  <div className="h-[28rem] sm:h-[32rem] lg:h-[35.6rem]">
                    <WeekPanel />
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
