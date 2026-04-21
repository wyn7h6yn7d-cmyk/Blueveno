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
    line: "Fills, tags, context—one solution.",
  },
  {
    step: "02",
    title: "Analytics",
    line: "Expectancy and slices on that tape.",
  },
  {
    step: "03",
    title: "Review",
    line: "Screenshots and notes bound to prints.",
  },
  {
    step: "04",
    title: "Accountability",
    line: "Rules, playbooks, defensible recaps.",
  },
] as const;

export function ProductArchitectureStrip() {
  return (
    <Section className="relative py-12 lg:py-16">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-bv-surface-high/55 to-bv-void/90 shadow-bv-float ring-1 ring-primary/[0.06]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,oklch(0.42_0.11_252/0.14),transparent_55%)]" aria-hidden />
          <div className="relative border-b border-border/55 px-5 py-5 bv-hairline-top sm:px-6 lg:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bv-eyebrow/90">Product architecture</p>
            <p className="mt-2 max-w-md text-sm leading-snug text-zinc-500">
              One tape. Four layers. No tool handoffs.
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
                <p className="mt-2 text-[12px] leading-snug text-zinc-500">{p.line}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
