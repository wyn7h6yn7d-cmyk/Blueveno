import Link from "next/link";
import { HeroInteractiveWorkspace } from "@/components/landing/hero-interactive-workspace";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { marketingCtas } from "@/lib/marketing-ctas";

const specLine = [
  { k: "Ledger", v: "Unified" },
  { k: "P&L", v: "R-norm" },
  { k: "Exports", v: "Audit" },
];

/**
 * Hero — sharp workstation preview: high contrast, minimal bloom, clear hierarchy.
 */
export function Hero() {
  return (
    <Section
      size="wide"
      className="relative overflow-hidden bg-bv-void pb-28 pt-24 lg:min-h-[min(92vh,58rem)] lg:pb-36 lg:pt-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-precision-field" aria-hidden />

      <div className="relative grid items-start gap-12 lg:grid-cols-12 lg:gap-14 xl:gap-16">
        <div className="lg:col-span-5 xl:col-span-5">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-bv-eyebrow">
              Performance workspace
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-7">
            <h1 className="font-display max-w-[15ch] text-[2.65rem] font-medium leading-[1.05] tracking-[-0.035em] text-zinc-50 sm:text-5xl lg:max-w-none lg:text-[3.1rem] xl:text-[3.35rem]">
              The tape is honest.
              <span className="mt-2 block text-primary lg:mt-2.5">Make review match it.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.08} className="mt-6 max-w-[20rem]">
            <p className="text-[0.9375rem] leading-relaxed text-zinc-300 sm:text-[1rem]">
              One ledger for fills, analytics, review, and rules—no reconstruction after the close.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <div className="flex flex-wrap gap-x-7 gap-y-2.5">
              {specLine.map((s) => (
                <div key={s.k} className="flex items-baseline gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">{s.k}</span>
                  <span className="font-mono text-[11px] tabular-nums text-zinc-100">{s.v}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={marketingCtas.hero.primary.href}
              className="inline-flex min-h-[3.25rem] min-w-[13rem] items-center justify-center rounded-full bg-primary px-10 text-[15px] font-semibold text-primary-foreground shadow-bv-primary transition duration-300 hover:bg-primary/90"
            >
              {marketingCtas.hero.primary.label}
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={marketingCtas.hero.secondary.href}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/[0.14] bg-bv-surface/80 px-8 text-sm font-medium text-zinc-100 transition duration-300 hover:border-primary/40 hover:bg-bv-surface"
              >
                {marketingCtas.hero.secondary.label}
              </Link>
              <Link
                href={marketingCtas.hero.tertiary.href}
                className="inline-flex min-h-12 items-center px-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
              >
                {marketingCtas.hero.tertiary.label}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.16} className="mt-12">
            <p className="max-w-xs font-mono text-[10px] leading-snug text-zinc-500">
              Encrypted sessions · proprietary tape · no training on your executions
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.06} className="relative lg:col-span-7 xl:col-span-7">
          <div className="relative">
            <HeroInteractiveWorkspace />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
