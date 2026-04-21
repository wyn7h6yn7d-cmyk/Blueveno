import { PremiumPrimaryLink } from "./premium-button";

export function FinalCta() {
  return (
    <section
      id="cta"
      className="scroll-mt-28 border-t border-[oklch(0.52_0.12_252/0.2)] py-24 sm:scroll-mt-32 sm:py-32"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <h2
          id="cta-heading"
          className="font-display text-[clamp(1.65rem,4vw,2.25rem)] font-bold tracking-[-0.045em] text-zinc-50"
        >
          Close the book with intention.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] tracking-[-0.018em] text-zinc-500">
          One workspace. The full surface.
        </p>
        <div className="mt-10 flex justify-center">
          <PremiumPrimaryLink href="/signup">Create account</PremiumPrimaryLink>
        </div>
      </div>
    </section>
  );
}
