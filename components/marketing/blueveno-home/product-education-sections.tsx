"use client";

import {
  BarChart3,
  BookOpenText,
  CalendarDays,
  ClipboardCheck,
  Layers3,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const HOW_IT_WORKS_STEPS = [
  {
    title: "Add your account",
    description: "Trial includes 1 trading account. Premium supports up to 5.",
    icon: Wallet,
  },
  {
    title: "Log the day",
    description: "Add symbol, P&L, notes, mood, discipline checks, and a chart link.",
    icon: BookOpenText,
  },
  {
    title: "See the week",
    description: "Calendar shows green/red days, weekly totals, and weekly reflections.",
    icon: CalendarDays,
  },
  {
    title: "Review the pattern",
    description: "Stats reveal P&L, streaks, discipline, mood, and behavior trends.",
    icon: BarChart3,
  },
] as const;

const PRODUCT_CARDS = [
  {
    title: "Journal",
    description: "Log date, symbol, P&L, notes, mood, discipline checks, and a linked chart.",
    icon: BookOpenText,
  },
  {
    title: "Calendar",
    description: "See monthly P&L, green/red days, week totals, and weekly context.",
    icon: CalendarDays,
  },
  {
    title: "Stats",
    description: "Track net P&L, win/loss days, streaks, cumulative performance, mood, and discipline.",
    icon: BarChart3,
  },
  {
    title: "Weekly reflections",
    description: "Capture what worked, what slipped, and next week’s focus.",
    icon: ClipboardCheck,
  },
  {
    title: "Trading accounts",
    description: "Trial includes 1 account. Premium supports up to 5 separate accounts.",
    icon: Layers3,
  },
  {
    title: "Read-only safety",
    description: "After trial, your data stays visible. Upgrade to keep journaling.",
    icon: ShieldCheck,
  },
] as const;

export function ProductEducationSections() {
  return (
    <>
      <section
        id="how-it-works"
        className="scroll-mt-28 relative border-t border-white/[0.07] py-14 sm:scroll-mt-32 sm:py-18 lg:py-24"
        aria-labelledby="how-it-works-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,oklch(0.12_0.06_262/0.22)_0%,transparent_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[oklch(0.62_0.12_252)]">How it works</p>
          <h2
            id="how-it-works-heading"
            className="font-display mt-4 text-[clamp(1.5rem,3.6vw,2.5rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-50"
          >
            Start simple. Review better.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(168deg,oklch(0.11_0.045_262/0.95)_0%,oklch(0.055_0.038_272/0.98)_100%)] p-4 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">Step {index + 1}</span>
                  <span className="inline-flex size-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03]">
                    <step.icon className="size-4 text-zinc-300" />
                  </span>
                </div>
                <p className="mt-3 text-[14px] font-medium leading-snug text-zinc-100">{step.title}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="what-you-can-do"
        className="scroll-mt-28 relative border-t border-white/[0.07] py-14 sm:scroll-mt-32 sm:py-18 lg:py-24"
        aria-labelledby="what-you-can-do-heading"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,oklch(0.1_0.06_262/0.2)_0%,transparent_100%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-[oklch(0.62_0.12_252)]">What you can do</p>
          <h2
            id="what-you-can-do-heading"
            className="font-display mt-4 text-[clamp(1.45rem,3.4vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-zinc-50"
          >
            Core workflow at a glance.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_CARDS.map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-[oklch(0.5_0.12_252/0.26)] bg-[linear-gradient(170deg,oklch(0.105_0.045_262/0.96)_0%,oklch(0.05_0.036_272/0.99)_100%)] p-4 shadow-[0_16px_44px_-28px_rgba(0,0,0,0.82),inset_0_1px_0_0_oklch(1_0_0/0.06)]"
              >
                <div className="inline-flex size-8 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.03]">
                  <card.icon className="size-4 text-[oklch(0.73_0.1_252)]" />
                </div>
                <p className="mt-3 text-[14px] font-medium text-zinc-100">{card.title}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
