import { PremiumPrimaryLink } from "./premium-button";

export function FinalCta() {
  return (
    <section className="py-32 sm:py-40" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] px-6 py-[4.5rem] text-center sm:px-12 sm:py-[5rem]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_-15%,oklch(0.38_0.1_252/0.14),transparent_58%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
            aria-hidden
          />
          <div className="relative mx-auto max-w-lg">
            <h2
              id="cta-heading"
              className="font-display text-[clamp(1.75rem,3.8vw,2.25rem)] font-semibold tracking-[-0.042em] text-zinc-50"
            >
              Start tonight&apos;s review.
            </h2>
            <p className="mt-5 text-[15px] tracking-[-0.01em] text-zinc-600">One surface. No noise.</p>
            <div className="mt-12 flex justify-center">
              <PremiumPrimaryLink href="/signup">Create account</PremiumPrimaryLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
