import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { WorkflowStory } from "./WorkflowStory";
import { marketingCtas } from "@/lib/marketing-ctas";

/**
 * Operating loop — scrollytelling + one evolving trade (see WorkflowStory).
 */
export function Workflow() {
  return (
    <Section id="workflow" className="relative bg-marketing-depth py-32 lg:py-44">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mt-px h-px bg-gradient-to-r from-transparent via-bv-border-accent/50 to-transparent opacity-80" />

      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">How it works</p>
          <h2 className="font-display mt-6 text-[2rem] font-medium leading-[1.12] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            One trade. Full loop.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-snug text-zinc-500">
            Scroll—watch the same print gain context, metrics, and enforcement.
          </p>
        </Reveal>
      </div>

      <WorkflowStory />

      <Reveal className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center lg:mt-24">
        <a
          href={marketingCtas.workflow.explore.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/85 transition hover:text-primary"
        >
          {marketingCtas.workflow.explore.label} →
        </a>
        <a
          href={marketingCtas.workflow.plans.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
        >
          {marketingCtas.workflow.plans.label} →
        </a>
      </Reveal>
    </Section>
  );
}
