import { PremiumPrimaryLink } from "./premium-button";

export function FinalCta() {
  return (
    <section
      id="cta"
      className="scroll-mt-28 relative border-t border-white/[0.07] py-16 sm:scroll-mt-32 sm:py-20 lg:py-24"
      aria-labelledby="cta-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,oklch(0.1_0.06_262/0.22)_0%,transparent_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1320px] px-5 text-center sm:px-8 lg:px-10">
        <h2
          id="cta-heading"
          className="font-display text-[clamp(1.5rem,3.5vw,2.35rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-50"
        >
          Data makes you green.
        </h2>
        <div className="mt-8 flex justify-center sm:mt-10">
          <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
        </div>
      </div>
    </section>
  );
}
