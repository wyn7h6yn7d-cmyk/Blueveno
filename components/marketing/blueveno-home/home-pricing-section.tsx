import { formatEur, PRICING_EUR } from "@/lib/marketing/pricing-copy";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";

export function HomePricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-28 relative border-t border-white/[0.06] py-16 sm:scroll-mt-32 sm:py-20 lg:py-28"
      aria-labelledby="home-pricing-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.13_252/0.35)] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[oklch(0.62_0.12_252)]">Pricing</p>
        <h2
          id="home-pricing-heading"
          className="font-display mt-5 text-center text-[clamp(2rem,4.5vw,2.85rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-zinc-50"
        >
          Start your {PRICING_EUR.trialDays}-day trial.
        </h2>
        <p className="mx-auto mt-5 max-w-[34rem] text-center text-[14px] leading-[1.65] tracking-[-0.018em] text-zinc-400">
          {PRICING_EUR.trialDays}-day free trial. After trial, workspace stays read-only until upgrade. Premium unlocks ongoing journaling.
        </p>

        <div className="relative mx-auto mt-12 max-w-[760px] overflow-hidden rounded-[1.75rem] border border-[oklch(0.5_0.13_252/0.42)] bg-[linear-gradient(168deg,oklch(0.11_0.045_262/0.96)_0%,oklch(0.048_0.04_272/0.99)_100%)] px-7 py-12 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06),0_48px_120px_-56px_rgba(0,0,0,0.88)] sm:px-11 sm:py-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.12_252/0.25)] to-transparent" aria-hidden />

          <div className="relative text-center">
            <div className="mx-auto max-w-md">
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">Premium</p>
              <div className="mt-2 flex items-baseline justify-center gap-1.5">
                <span className="font-display text-[clamp(2.5rem,6.2vw,3.3rem)] tabular-nums tracking-[-0.05em] text-zinc-50">
                  {formatEur(PRICING_EUR.monthly)}
                </span>
                <span className="text-[15px] text-zinc-500">/ month</span>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-zinc-500">
                One selected price. Journal, calendar, stats.
              </p>
            </div>

            <p className="mx-auto mt-10 max-w-sm border-t border-white/[0.06] pt-10 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Journal · P&amp;L · Calendar · Chart
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="#calendar">See the calendar</PremiumGhostLink>
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              7-day free trial · then read-only until upgrade
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
