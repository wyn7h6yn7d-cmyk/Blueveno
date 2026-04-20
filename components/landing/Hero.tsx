import Link from "next/link";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { HeroTerminal } from "@/components/landing/mockups";

export function Hero() {
  return (
    <Section size="wide" className="relative overflow-hidden pb-28 pt-36 lg:pb-36 lg:pt-44">
      <div className="relative grid items-center gap-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14">
        <div className="relative pl-5 sm:pl-6 lg:pl-0">
          <div
            className="pointer-events-none absolute left-0 top-2 bottom-8 w-px bg-gradient-to-b from-[oklch(0.55_0.14_250/0.45)] via-white/[0.12] to-transparent sm:left-1"
            aria-hidden
          />
          <Reveal>
            <p className="inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.55_0.2_250)] opacity-40" />
                <span className="relative inline-flex size-2 rounded-full bg-[oklch(0.65_0.16_250)]" />
              </span>
              Performance review · by design
            </p>
          </Reveal>

          <Reveal delay={0.04} className="mt-8">
            <h1 className="font-display max-w-[20ch] text-[2.7rem] font-medium leading-[1.04] tracking-[-0.02em] text-zinc-50 sm:text-5xl lg:text-[3.45rem]">
              Your tape already tells the truth.{" "}
              <span className="text-gradient-electric">Blueveno makes you read it.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 max-w-xl">
            <p className="text-lg leading-[1.68] text-zinc-400 sm:text-xl">
              A trading journal and performance platform for operators who refuse to confuse motion
              with edge. Raw execution becomes structured review—so discipline shows up in the data,
              and patterns in your history stop hiding in plain sight.
            </p>
          </Reveal>

          <Reveal delay={0.14} className="mt-12 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[oklch(0.72_0.14_250)] px-8 py-3 text-sm font-semibold text-[oklch(0.12_0.04_265)] shadow-[0_0_0_1px_oklch(1_0_0_/0.12),0_0_72px_-18px_oklch(0.52_0.2_250/0.55)] transition duration-300 hover:bg-[oklch(0.78_0.12_250)] hover:shadow-[0_0_0_1px_oklch(1_0_0_/0.18),0_0_88px_-14px_oklch(0.55_0.22_250/0.45)]"
            >
              Open workspace
            </Link>
            <Link
              href="#platform"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.02] px-8 py-3 text-sm font-medium text-zinc-300 backdrop-blur-sm transition duration-300 hover:border-white/[0.18] hover:bg-white/[0.05] hover:text-zinc-100"
            >
              View the platform
            </Link>
          </Reveal>

          <Reveal delay={0.18} className="mt-14 flex flex-wrap gap-x-10 gap-y-2 border-t border-white/[0.07] pt-10">
            <p className="max-w-sm font-mono text-[11px] leading-relaxed text-zinc-500">
              Serious journaling is a competitive advantage—when it is systematic, attributable, and
              built on what actually printed.
            </p>
            <div className="flex flex-wrap gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
              <span>Truth over hope</span>
              <span className="text-zinc-800">·</span>
              <span>Review as infrastructure</span>
              <span className="text-zinc-800">·</span>
              <span>Data-native</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="relative">
          <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2.75rem] bg-[radial-gradient(ellipse_at_center,oklch(0.45_0.15_250/0.14),transparent_68%)] blur-3xl" />
          <div className="pointer-events-none absolute -inset-1 -z-10 rounded-[2rem] bg-gradient-to-br from-[oklch(0.5_0.15_250/0.1)] via-transparent to-[oklch(0.4_0.1_270/0.07)] opacity-90" />
          <HeroTerminal />
        </Reveal>
      </div>
    </Section>
  );
}
