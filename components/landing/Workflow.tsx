import { ArrowDown, LineChart, PenLine, ShieldCheck, Sparkles } from "lucide-react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const steps = [
  {
    step: "01",
    title: "Capture",
    body: "Executions and context in—automatically.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Annotate",
    body: "Tags, screenshots, notes on the record.",
    icon: PenLine,
  },
  {
    step: "03",
    title: "Measure",
    body: "Slice by behavior, setup, regime.",
    icon: LineChart,
  },
  {
    step: "04",
    title: "Enforce",
    body: "Playbooks, violations, recaps—next session.",
    icon: ShieldCheck,
  },
];

export function Workflow() {
  return (
    <Section id="workflow" className="relative py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-bv-border-accent/80 to-transparent" />

      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Operating loop</p>
          <h2 className="font-display mt-5 text-[2rem] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            Four moves. Every session.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-[17px]">
            The same cadence whether you trade once a day or a hundred times—capture, annotate, measure,
            enforce.
          </p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-4 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={0.05 * i}>
            <div className="relative flex h-full flex-col rounded-2xl border border-border/80 bg-bv-surface/95 p-7 shadow-bv-card">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-medium tabular-nums text-zinc-600">{s.step}</span>
                <s.icon className="size-4 text-primary/85" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="font-display mt-6 text-lg font-medium tracking-tight text-zinc-100">{s.title}</h3>
              <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-zinc-500">{s.body}</p>
              {i < steps.length - 1 ? (
                <ArrowDown className="mt-6 size-4 text-zinc-700 lg:hidden" aria-hidden />
              ) : (
                <p className="mt-6 font-mono text-[10px] text-zinc-700">↻</p>
              )}
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <a
          href={marketingCtas.workflow.plans.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 hover:text-primary"
        >
          {marketingCtas.workflow.plans.label} →
        </a>
      </Reveal>
    </Section>
  );
}
