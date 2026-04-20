"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Clock, LineChart, Shield, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";
import { cn } from "@/lib/utils";

type ProfileId = "intraday" | "swing" | "prop" | "desk";

const profiles: {
  id: ProfileId;
  label: string;
  short: string;
  Icon: LucideIcon;
  care: string;
  improves: string;
  removes: string;
  frameTitle: string;
  frameSubtitle: string;
}[] = [
  {
    id: "intraday",
    label: "Intraday",
    short: "Speed & tape fidelity",
    Icon: Clock,
    care: "Same-day fills, fast review, and zero drift between what printed and what you remember.",
    improves: "Automatic journal sync, tagged fills, and a review queue that keeps up with the session.",
    removes: "End-of-day reconstruction, orphaned screenshots, and “I think I followed plan” stories.",
    frameTitle: "workspace · intraday",
    frameSubtitle: "High cadence · NY session",
  },
  {
    id: "swing",
    label: "Swing / position",
    short: "Thesis across the hold",
    Icon: LineChart,
    care: "Continuity from entry thesis through adjustments, exits, and post-hoc review.",
    improves: "One thread per idea—tags, notes, and P&L tied to the same symbol and setup.",
    removes: "Lost context across days, spreadsheet stitching, and vague “the trade” narratives.",
    frameTitle: "workspace · swing",
    frameSubtitle: "Multi-day hold · equity curve",
  },
  {
    id: "prop",
    label: "Prop & funded",
    short: "Rules beside performance",
    Icon: Shield,
    care: "Hard limits, drawdown windows, and compliance that must be visible while you trade.",
    improves: "Rule checks, buffers, and blackout windows next to live P&L—not in a separate portal.",
    removes: "Surprise violations at month-end, rule amnesia mid-session, and manual limit tracking.",
    frameTitle: "workspace · funded",
    frameSubtitle: "Firm rules · live",
  },
  {
    id: "desk",
    label: "Desk & coach",
    short: "Evidence, not vibes",
    Icon: Users,
    care: "Shared vocabulary, fair review, and exports that stand up to risk or compliance.",
    improves: "Shared tags, structured recaps, and fills everyone can point to—same record, same IDs.",
    removes: "Screenshot ping-pong, subjective coaching, and “trust me” performance reviews.",
    frameTitle: "workspace · desk",
    frameSubtitle: "Shared tags · exports",
  },
];

function ProfileMiniMock({ id }: { id: ProfileId }) {
  return (
    <div className="relative border-t border-white/[0.06] bg-black/25 p-4">
      {id === "intraday" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            <span>Session load</span>
            <span className="text-amber-200/90">High · 240+ events</span>
          </div>
          <div className="flex h-14 items-end gap-px rounded-md border border-white/[0.06] bg-bv-void/80 px-2 py-2">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-bv-blue-deep/70 to-primary/55"
                style={{ height: `${22 + ((i * 13) % 78)}%` }}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-2 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">Review queue</p>
              <p className="mt-1 font-display text-lg tabular-nums text-zinc-100">4</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-2 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">Tag depth</p>
              <p className="mt-1 font-display text-lg text-zinc-200">ORB</p>
            </div>
            <div className="hidden rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-2 py-2 text-center sm:block">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">Sync</p>
              <p className="mt-1 font-mono text-sm text-emerald-300/95">Live</p>
            </div>
          </div>
        </div>
      )}

      {id === "swing" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-white/[0.08] bg-bv-surface-inset/60 p-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">Thesis · ESZ5</p>
            <p className="mt-2 text-[12px] leading-snug text-zinc-300">
              Liquidity sweep → failed reclaim → fade toward VWAP. Size scaled on second test.
            </p>
          </div>
          <div className="h-20 rounded-md border border-border/50 bg-black/40 px-2 py-0.5">
            <svg className="h-full w-full" viewBox="0 0 280 64" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="swingEq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.5 0.12 252 / 0.22)" />
                  <stop offset="100%" stopColor="oklch(0.5 0.12 252 / 0)" />
                </linearGradient>
              </defs>
              <path
                d="M0,52 C40,48 48,56 80,44 C112,32 120,40 160,28 C200,16 220,24 280,12 L280,64 L0,64 Z"
                fill="url(#swingEq)"
              />
              <path
                d="M0,52 C40,48 48,56 80,44 C112,32 120,40 160,28 C200,16 220,24 280,12"
                fill="none"
                stroke="oklch(0.58 0.13 252)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-zinc-500">
            <span>Day 1</span>
            <span className="text-zinc-300">Hold · 3d</span>
            <span>Exit</span>
          </div>
        </div>
      )}

      {id === "prop" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-emerald-500/25 bg-emerald-500/[0.07] px-3 py-2">
            <span className="text-[11px] text-zinc-400">Daily loss rule</span>
            <span className="font-mono text-[11px] text-emerald-300/95">Within limit</span>
          </div>
          <div>
            <div className="flex justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">
              <span>Buffer vs. ceiling</span>
              <span className="tabular-nums text-zinc-300">0.62 R</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-bv-blue-deep to-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-black/35 px-2 py-2 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">Blackout</p>
              <p className="mt-1 font-mono text-[11px] text-zinc-200">Respected</p>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-black/35 px-2 py-2 text-center">
              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">Open flags</p>
              <p className="mt-1 font-mono text-[11px] text-primary">0</p>
            </div>
          </div>
        </div>
      )}

      {id === "desk" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {["ORB", "Fade", "risk-on"].map((t) => (
              <span
                key={t}
                className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-bv-ice/90"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">Coach note · 14:02</p>
            <p className="mt-2 text-[12px] leading-snug text-zinc-400">
              Size matched plan on add—compare to prior session where we broke the same rule.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/30 px-3 py-2 font-mono text-[10px]">
            <span className="text-zinc-500">Weekly export</span>
            <span className="text-primary">Desk-ready PDF</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function TraderTypes() {
  const [active, setActive] = useState<ProfileId>("intraday");
  const current = profiles.find((p) => p.id === active)!;

  return (
    <Section id="traders" className="relative bg-marketing-stage py-32 lg:py-44">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Who it&apos;s for</p>
          <h2 className="font-display mt-6 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            Same record. Different operating constraints.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-snug text-zinc-500">
            Choose a profile—the workspace emphasizes what matters for how you trade.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-14 max-w-6xl lg:mt-16">
        <div
          className="flex flex-wrap justify-center gap-2 rounded-2xl border border-white/[0.08] bg-black/40 p-1.5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]"
          role="tablist"
          aria-label="Trader profiles"
        >
          {profiles.map((p) => {
            const activeTab = active === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={activeTab}
                id={`tab-${p.id}`}
                aria-controls={`panel-${p.id}`}
                onClick={() => setActive(p.id)}
                className={cn(
                  "flex min-h-11 min-w-[8.5rem] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-300 sm:min-w-[10rem] sm:px-4",
                  activeTab
                    ? "bg-bv-surface/95 text-zinc-50 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06),0_0_0_1px_oklch(0.52_0.11_252/0.2)]"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
                )}
              >
                <p.Icon className="size-4 shrink-0 text-primary/90" strokeWidth={1.5} aria-hidden />
                <span className="font-display text-[13px] leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 lg:mt-0 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 lg:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              id={`panel-${active}`}
              role="tabpanel"
              aria-labelledby={`tab-${active}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/85">{current.short}</p>
              <h3 className="font-display mt-3 text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">
                {current.label}
              </h3>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <span className="mt-0.5 h-px w-8 shrink-0 bg-gradient-to-r from-primary/50 to-transparent" aria-hidden />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">What they care about</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{current.care}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="mt-0.5 h-px w-8 shrink-0 bg-gradient-to-r from-primary/50 to-transparent" aria-hidden />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">What Blueveno improves</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{current.improves}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="mt-0.5 h-px w-8 shrink-0 bg-gradient-to-r from-primary/50 to-transparent" aria-hidden />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">What it removes</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-zinc-400">{current.removes}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`mock-${active}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 lg:col-span-7 lg:mt-0 lg:pl-4"
            >
              <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-b from-bv-surface-high/90 to-bv-void/95 shadow-bv-float ring-1 ring-primary/[0.1]">
                <div className="relative border-b border-white/[0.08] bg-black/35 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">{current.frameTitle}</p>
                      <p className="mt-0.5 font-mono text-[9px] text-zinc-600">{current.frameSubtitle}</p>
                    </div>
                    <span className="flex gap-1.5" aria-hidden>
                      <span className="size-2 rounded-full bg-[oklch(0.45_0.08_25/0.9)] ring-1 ring-white/[0.08]" />
                      <span className="size-2 rounded-full bg-[oklch(0.65_0.12_85/0.85)] ring-1 ring-white/[0.08]" />
                      <span className="size-2 rounded-full bg-[oklch(0.55_0.12_145/0.55)] ring-1 ring-white/[0.08]" />
                    </span>
                  </div>
                </div>
                <ProfileMiniMock id={active} />
              </div>
              <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600 lg:text-left">
                Mock state · profile-weighted
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Reveal className="mt-16 text-center lg:mt-20">
        <a
          href={marketingCtas.traderTypes.review.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/85 transition hover:text-primary"
        >
          {marketingCtas.traderTypes.review.label} →
        </a>
      </Reveal>
    </Section>
  );
}
