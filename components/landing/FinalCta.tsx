import Link from "next/link";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

export function FinalCta() {
  return (
    <Section id="cta" className="pb-28 lg:pb-36">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] p-px shadow-bv-lift">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/[0.14] via-white/[0.04] to-transparent opacity-90" />
          <div className="relative overflow-hidden rounded-[calc(2rem-1px)] border border-border/80 bg-bv-cta-panel px-6 py-16 text-center sm:px-12 sm:py-20 lg:px-20 lg:py-24">
            <div className="pointer-events-none absolute inset-0 bg-hero-spotlight opacity-45" />
            <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-bv-cta-bloom blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-0 size-96 rounded-full bg-bv-cta-bloom-soft blur-3xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

            <div className="relative mx-auto max-w-xl">
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-bv-eyebrow">
                {marketingCtas.finalCta.eyebrow}
              </p>
              <h2 className="font-display mt-5 text-[2rem] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
                Review deserves the same rigor as execution.
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-zinc-500 sm:text-[17px]">
                We onboard in waves—tell us how you trade; we shape your workspace.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href={marketingCtas.finalCta.primary.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-bv-primary transition duration-300 hover:bg-primary/88 sm:px-10"
                >
                  {marketingCtas.finalCta.primary.label}
                </a>
                <Link
                  href={marketingCtas.finalCta.secondary.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-8 py-3.5 text-sm font-medium text-bv-ice transition duration-300 hover:border-primary/45 hover:bg-primary/16 sm:px-10"
                >
                  {marketingCtas.finalCta.secondary.label}
                </Link>
                <Link
                  href={marketingCtas.finalCta.tertiary.href}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.03] px-8 py-3.5 text-sm font-medium text-zinc-400 transition duration-300 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-zinc-200 sm:px-10"
                >
                  {marketingCtas.finalCta.tertiary.label}
                </Link>
              </div>
              <p className="mt-8 font-mono text-[11px] text-zinc-600">
                Want a walkthrough? Mention “demo” in your note to{" "}
                <a href={marketingCtas.finalCta.primary.href} className="text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline">
                  hello@blueveno.com
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
