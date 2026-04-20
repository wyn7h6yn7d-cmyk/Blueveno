import { Reveal } from "./Reveal";
import { Section } from "./Section";

const features = [
  {
    name: "Auto journaling",
    desc: "Trades become structured records without manual data entry—notes, tags, and context preserved.",
  },
  {
    name: "Performance analytics",
    desc: "Distributions, streaks, expectancy, and drill-downs that behave like a real research terminal.",
  },
  {
    name: "Strategy tagging",
    desc: "Attribute fills to setups and regimes so you can compare what works across conditions.",
  },
  {
    name: "Screenshot review",
    desc: "Keep the chart story attached to the execution trail—so reviews stay specific.",
  },
  {
    name: "Behavior tracking",
    desc: "Surface impulses, rule breaks, and repeat patterns before they compound.",
  },
  {
    name: "Session recaps",
    desc: "End-of-session narratives you can export—concise, searchable, and honest.",
  },
  {
    name: "Playbooks",
    desc: "Codify if-then logic and pre-market checks so discretion stays disciplined.",
  },
  {
    name: "Prop awareness",
    desc: "Guardrails tuned to common firm rules—drawdown, consistency, and risk buffers visible live.",
  },
];

export function FeatureGrid() {
  return (
    <Section id="platform" className="py-24 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
            Core platform
          </p>
          <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Everything serious journaling should be—without the toy UI.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            A single workspace that connects the trade, the story, and the stats—so you can
            improve with precision.
          </p>
        </Reveal>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.name} delay={0.03 * (i % 4)}>
            <div className="flex h-full flex-col rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition hover:border-teal-500/15 hover:bg-white/[0.04]">
              <div className="mb-4 h-px w-10 bg-gradient-to-r from-teal-400/50 to-transparent" />
              <h3 className="font-display text-base text-zinc-100">{f.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
