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
 * Hero — interactive workstation preview: tabs, depth lighting, hover-forward panels.
 */
export function Hero() {
  return (
    <Section
      size="wide"
      className="relative overflow-hidden pb-32 pt-28 lg:min-h-[min(96vh,60rem)] lg:pb-40 lg:pt-36"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-cobalt-field" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_55%_at_50%_-8%,oklch(0.44_0.12_252/0.14),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-bv-void via-bv-void/88 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[14%] h-[min(480px,56vw)] w-[min(480px,62vw)] rounded-full bg-bv-hero-rim blur-[72px]"
        aria-hidden
      />

      <div className="relative grid items-start gap-16 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        <div className="relative pl-5 sm:pl-6 lg:col-span-5 lg:pl-0 xl:col-span-5">
          <div
            className="pointer-events-none absolute left-0 top-2 bottom-24 w-px bg-rail-v sm:left-1"
            aria-hidden
          />

          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-bv-eyebrow/85">
              Performance workspace
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-8">
            <h1 className="font-display max-w-[16ch] text-[2.75rem] font-medium leading-[1.02] tracking-[-0.035em] text-zinc-50 sm:text-5xl lg:max-w-none lg:text-[3.2rem] xl:text-[3.45rem]">
              The tape is honest.
              <span className="mt-2 block text-gradient-cobalt lg:mt-3">Make review match it.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.08} className="mt-8 max-w-[21rem]">
            <p className="text-[1.0625rem] leading-snug text-zinc-400 sm:text-lg">
              Beyond a journal: one system for fills, analytics, review, and enforcement.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-9">
            <div className="flex flex-wrap gap-x-8 gap-y-3 border-y border-border/50 py-4">
              {specLine.map((s) => (
                <div key={s.k} className="flex items-baseline gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">{s.k}</span>
                  <span className="font-mono text-[11px] tabular-nums text-zinc-300">{s.v}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="mt-11 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href={marketingCtas.hero.primary.href}
              className="inline-flex min-h-[3.25rem] min-w-[13rem] items-center justify-center rounded-full bg-primary px-10 text-[15px] font-semibold text-primary-foreground shadow-bv-primary transition duration-300 hover:bg-primary/88"
            >
              {marketingCtas.hero.primary.label}
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={marketingCtas.hero.secondary.href}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/35 bg-bv-surface/45 px-8 text-sm font-medium text-zinc-100 backdrop-blur-sm transition duration-300 hover:border-primary/48 hover:bg-bv-surface/70"
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

          <Reveal delay={0.16} className="mt-14 border-t border-border/60 pt-7">
            <p className="max-w-xs font-mono text-[10px] leading-snug text-zinc-600">
              Encrypted sessions · proprietary tape · no training on your executions
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.06} className="relative lg:col-span-7 xl:col-span-7">
          <div
            className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,oklch(0.4_0.1_252/0.14),transparent_68%)] blur-[56px] lg:-inset-10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-px -z-10 rounded-[1.5rem] bg-gradient-to-br from-primary/14 via-transparent to-bv-blue-deep/8 opacity-95"
            aria-hidden
          />
          <div className="relative lg:pl-1">
            <HeroInteractiveWorkspace />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
