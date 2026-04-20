import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { HeroDashboard } from "@/components/mockups/HeroDashboard";

export function Hero() {
  return (
    <Section className="relative overflow-hidden pt-28 pb-20 lg:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-50" aria-hidden />
      <div className="relative grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400/80" />
              Trading performance OS
            </p>
          </Reveal>
          <Reveal delay={0.05} className="mt-6">
            <h1 className="font-display max-w-xl text-4xl font-medium leading-[1.08] tracking-tight text-zinc-50 sm:text-5xl lg:text-[3.35rem]">
              Turn execution into a system you can{" "}
              <span className="bg-gradient-to-r from-teal-200 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
                measure, repeat, and defend
              </span>
              .
            </h1>
          </Reveal>
          <Reveal delay={0.1} className="mt-6 max-w-lg">
            <p className="text-lg leading-relaxed text-zinc-400">
              Blueveno auto-journals your sessions, surfaces the behaviors that move P&amp;L,
              and keeps prop rules in view—so your review is evidence-based, not
              nostalgia-based.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#cta"
              className="inline-flex items-center justify-center rounded-full bg-teal-400 px-6 py-3 text-sm font-medium text-zinc-950 shadow-[0_0_40px_-8px_rgba(45,212,191,0.55)] transition hover:bg-teal-300"
            >
              Get early access
            </a>
            <a
              href="#platform"
              className="inline-flex items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.02] px-6 py-3 text-sm text-zinc-200 transition hover:border-white/[0.2] hover:bg-white/[0.05]"
            >
              Explore the platform
            </a>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] text-zinc-500">
            <span>Auto journal</span>
            <span className="text-zinc-700">·</span>
            <span>Behavior analytics</span>
            <span className="text-zinc-700">·</span>
            <span>Prop-aware guardrails</span>
          </Reveal>
        </div>
        <Reveal delay={0.12} className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-teal-500/10 via-transparent to-violet-500/10 blur-3xl" />
          <HeroDashboard />
        </Reveal>
      </div>
    </Section>
  );
}
