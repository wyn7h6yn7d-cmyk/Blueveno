import { Reveal } from "./Reveal";
import { Section } from "./Section";

const outcomes = [
  {
    title: "Patterns surface before they cost you",
    body: "Review connects behavior to outcome—so you see which impulses precede drawdowns, not which trades felt bad.",
    metric: "Earlier",
    metricLabel: "intervention on repeat mistakes",
  },
  {
    title: "Edge separates from noise",
    body: "Tagging and slicing show what pays under which conditions—luck stops masquerading as skill.",
    metric: "Clearer",
    metricLabel: "expectancy by setup and regime",
  },
  {
    title: "Rules stay visible while you trade",
    body: "Firm constraints and personal guardrails live beside performance—violations surface before they compound.",
    metric: "Aligned",
    metricLabel: "risk posture with execution",
  },
];

export function Outcomes() {
  return (
    <Section id="outcomes" className="py-28 lg:py-36">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
          Outcomes
        </p>
        <h2 className="font-display mt-5 max-w-3xl text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
          Performance improves when review is systematic—not when motivation spikes.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Blueveno is for traders who want the truth in one coherent system: what happened, why it
          happened, and what to enforce next.
        </p>
      </Reveal>

      <div className="mt-20 grid gap-6 lg:grid-cols-3">
        {outcomes.map((o, i) => (
          <Reveal key={o.title} delay={0.06 * i}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[oklch(0.11_0.025_265)] p-8 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)] transition hover:border-[oklch(0.55_0.12_250/0.25)]">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[oklch(0.45_0.12_250/0.08)] blur-3xl transition group-hover:bg-[oklch(0.5_0.14_250/0.12)]" />
              <h3 className="font-display relative text-lg font-medium leading-snug text-zinc-100">
                {o.title}
              </h3>
              <p className="relative mt-4 flex-1 text-sm leading-relaxed text-zinc-400">{o.body}</p>
              <div className="relative mt-10 border-t border-white/[0.06] pt-8">
                <p className="font-display text-3xl tracking-tight text-zinc-100">{o.metric}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {o.metricLabel}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <a
          href="#cta"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.72_0.12_250)] transition hover:text-[oklch(0.82_0.08_250)]"
        >
          Request access
          <span aria-hidden className="transition group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </Reveal>
    </Section>
  );
}
