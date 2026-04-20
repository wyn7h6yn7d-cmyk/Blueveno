"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const personas = [
  {
    id: "intraday",
    label: "Intraday",
    headline: "Speed + integrity",
    copy: "Tags and review that keep up with the tape.",
  },
  {
    id: "swing",
    label: "Swing",
    headline: "Memory across the hold",
    copy: "Thesis, tweaks, outcome—one thread.",
  },
  {
    id: "prop",
    label: "Prop & funded",
    headline: "Rules in the same frame",
    copy: "Buffers and blackouts visible while you trade.",
  },
  {
    id: "desk",
    label: "Desk & coach",
    headline: "Evidence-based feedback",
    copy: "Shared tags and recaps—specific, fair.",
  },
];

export function TraderTypes() {
  const [active, setActive] = useState(personas[0].id);
  const current = personas.find((p) => p.id === active) ?? personas[0];

  return (
    <Section id="traders" className="bg-marketing-band py-28 lg:py-36">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:items-start lg:gap-20">
        <div>
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Who it fits</p>
            <h2 className="font-display mt-5 text-[2rem] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
              Same rigor. Different constraints.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-zinc-500">
              Select a profile—the UI weights journal, risk, or desk collaboration accordingly.
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
                    ? "border-primary/35 bg-primary/10 text-zinc-100"
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
          <div className="overflow-hidden rounded-2xl border border-border/85 bg-bv-surface/95 shadow-bv-lift">
            <div className="border-b border-white/[0.06] bg-black/25 px-5 py-3 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
              Profile · {current.label}
            </div>
            <div className="p-6 md:p-8">
              <h3 className="font-display text-2xl tracking-tight text-zinc-50">{current.headline}</h3>
              <p className="mt-3 text-sm leading-snug text-zinc-400">{current.copy}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { k: "Review cadence", v: "Daily" },
                  { k: "Focus", v: "Execution quality" },
                  { k: "Exports", v: "Desk-ready" },
                ].map((row) => (
                  <div
                    key={row.k}
                    className="rounded-xl border border-white/[0.06] bg-black/30 px-3 py-3 text-center"
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600">{row.k}</p>
                    <p className="mt-1.5 font-display text-sm text-zinc-200">{row.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-14 text-center">
        <a
          href={marketingCtas.traderTypes.review.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 transition hover:text-primary"
        >
          {marketingCtas.traderTypes.review.label} →
        </a>
      </Reveal>
    </Section>
  );
}
