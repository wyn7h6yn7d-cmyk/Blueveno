"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const faqs = [
  {
    q: "Only for prop traders?",
    a: "No. Prop rules are optional—same core record for any serious operator.",
  },
  {
    q: "Replace my broker?",
    a: "No. Sits above execution: journal and analytics, not routing.",
  },
  {
    q: "How automated is the journal?",
    a: "Fills can ingest automatically. You still add judgment—tags, shots, notes.",
  },
  {
    q: "Teams and desks?",
    a: "Shared tags and exports so vocabulary and review align.",
  },
  {
    q: "Data privacy?",
    a: "Trading data as proprietary. Least-privilege access; telemetry split from content.",
  },
  {
    q: "Another crypto dashboard?",
    a: "No—calm UI for professionals, not casino optics.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<string | null>(faqs[0].q);

  return (
    <Section id="faq" className="relative bg-marketing-stage py-32 lg:py-44">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">FAQ</p>
          <h2 className="font-display mt-6 text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            Straight answers.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-snug text-zinc-600">
            Scope, privacy, what we are not.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 max-w-3xl divide-y divide-border/60">
        {faqs.map((item) => {
          const isOpen = open === item.q;
          return (
            <Reveal key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.q)}
                className="flex w-full items-start justify-between gap-6 py-4 text-left"
              >
                <span className="font-display text-[16px] leading-snug text-zinc-100">{item.q}</span>
                <span className="shrink-0 font-mono text-sm text-primary/85">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <p className="pb-4 text-[14px] leading-snug text-zinc-400">{item.a}</p>
              ) : null}
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mt-10 text-center">
        <a
          href={marketingCtas.faq.close.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 hover:text-primary"
        >
          {marketingCtas.faq.close.label} →
        </a>
      </Reveal>
    </Section>
  );
}
