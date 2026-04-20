import { Reveal } from "./Reveal";
import { Section } from "./Section";

const steps = [
  {
    step: "01",
    title: "Capture",
    body: "Executions and context flow in automatically—session metadata included, excuses excluded.",
  },
  {
    step: "02",
    title: "Annotate",
    body: "Tag setups, attach screenshots, log the subjective detail that numbers alone cannot hold.",
  },
  {
    step: "03",
    title: "Measure",
    body: "Slice performance by behavior and regime—see what pays, what punishes, what repeats.",
  },
  {
    step: "04",
    title: "Enforce",
    body: "Update playbooks, surface violations, export recaps—then bring the same discipline to the next open.",
  },
];

export function Workflow() {
  return (
    <Section id="workflow" className="relative py-28 lg:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-[oklch(0.45_0.1_250/0.25)] to-transparent" />

      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
            How it works
          </p>
          <h2 className="font-display mt-5 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            A closed loop—every session, without heroics.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
            The point is not motivation. It is repeatability: capture, interpret, adjust, return.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-5 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={0.07 * i}>
            <div className="relative flex h-full flex-col rounded-2xl border border-white/[0.07] bg-[oklch(0.1_0.025_265)] p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-600">
                {s.step}
              </span>
              <h3 className="font-display mt-5 text-lg text-zinc-100">{s.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500">{s.body}</p>
              <p className="mt-8 font-mono text-[10px] text-zinc-700">
                {i < steps.length - 1 ? "↓" : "↻"}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <a
          href="#cta"
          className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.03] px-7 py-3 text-sm text-zinc-200 transition hover:border-[oklch(0.55_0.12_250/0.35)] hover:bg-white/[0.06]"
        >
          Join early access
        </a>
      </Reveal>
    </Section>
  );
}
