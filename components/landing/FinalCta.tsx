import Link from "next/link";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

export function FinalCta() {
  return (
    <Section id="cta" className="pb-28 lg:pb-36">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] p-px shadow-bv-lift">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/[0.14] via-white/[0.04] to-transparent opacity-90" />
          <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-white/[0.06] bg-gradient-to-br from-[oklch(0.13_0.03_265)] via-[oklch(0.1_0.028_265)] to-[oklch(0.08_0.03_270)] px-6 py-20 text-center sm:px-12 lg:px-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-hero-spotlight opacity-50" />
            <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-[oklch(0.45_0.14_250/0.18)] blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-[oklch(0.35_0.1_270/0.14)] blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <div className="relative mx-auto max-w-2xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.68_0.12_250)]">
                Early access
              </p>
              <h2 className="font-display mt-6 text-3xl font-medium tracking-[-0.02em] text-zinc-50 sm:text-4xl lg:text-[2.55rem] lg:leading-tight">
                Put review on the same footing as execution.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg">
                We onboard in controlled waves so setup stays precise. Tell us how you trade—we shape
                your workspace accordingly.
              </p>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="mailto:hello@blueveno.com?subject=Blueveno%20access"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[oklch(0.72_0.14_250)] px-10 py-3.5 text-sm font-semibold text-[oklch(0.12_0.04_265)] shadow-[0_0_0_1px_oklch(1_0_0_/0.12),0_0_72px_-18px_oklch(0.52_0.2_250/0.5)] transition duration-300 hover:bg-[oklch(0.78_0.12_250)]"
                >
                  Request access
                </a>
                <Link
                  href="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] px-10 py-3.5 text-sm font-medium text-zinc-300 transition duration-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-zinc-100"
                >
                  Sign in
                </Link>
              </div>
              <p className="mt-10 font-mono text-[11px] text-zinc-600">
                Prefer a walkthrough? Mention “demo” in your note.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
