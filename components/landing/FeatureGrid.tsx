import { Reveal } from "./Reveal";
import { Section } from "./Section";

const features = [
  {
    name: "Auto journaling",
    desc: "Executions become structured records—tags, notes, and session context without manual reconstruction.",
  },
  {
    name: "Performance analytics",
    desc: "Expectancy, distributions, and regime slices that behave like a research terminal, not a toy chart.",
  },
  {
    name: "Screenshot review",
    desc: "Chart captures stay bound to the fill so review stays honest when memory bends.",
  },
  {
    name: "Setup playbooks",
    desc: "Codify conditions and if-then logic—then measure adherence like any other KPI.",
  },
  {
    name: "Behavioral tracking",
    desc: "Surface impulses and repeat behaviors before they dominate the equity curve.",
  },
  {
    name: "Session recaps",
    desc: "End-of-session narratives you can export—concise, searchable, unflinching.",
  },
  {
    name: "Rule violations",
    desc: "Personal rules and firm constraints tracked alongside P&L—visible before the damage prints.",
  },
  {
    name: "Account &amp; prop tracking",
    desc: "Buffers, blackout windows, and desk rules beside performance—one surface, no tab sprawl.",
  },
];

export function FeatureGrid() {
  return (
    <Section id="platform" className="py-28 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
            Platform
          </p>
          <h2 className="font-display mt-5 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            A serious system—not a spreadsheet with a logo.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
            Every pillar connects: capture, context, analytics, and enforcement—so improvement
            compounds instead of resetting weekly.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.name} delay={0.04 * (i % 4)}>
            <div className="group flex h-full flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-[oklch(0.55_0.12_250/0.2)] hover:bg-white/[0.04]">
              <div className="mb-5 h-px w-12 bg-gradient-to-r from-[oklch(0.65_0.14_250)] to-transparent" />
              <h3 className="font-display text-[15px] text-zinc-100">{f.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
