import { PremiumPrimaryLink } from "./premium-button";

export function FinalCta() {
  return (
    <section
      id="cta"
      className="scroll-mt-28 border-t border-[oklch(0.52_0.12_252/0.2)] py-28 sm:scroll-mt-32 sm:py-36"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <div className="relative mx-auto inline-block">
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-r from-[oklch(0.52_0.14_252/0.2)] via-[oklch(0.52_0.14_252/0.06)] to-[oklch(0.52_0.14_252/0.2)]"
            aria-hidden
          />
          <div className="relative rounded-2xl border border-[oklch(0.52_0.12_252/0.25)] bg-[oklch(0.045_0.045_272/0.9)] px-8 py-14 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)] sm:px-14 sm:py-16">
            <h2
              id="cta-heading"
              className="font-display text-[clamp(1.75rem,4vw,2.35rem)] font-bold tracking-[-0.048em] text-zinc-50"
            >
              Close the loop tonight.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-[15px] tracking-[-0.018em] text-zinc-500">One account. The full surface.</p>
            <div className="mt-12 flex justify-center">
              <PremiumPrimaryLink href="/signup">Create account</PremiumPrimaryLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
