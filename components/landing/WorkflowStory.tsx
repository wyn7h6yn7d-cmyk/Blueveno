"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LineChart, PenLine, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const TRADE = {
  time: "09:44",
  sym: "ES",
  side: "L",
  qty: "2",
  setup: "ORB",
  tag: "drive",
  r: "+0.5",
  session: "Mon · NY",
};

const STEPS = [
  {
    id: 0,
    title: "Capture",
    line: "Execution lands on the tape—instantly.",
    Icon: Sparkles,
  },
  {
    id: 1,
    title: "Annotate",
    line: "Shot, tag, note—bound to the print.",
    Icon: PenLine,
  },
  {
    id: 2,
    title: "Measure",
    line: "Expectancy and slices on that same fill.",
    Icon: LineChart,
  },
  {
    id: 3,
    title: "Enforce",
    line: "Rules, recap, next session—closed loop.",
    Icon: ShieldCheck,
  },
] as const;

function StepRail({ active }: { active: number }) {
  return (
    <div className="flex w-full flex-row items-center justify-center gap-0 lg:w-12 lg:flex-col lg:items-center lg:justify-start lg:gap-0 lg:pt-2">
      {STEPS.map((_, i) => (
        <div key={i} className="flex items-center lg:flex-col">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] tabular-nums transition-colors duration-500 lg:size-10",
              active === i
                ? "border-primary/55 bg-primary/15 text-bv-ice shadow-[0_0_24px_-4px_oklch(0.52_0.14_252/0.35)]"
                : i < active
                  ? "border-primary/25 bg-white/[0.04] text-zinc-400"
                  : "border-white/[0.06] bg-bv-void/80 text-zinc-600",
            )}
          >
            {String(i + 1).padStart(2, "0")}
          </div>
          {i < STEPS.length - 1 ? (
            <div
              className={cn(
                "h-0.5 w-4 rounded-full sm:w-6 lg:h-10 lg:w-0.5",
                i < active ? "bg-primary/35" : "bg-white/[0.08]",
              )}
              aria-hidden
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function EvolvingTradeCard({ step }: { step: number }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");

  return (
    <div className="relative overflow-hidden rounded-[1.15rem] border border-white/[0.1] bg-gradient-to-b from-bv-surface-high/90 to-bv-void/95 shadow-bv-float ring-1 ring-primary/[0.08]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-20%,oklch(0.42_0.11_252/0.12),transparent_55%)]" />
      <div className="relative border-b border-white/[0.07] bg-black/35 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
            One session · one record
          </p>
          <span className="rounded border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-300/95">
            Linked
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-zinc-400">{TRADE.session} · desk primary</p>
      </div>

      <div className="relative space-y-0 p-4">
        <div className="rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-zinc-500">{TRADE.time}</span>
            <span className="text-zinc-100">{TRADE.sym}</span>
            <span className="text-emerald-400/90">{TRADE.side}</span>
            <span className="text-zinc-400">{TRADE.qty}</span>
            <span className="text-zinc-300">{TRADE.setup}</span>
            <span className="tabular-nums text-zinc-100">{TRADE.r} R</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step >= 1 ? (
            <motion.div
              key="annotate"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,7rem)_1fr]"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-white/[0.12] bg-gradient-to-br from-zinc-800/95 to-bv-void shadow-inner">
                <div className="absolute inset-0 bg-grid-fine opacity-50" />
                <svg className="absolute inset-1.5 h-[calc(100%-12px)] w-[calc(100%-12px)]" viewBox="0 0 120 80" aria-hidden>
                  <defs>
                    <linearGradient id={`${uid}-ch`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.14 250)" />
                      <stop offset="100%" stopColor="oklch(0.42 0.12 252 / 0.4)" />
                    </linearGradient>
                  </defs>
                  <line x1="8" y1="12" x2="112" y2="12" stroke="oklch(0.35 0.04 260 / 0.6)" strokeWidth="0.5" />
                  <line x1="8" y1="40" x2="112" y2="40" stroke="oklch(0.35 0.04 260 / 0.35)" strokeWidth="0.5" />
                  <line x1="8" y1="68" x2="112" y2="68" stroke="oklch(0.35 0.04 260 / 0.6)" strokeWidth="0.5" />
                  {[18, 32, 46, 60, 74, 88].map((x, i) => {
                    const h = [28, 22, 35, 18, 30, 24][i];
                    const up = i % 2 === 0;
                    return (
                      <rect
                        key={x}
                        x={x - 4}
                        y={up ? 40 - h : 40}
                        width="8"
                        height={h}
                        rx="1"
                        fill={`url(#${uid}-ch)`}
                        opacity={0.85}
                      />
                    );
                  })}
                </svg>
                <p className="absolute left-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 font-mono text-[8px] text-zinc-300 ring-1 ring-white/10">
                  Chart snapshot
                </p>
              </div>
              <div className="flex flex-col justify-center space-y-1.5 text-[11px]">
                <p>
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">Tag</span>{" "}
                  <span className="text-primary">{TRADE.tag}</span>
                </p>
                <p className="leading-snug text-zinc-500">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">Note · </span>
                  Size per plan; no adds after halt.
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step >= 2 ? (
            <motion.div
              key="measure"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : 0.05 }}
              className="mt-3 grid grid-cols-3 gap-2 rounded-lg border border-white/[0.06] bg-black/30 p-3"
            >
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">Expect.</p>
                <p className="font-display text-lg tabular-nums text-zinc-100">+0.21</p>
                <p className="font-mono text-[8px] text-zinc-600">R / trade</p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">ORB slice</p>
                <p className="font-display text-lg tabular-nums text-zinc-100">+0.38</p>
                <p className="font-mono text-[8px] text-zinc-600">avg R</p>
              </div>
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-600">Win %</p>
                <p className="font-display text-lg tabular-nums text-zinc-100">56%</p>
                <p className="font-mono text-[8px] text-zinc-600">n = 64</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step >= 3 ? (
            <motion.div
              key="enforce"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.35 }}
              className="mt-3 space-y-2"
            >
              <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2">
                <span className="text-[11px] text-zinc-400">Daily loss rule</span>
                <span className="font-mono text-[11px] text-emerald-300/95">Within limit</span>
              </div>
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] leading-snug text-zinc-500">
                Recap: ORB held; fade deferred. Next: tighten fade filter after 10:30.
              </div>
              <div className="flex items-center justify-center gap-2 pt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/85">
                <RefreshCw className="size-3.5" aria-hidden />
                Loop · next session
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function WorkflowStory() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const nodes = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { idx: number; ratio: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number((e.target as HTMLElement).dataset.step);
          if (Number.isNaN(idx)) continue;
          const r = e.intersectionRatio;
          if (!best || r > best.ratio) best = { idx, ratio: r };
        }
        if (best && best.ratio > 0.18) setActive(best.idx);
      },
      { threshold: [0.12, 0.22, 0.32, 0.42, 0.52], rootMargin: "-14% 0px -20% 0px" },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const scrollBlocks = (
    <div className="space-y-0">
      {STEPS.map((s, i) => (
        <div
          key={s.id}
          ref={(el) => {
            sectionRefs.current[i] = el;
          }}
          data-step={i}
          className="flex min-h-[min(68vh,600px)] flex-col justify-center border-b border-white/[0.05] py-12 last:border-b-0 lg:min-h-[min(82vh,700px)] lg:py-16"
        >
          <div className="flex items-start gap-4">
            <s.Icon
              className={cn(
                "mt-0.5 size-5 shrink-0 transition-colors duration-500",
                active === i ? "text-primary" : "text-zinc-600",
              )}
              strokeWidth={1.5}
              aria-hidden
            />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bv-eyebrow/90">
                {String(i + 1).padStart(2, "0")} · {s.title}
              </p>
              <p className="font-display mt-3 text-xl font-medium tracking-tight text-zinc-50 sm:text-2xl">{s.title}</p>
              <p className="mt-2 max-w-sm text-[14px] leading-snug text-zinc-500">{s.line}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const recordCard = (
    <div>
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600 lg:mb-4">
        Live record · step {String(active + 1).padStart(2, "0")}
      </p>
      <motion.div layout transition={{ duration: reduce ? 0 : 0.25 }}>
        <EvolvingTradeCard step={active} />
      </motion.div>
      <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600 lg:mt-6">
        Same print · deeper context at each step
      </p>
    </div>
  );

  return (
    <div className="relative mx-auto mt-14 max-w-6xl lg:mt-20">
      {/* Mobile: rail + record preview, then scroll story (same observer as desktop) */}
      <div className="mb-10 lg:hidden">
        <StepRail active={active} />
        <div className="mt-5">{recordCard}</div>
      </div>

      {/* Desktop: sticky scrollytelling — left narrative, right evolving record */}
      <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-10 xl:gap-14">
        <div className="min-w-0 lg:col-span-5">{scrollBlocks}</div>
        <div className="hidden lg:sticky lg:top-28 lg:col-span-7 lg:block lg:self-start xl:top-32">
          <div className="flex gap-6 xl:gap-8">
            <StepRail active={active} />
            <div className="min-w-0 flex-1">{recordCard}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
