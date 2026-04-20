import { Reveal } from "./Reveal";
import { Section } from "./Section";

const steps = [
  {
    step: "01",
    title: "Connect & capture",
    body: "Blueveno ingests executions and enriches them with session metadata—automatically, quietly, completely.",
  },
  {
    step: "02",
    title: "Tag & annotate",
    body: "Apply strategy labels, attach screenshots, and log the subjective details that numbers miss.",
  },
  {
    step: "03",
    title: "Analyze & compare",
    body: "Slice expectancy by behavior, regime, and setup—terminal-grade filters, trader-grade clarity.",
  },
  {
    step: "04",
    title: "Recap & enforce",
    body: "Generate session narratives, update playbooks, and keep prop buffers visible for the next open.",
  },
];

export function Workflow() {
  return (
    <Section id="workflow" className="relative py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent" />
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
            Workflow
          </p>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            A closed loop from execution to insight—every session.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            The goal is simple: make the next decision easier because the last one is fully
            documented.
          </p>
        </Reveal>
      </div>
      <div className="mt-16 grid gap-6 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={0.06 * i}>
            <div className="relative flex h-full flex-col rounded-2xl border border-white/[0.07] bg-[#07080d] p-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
                {s.step}
              </span>
              <h3 className="font-display mt-4 text-lg text-zinc-100">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              <div className="mt-6 flex-1" />
              <div className="font-mono text-[10px] text-zinc-600">
                {i < steps.length - 1 ? "→" : "↻"} loop
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-14 text-center">
        <a
          href="#cta"
          className="inline-flex rounded-full border border-white/[0.12] bg-white/[0.03] px-6 py-3 text-sm text-zinc-200 transition hover:border-teal-500/30 hover:text-white"
        >
          Join the early access list
        </a>
      </Reveal>
    </Section>
  );
}
