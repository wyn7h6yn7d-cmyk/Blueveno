"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const faqs = [
  {
    q: "Is Blueveno only for prop traders?",
    a: "No. Blueveno is for any serious trader who wants a rigorous journal and analytics layer. Prop awareness is optional—built for firms and funded accounts, but not required to get value.",
  },
  {
    q: "Will this replace my broker platform?",
    a: "Not at all. Blueveno is a performance layer above execution: it captures, organizes, and analyzes your trades—without pretending to be a routing engine.",
  },
  {
    q: "How automated is the journal?",
    a: "Executions can be ingested automatically, and Blueveno structures the record. You still add the subjective truth—screenshots, tags, and notes—because that’s where edge hides.",
  },
  {
    q: "Can teams share playbooks and tags?",
    a: "Yes. Blueveno is designed for shared vocabulary: consistent tags, exportable recaps, and review artifacts that travel cleanly between trader and coach.",
  },
  {
    q: "What about privacy?",
    a: "Your trading data is treated as proprietary. Blueveno is architected with least-privilege access and clear separation between product telemetry and customer content.",
  },
  {
    q: "Do you support crypto trading aesthetics?",
    a: "Not as a gimmick. Blueveno is calm, precise, and data-native—built for professionals, not casino cues.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<string | null>(faqs[0].q);

  return (
    <Section id="faq" className="py-24 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
            FAQ
          </p>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Straight answers—no hype, no hand-waving.
          </h2>
        </Reveal>
      </div>
      <div className="mx-auto mt-14 max-w-3xl divide-y divide-white/[0.08]">
        {faqs.map((item) => {
          const isOpen = open === item.q;
          return (
            <Reveal key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.q)}
                className="flex w-full items-start justify-between gap-4 py-4 text-left"
              >
                <span className="font-display text-base text-zinc-100">{item.q}</span>
                <span className="font-mono text-xs text-teal-400/80">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <p className="pb-4 text-sm leading-relaxed text-zinc-400">{item.a}</p>
              ) : null}
            </Reveal>
          );
        })}
      </div>
      <Reveal className="mt-12 text-center">
        <a
          href="#cta"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-teal-300/90 hover:text-teal-200"
        >
          Request access
          <span aria-hidden>→</span>
        </a>
      </Reveal>
    </Section>
  );
}
