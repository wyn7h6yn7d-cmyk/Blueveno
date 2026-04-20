import Link from "next/link";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { HeroTerminal } from "@/components/landing/mockups";

export function Hero() {
  return (
    <Section size="wide" className="relative overflow-hidden pb-24 pt-32 lg:pb-32 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-hero-spotlight" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-vignette" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.35]" aria-hidden />

      <div className="relative grid items-center gap-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.55_0.2_250)] opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-[oklch(0.65_0.16_250)]" />
              </span>
              Performance intelligence
            </p>
          </Reveal>

          <Reveal delay={0.04} className="mt-8">
            <h1 className="font-display max-w-[22ch] text-[2.65rem] font-medium leading-[1.05] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.35rem]">
              The edge is not in the setup.{" "}
              <span className="text-gradient-electric">It is in what the data proves after.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 max-w-xl">
            <p className="text-lg leading-[1.65] text-zinc-400 sm:text-xl">
              Blueveno turns execution into structured evidence: every fill tagged, every session
              reviewable, every pattern visible. Discipline becomes measurable—then improvable.
            </p>
          </Reveal>

          <Reveal delay={0.14} className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[oklch(0.72_0.14_250)] px-8 py-3 text-sm font-medium text-[oklch(0.12_0.04_265)] shadow-[0_0_60px_-12px_oklch(0.55_0.22_250/0.55)] transition hover:bg-[oklch(0.78_0.12_250)]"
            >
              Enter workspace
            </Link>
            <Link
              href="#platform"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] px-8 py-3 text-sm text-zinc-200 backdrop-blur-sm transition hover:border-white/[0.2] hover:bg-white/[0.06]"
            >
              See the system
            </Link>
          </Reveal>

          <Reveal delay={0.18} className="mt-14 flex flex-wrap gap-x-10 gap-y-2 border-t border-white/[0.06] pt-10">
            <p className="max-w-xs font-mono text-[11px] leading-relaxed text-zinc-500">
              For traders who treat capital as a responsibility—not a lottery ticket. No noise. No
              borrowed conviction.
            </p>
            <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              <span>Structured review</span>
              <span className="text-zinc-800">·</span>
              <span>Prop-aware</span>
              <span className="text-zinc-800">·</span>
              <span>Evidence-first</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,oklch(0.45_0.15_250/0.15),transparent_65%)] blur-2xl" />
          <div className="absolute -inset-1 -z-10 rounded-[2rem] bg-gradient-to-br from-[oklch(0.5_0.15_250/0.12)] via-transparent to-[oklch(0.4_0.1_270/0.08)] opacity-80" />
          <HeroTerminal />
        </Reveal>
      </div>
    </Section>
  );
}
