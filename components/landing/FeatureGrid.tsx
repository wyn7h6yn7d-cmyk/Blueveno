import { Reveal } from "./Reveal";
import { Section } from "./Section";

const features = [
  {
    name: "Automatic journaling",
    desc: "Executions collapse into a coherent record—tags, notes, and session context without rebuilding the day from memory.",
  },
  {
    name: "Performance analytics",
    desc: "Expectancy, distributions, and regime slices with the sobriety of a research terminal—not dashboard glitter.",
  },
  {
    name: "Screenshot review",
    desc: "Chart state stays married to the fill—so post-trade analysis cannot drift into fiction.",
  },
  {
    name: "Setup playbooks",
    desc: "Conditions and non-negotiables written where you execute—adherence measured with the same rigor as R.",
  },
  {
    name: "Behavioral tracking",
    desc: "Impulse and repetition surface from history—before they own the month.",
  },
  {
    name: "Session recaps",
    desc: "Structured summaries you can stand behind: concise, searchable, suitable for a desk or a coach.",
  },
  {
    name: "Rule violations",
    desc: "Personal and firm constraints tracked alongside P&L—visible while discretion still matters.",
  },
  {
    name: "Account and prop oversight",
    desc: "Buffers, windows, and desk rules in the same frame as performance—risk stays operational.",
  },
];

export function FeatureGrid() {
  return (
    <Section id="platform" className="py-28 lg:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.68_0.12_250)]">
            Platform
          </p>
          <h2 className="font-display mt-5 text-3xl font-medium tracking-[-0.02em] text-zinc-50 sm:text-4xl">
            One system for execution, review, and enforcement.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
            Capture, context, analytics, and accountability connect—so repeatable edge has somewhere
            to live besides a spreadsheet tab.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.name} delay={0.04 * (i % 4)}>
            <div className="group flex h-full flex-col rounded-xl border border-white/[0.07] bg-[oklch(0.09_0.028_265/0.85)] p-6 shadow-bv-card transition duration-300 hover:border-[oklch(0.55_0.12_250/0.22)] hover:bg-[oklch(0.1_0.03_265/0.95)]">
              <div className="mb-5 h-px w-12 bg-gradient-to-r from-[oklch(0.68_0.14_250)] to-transparent" />
              <h3 className="font-display text-[15px] tracking-tight text-zinc-100">{f.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
