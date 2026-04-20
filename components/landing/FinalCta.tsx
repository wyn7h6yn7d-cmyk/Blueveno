import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function FinalCta() {
  return (
    <Section id="cta" className="pb-24 lg:pb-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0a0c12] via-[#07080d] to-[#050608] px-6 py-14 text-center sm:px-12 lg:px-16">
          <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-90" />
          <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-teal-400/80">
              Early access
            </p>
            <h2 className="font-display mt-4 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
              Build the journal your future self will thank you for.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Blueveno is rolling out in controlled waves so onboarding stays white-glove.
              Tell us how you trade—we’ll tailor your workspace accordingly.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:hello@blueveno.com?subject=Blueveno%20early%20access"
                className="inline-flex items-center justify-center rounded-full bg-teal-400 px-8 py-3.5 text-sm font-medium text-zinc-950 shadow-[0_0_48px_-12px_rgba(45,212,191,0.55)] transition hover:bg-teal-300"
              >
                Request access
              </a>
              <a
                href="#platform"
                className="inline-flex items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.02] px-8 py-3.5 text-sm text-zinc-200 transition hover:border-white/[0.2]"
              >
                Review the platform
              </a>
            </div>
            <p className="mt-8 font-mono text-[11px] text-zinc-600">
              Prefer a walkthrough? Mention “demo” in your note—we’ll reach out with a
              calendar link.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
