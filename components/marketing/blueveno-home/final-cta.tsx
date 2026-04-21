import { PremiumPrimaryLink } from "./premium-button";

export function FinalCta() {
  return (
    <section
      id="cta"
      className="scroll-mt-28 relative border-t border-white/[0.07] py-24 sm:scroll-mt-32 sm:py-28 lg:py-32"
      aria-labelledby="cta-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(50vh,480px)] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,oklch(0.38_0.12_252/0.14),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[720px] px-5 text-center sm:px-8">
        <h2
          id="cta-heading"
          className="font-display text-[clamp(2rem,4.5vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.05em] text-zinc-50"
        >
          Own the close.
        </h2>
        <div className="mt-12 flex justify-center">
          <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
        </div>
      </div>
    </section>
  );
}
