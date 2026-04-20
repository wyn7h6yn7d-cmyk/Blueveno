import { Reveal } from "./Reveal";
import { Section } from "./Section";

const outcomes = [
  {
    title: "Patterns emerge before they dominate P&L",
    body: "Execution history holds what narrative forgets. Blueveno connects behavior to outcome—so you see recurrence before it becomes expensive.",
    metric: "Earlier",
    metricLabel: "visibility into repeat failure modes",
  },
  {
    title: "Edge separates from variance",
    body: "Tagging and slicing show what holds across conditions—so skill and luck stop sharing the same label.",
    metric: "Sharper",
    metricLabel: "attribution across setups and regimes",
  },
  {
    title: "Discipline becomes legible",
    body: "Rules and guardrails sit next to performance—so discretion is visible when it drifts, not when the statement arrives.",
    metric: "Measured",
    metricLabel: "alignment between plan and prints",
  },
];

export function Outcomes() {
  return (
    <Section id="outcomes" className="py-28 lg:py-36">
      <Reveal>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.68_0.12_250)]">
          Outcomes
        </p>
        <h2 className="font-display mt-5 max-w-3xl text-3xl font-medium tracking-[-0.02em] text-zinc-50 sm:text-4xl lg:text-[2.7rem] lg:leading-[1.1]">
          Performance is built through review—not through louder intentions.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
          Traders need truth, not hope. Blueveno is where raw data becomes clarity: what occurred,
          what it implies, and what you enforce next.
        </p>
      </Reveal>

      <div className="mt-20 grid gap-6 lg:grid-cols-3">
        {outcomes.map((o, i) => (
          <Reveal key={o.title} delay={0.06 * i}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[oklch(0.105_0.028_265)] p-8 shadow-bv-card transition duration-300 hover:border-[oklch(0.55_0.12_250/0.28)]">
              <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[oklch(0.45_0.12_250/0.09)] blur-3xl transition group-hover:bg-[oklch(0.5_0.14_250/0.14)]" />
              <h3 className="font-display relative text-lg font-medium leading-snug tracking-tight text-zinc-100">
                {o.title}
              </h3>
              <p className="relative mt-4 flex-1 text-sm leading-relaxed text-zinc-400">{o.body}</p>
              <div className="relative mt-10 border-t border-white/[0.07] pt-8">
                <p className="font-display text-3xl tracking-tight text-zinc-50">{o.metric}</p>
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
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[oklch(0.74_0.12_250)] transition hover:text-[oklch(0.85_0.08_250)]"
        >
          Request access
          <span aria-hidden className="transition duration-300 group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </Reveal>
    </Section>
  );
}
