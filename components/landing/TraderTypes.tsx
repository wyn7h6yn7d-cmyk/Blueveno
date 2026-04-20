"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const personas = [
  {
    id: "intraday",
    label: "Intraday operator",
    headline: "When speed wins, your journal can’t lag.",
    copy: "Tag executions in seconds, pair charts to fills, and see behavior drift across sessions—before it shows up in the account.",
  },
  {
    id: "swing",
    label: "Swing & position",
    headline: "Hold times change. Your review cadence shouldn’t sprawl.",
    copy: "Keep multi-day context coherent: thesis, adjustments, and outcome in one thread—analytics that respect longer horizons.",
  },
  {
    id: "prop",
    label: "Prop & funded",
    headline: "Rules aren’t a PDF. They’re a live constraint.",
    copy: "Surface buffers and blackout windows beside performance—so discretion doesn’t collide with compliance.",
  },
  {
    id: "team",
    label: "Desk & coach",
    headline: "Teach with evidence, not anecdotes.",
    copy: "Exportable recaps, shared tags, and consistent structure—so feedback is specific and repeatable across traders.",
  },
];

export function TraderTypes() {
  const [active, setActive] = useState(personas[0].id);
  const current = personas.find((p) => p.id === active) ?? personas[0];

  return (
    <Section id="traders" className="py-24 lg:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.35fr_0.65fr] lg:items-start">
        <div>
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
              Trader-type relevance
            </p>
            <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
              One platform. Four ways serious traders work.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Blueveno adapts to how you operate—not the other way around.
            </p>
          </Reveal>
          <Reveal className="mt-10 space-y-2">
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                aria-pressed={active === p.id}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${
                  active === p.id
                    ? "border-teal-500/25 bg-teal-500/[0.06] text-zinc-100"
                    : "border-white/[0.07] bg-white/[0.02] text-zinc-400 hover:border-white/[0.12]"
                }`}
              >
                <span className="font-display">{p.label}</span>
                <span className="font-mono text-[10px] text-zinc-600" aria-hidden>
                  →
                </span>
              </button>
            ))}
          </Reveal>
        </div>
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#08090e] p-8 lg:p-10">
            <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-teal-400/70">
              {current.label}
            </p>
            <h3 className="font-display mt-6 text-2xl text-zinc-50">{current.headline}</h3>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">{current.copy}</p>
            <div className="mt-10 grid gap-4 border-t border-white/[0.06] pt-8 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  What improves
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Faster review cycles, fewer blind spots, clearer accountability.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  What you avoid
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Vague narratives, missing context, and rule surprises.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
