import Link from "next/link";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function FinalCta() {
  return (
    <Section id="cta" className="pb-28 lg:pb-36">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-[oklch(0.12_0.03_265)] via-[oklch(0.1_0.025_265)] to-[oklch(0.08_0.03_270)] px-6 py-20 text-center sm:px-12 lg:px-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 bg-hero-spotlight opacity-60" />
          <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-[oklch(0.45_0.14_250/0.15)] blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-[oklch(0.35_0.1_270/0.12)] blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
              Early access
            </p>
            <h2 className="font-display mt-6 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Build the review discipline your results deserve.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
              We onboard in controlled waves so setup stays precise. Tell us how you trade—we shape
              your workspace accordingly.
            </p>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:hello@blueveno.com?subject=Blueveno%20access"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[oklch(0.72_0.14_250)] px-10 py-3.5 text-sm font-medium text-[oklch(0.12_0.04_265)] shadow-[0_0_64px_-16px_oklch(0.55_0.2_250/0.5)] transition hover:bg-[oklch(0.78_0.12_250)]"
              >
                Request access
              </a>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-10 py-3.5 text-sm text-zinc-200 transition hover:border-white/[0.2] hover:bg-white/[0.07]"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-10 font-mono text-[11px] text-zinc-600">
              Prefer a walkthrough? Mention “demo” in your note.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
