"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const personas = [
  {
    id: "intraday",
    label: "Intraday",
    headline: "Speed demands a journal that keeps pace",
    copy: "Tag fast, review faster: execution quality, impulse signals, and session integrity in one place.",
  },
  {
    id: "swing",
    label: "Swing & position",
    headline: "Longer holds need longer memory",
    copy: "Keep thesis, adjustments, and outcome in one thread—analytics that respect the horizon.",
  },
  {
    id: "prop",
    label: "Prop & funded",
    headline: "Rules belong beside the button",
    copy: "Buffers and blackout windows visible while you trade—so discretion does not fight the firm.",
  },
  {
    id: "desk",
    label: "Desk & coach",
    headline: "Feedback travels on evidence",
    copy: "Shared tags and exportable recaps—so coaching is specific, repeatable, and fair.",
  },
];

export function TraderTypes() {
  const [active, setActive] = useState(personas[0].id);
  const current = personas.find((p) => p.id === active) ?? personas[0];

  return (
    <Section id="traders" className="py-28 lg:py-36">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:items-start lg:gap-20">
        <div>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
              Who it is for
            </p>
            <h2 className="font-display mt-5 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
              One platform. Different constraints. Same standard of review.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-zinc-400">
              Blueveno adapts to how you operate—without diluting the rigor.
            </p>
          </Reveal>

          <Reveal className="mt-12 space-y-2">
            {personas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActive(p.id)}
                aria-pressed={active === p.id}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition ${
                  active === p.id
                    ? "border-[oklch(0.55_0.14_250/0.35)] bg-[oklch(0.45_0.1_250/0.08)] text-zinc-100"
                    : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/[0.1]"
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
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[oklch(0.1_0.025_265)] p-8 md:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-[oklch(0.4_0.12_270/0.12)] blur-3xl" />
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[oklch(0.55_0.1_250)]">
              {current.label}
            </p>
            <h3 className="font-display relative mt-6 text-2xl text-zinc-50 md:text-[1.75rem]">
              {current.headline}
            </h3>
            <p className="relative mt-5 text-base leading-relaxed text-zinc-400">{current.copy}</p>
            <div className="relative mt-12 grid gap-4 border-t border-white/[0.06] pt-10 sm:grid-cols-2">
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  What improves
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Faster review cycles, fewer blind spots, clearer accountability loops.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  What drops away
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Vague narratives, missing context, and surprise rule collisions.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
