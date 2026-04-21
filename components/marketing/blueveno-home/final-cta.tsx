import { PremiumPrimaryLink } from "./premium-button";

export function FinalCta() {
  return (
    <section className="border-t border-white/[0.08] py-32 sm:py-40" aria-labelledby="cta-heading">
      <div className="mx-auto max-w-7xl px-5 text-center sm:px-8">
        <h2
          id="cta-heading"
          className="font-display text-[clamp(1.85rem,4.2vw,2.5rem)] font-bold tracking-[-0.048em] text-zinc-50"
        >
          Start tonight&apos;s review.
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-[15px] tracking-[-0.018em] text-zinc-600">One surface. No noise.</p>
        <div className="mt-14 flex justify-center">
          <PremiumPrimaryLink href="/signup">Create account</PremiumPrimaryLink>
        </div>
      </div>
    </section>
  );
}
