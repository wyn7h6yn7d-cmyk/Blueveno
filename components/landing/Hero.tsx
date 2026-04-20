import Link from "next/link";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { HeroTerminal } from "@/components/landing/mockups";
import { marketingCtas } from "@/lib/marketing-ctas";

const specLine = [
  { k: "Ledger", v: "Unified" },
  { k: "P&L", v: "R-normalized" },
  { k: "Exports", v: "Audit-ready" },
];

/**
 * Hero — workstation-forward: clear hierarchy, minimal chrome noise, cinematic depth.
 */
export function Hero() {
  return (
    <Section
      size="wide"
      className="relative overflow-hidden pb-28 pt-28 lg:min-h-[min(94vh,58rem)] lg:pb-36 lg:pt-32"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-cobalt-field" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-bv-void via-bv-void/85 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[18%] h-[min(440px,52vw)] w-[min(440px,58vw)] rounded-full bg-bv-hero-rim blur-3xl"
        aria-hidden
      />

      <div className="relative grid items-center gap-16 lg:grid-cols-12 lg:gap-12 xl:gap-16">
        <div className="relative pl-5 sm:pl-6 lg:col-span-5 lg:pl-0 xl:col-span-5">
          <div
            className="pointer-events-none absolute left-0 top-2 bottom-20 w-px bg-rail-v sm:left-1"
            aria-hidden
          />

          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-bv-eyebrow/85">
              Performance workspace
            </p>
          </Reveal>

          <Reveal delay={0.03} className="mt-5">
            <div className="inline-flex items-center gap-3 rounded-full border border-primary/22 bg-bv-surface/55 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/85 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)] backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/35 opacity-30" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              Journal · analytics · review · enforcement
            </div>
          </Reveal>

          <Reveal delay={0.06} className="mt-9">
            <h1 className="font-display max-w-[15ch] text-[2.75rem] font-medium leading-[1.03] tracking-[-0.035em] text-zinc-50 sm:text-5xl lg:max-w-none lg:text-[3.2rem] xl:text-[3.5rem]">
              The tape is already honest.
              <span className="mt-2 block text-gradient-cobalt lg:mt-3">
                Your review should be too.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 max-w-[26rem]">
            <p className="text-[1.0625rem] leading-[1.58] text-zinc-400 sm:text-lg">
              One workstation for fills, context, and measurement—so discipline lives in the record,
              not in the story you tell after the close.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="mt-8">
            <div className="flex flex-wrap gap-x-8 gap-y-3 border-y border-border/50 py-4">
              {specLine.map((s) => (
                <div key={s.k} className="flex items-baseline gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">{s.k}</span>
                  <span className="font-mono text-[11px] tabular-nums text-zinc-300">{s.v}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.14} className="mt-10 flex flex-wrap items-center gap-3 sm:gap-3.5">
            <a
              href={marketingCtas.hero.primary.href}
              className="inline-flex min-h-12 min-w-[11rem] items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-bv-primary transition duration-300 hover:bg-primary/88"
            >
              {marketingCtas.hero.primary.label}
            </a>
            <Link
              href={marketingCtas.hero.secondary.href}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-primary/30 bg-bv-surface/40 px-7 text-sm font-medium text-zinc-200 backdrop-blur-sm transition duration-300 hover:border-primary/42 hover:bg-bv-surface/65"
            >
              {marketingCtas.hero.secondary.label}
            </Link>
            <Link
              href={marketingCtas.hero.tertiary.href}
              className="inline-flex min-h-12 items-center px-4 text-sm font-medium text-zinc-500 transition hover:text-zinc-300"
            >
              {marketingCtas.hero.tertiary.label}
            </Link>
          </Reveal>

          <Reveal delay={0.18} className="mt-14 border-t border-border/60 pt-8">
            <p className="max-w-md font-mono text-[11px] leading-relaxed text-zinc-600">
              <span className="text-zinc-500">Institutional posture.</span> Encrypted sessions; your
              journal treated as proprietary—no resale of signals, no training on your executions.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.08} className="relative lg:col-span-7 xl:col-span-7">
          <div
            className="pointer-events-none absolute -inset-5 -z-10 rounded-[2.25rem] bg-[radial-gradient(ellipse_at_center,oklch(0.4_0.1_252/0.14),transparent_68%)] blur-[56px] lg:-inset-10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -inset-px -z-10 rounded-[1.5rem] bg-gradient-to-br from-primary/14 via-transparent to-bv-blue-deep/8 opacity-95"
            aria-hidden
          />
          <div className="relative lg:pl-1">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
                Live workspace
              </p>
              <span className="rounded-full border border-border/60 bg-bv-surface-inset/80 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-zinc-500">
                Preview · read-only
              </span>
            </div>
            <div className="origin-top [transform:perspective(1500px)_rotateX(1.75deg)] lg:scale-[1.01]">
              <HeroTerminal />
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
