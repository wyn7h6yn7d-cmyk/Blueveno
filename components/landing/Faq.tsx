"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const faqs = [
  {
    q: "Is Blueveno only for prop traders?",
    a: "No. Any serious trader who wants structured review and analytics benefits. Prop and firm rules are optional layers—they sit on top of the same core: truth in execution, clarity in review.",
  },
  {
    q: "Does this replace my execution platform?",
    a: "No. Blueveno sits above execution: it organizes, enriches, and analyzes—without pretending to be a broker or router.",
  },
  {
    q: "How automated is the journal?",
    a: "Fills can be ingested automatically. You still add judgment—tags, screenshots, notes—because that is where edge hides.",
  },
  {
    q: "Can teams share standards?",
    a: "Yes. Shared tags, exportable recaps, and consistent structure help desks and coaches align on vocabulary and review.",
  },
  {
    q: "What about data privacy?",
    a: "Your trading data is treated as proprietary. Access is least-privilege; product telemetry is separated from customer content by design.",
  },
  {
    q: "Is this another crypto dashboard?",
    a: "No. The UI is calm, precise, and institutional in tone—built for professionals, not casino optics.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<string | null>(faqs[0].q);

  return (
    <Section id="faq" className="py-28 lg:py-36">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
            FAQ
          </p>
          <h2 className="font-display mt-5 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Direct answers. No theater.
          </h2>
        </Reveal>
      </div>

      <div className="mx-auto mt-16 max-w-3xl divide-y divide-white/[0.07]">
        {faqs.map((item) => {
          const isOpen = open === item.q;
          return (
            <Reveal key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.q)}
                className="flex w-full items-start justify-between gap-6 py-5 text-left"
              >
                <span className="font-display text-[17px] text-zinc-100">{item.q}</span>
                <span className="shrink-0 font-mono text-sm text-[oklch(0.65_0.12_250)]">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <p className="pb-5 text-[15px] leading-relaxed text-zinc-400">{item.a}</p>
              ) : null}
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-14 text-center">
        <a
          href="#cta"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.72_0.12_250)] transition hover:text-[oklch(0.82_0.08_250)]"
        >
          Request access →
        </a>
      </Reveal>
    </Section>
  );
}
