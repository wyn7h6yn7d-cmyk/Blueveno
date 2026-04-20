import { Reveal } from "./Reveal";
import { Section } from "./Section";

/**
 * Institutional “system ladder” — journal → analytics → review → accountability.
 * Product-structure clarity without consumer SaaS noise.
 */
const phases = [
  {
    step: "01",
    title: "Journal",
    line: "Normalized fills, tags, and context—one ledger.",
  },
  {
    step: "02",
    title: "Analytics",
    line: "Expectancy, slices, and distributions on that same record.",
  },
  {
    step: "03",
    title: "Review",
    line: "Screenshots and notes bound to what printed.",
  },
  {
    step: "04",
    title: "Accountability",
    line: "Rules, playbooks, and recaps you can defend.",
  },
] as const;

export function ProductArchitectureStrip() {
  return (
    <Section className="relative py-10 lg:py-14">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-bv-surface/60 to-bv-void/80 shadow-bv-card">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.38_0.1_252/0.08),transparent_55%)]" aria-hidden />
          <div className="relative border-b border-border/50 px-5 py-4 sm:px-6 lg:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bv-eyebrow/90">Product architecture</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Four layers on one tape—no handoffs between tools, no reconciliation drift.
            </p>
          </div>
          <div className="grid gap-0 lg:grid-cols-4">
            {phases.map((p, i) => (
              <div
                key={p.step}
                className="relative border-b border-border/40 px-5 py-5 sm:px-6 lg:border-b-0 lg:border-r lg:border-border/40 lg:py-6 lg:last:border-r-0"
              >
                {i < phases.length - 1 ? (
                  <div
                    className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-4 -translate-y-1/2 translate-x-1/2 bg-gradient-to-r from-primary/25 to-transparent lg:block"
                    aria-hidden
                  />
                ) : null}
                <p className="font-display text-2xl font-medium tabular-nums text-zinc-700/90">{p.step}</p>
                <h3 className="font-display mt-2 text-[15px] font-medium tracking-tight text-zinc-100">{p.title}</h3>
                <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">{p.line}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
