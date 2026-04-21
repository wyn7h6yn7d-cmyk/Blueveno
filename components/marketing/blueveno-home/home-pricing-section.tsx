import Link from "next/link";
import { formatEur, PRICING_EUR, effectiveMonthlyFromYearlyEur, yearlySavingsPercentApprox } from "@/lib/marketing/pricing-copy";
import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";

export function HomePricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-28 relative border-t border-white/[0.06] py-28 sm:scroll-mt-32 sm:py-32 lg:py-40"
      aria-labelledby="home-pricing-heading"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.13_252/0.35)] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[640px] px-5 sm:px-8">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.4em] text-[oklch(0.62_0.12_252)]">Pricing</p>
        <h2
          id="home-pricing-heading"
          className="font-display mt-5 text-center text-[clamp(2rem,4.5vw,2.85rem)] font-semibold leading-[1.05] tracking-[-0.05em] text-zinc-50"
        >
          One plan.
        </h2>
        <p className="mx-auto mt-5 max-w-[26rem] text-center text-[14px] leading-[1.6] tracking-[-0.018em] text-zinc-500">
          {PRICING_EUR.trialDays}-day trial, then Premium. Cancel anytime.
        </p>

        <div className="relative mt-12 overflow-hidden rounded-[1.75rem] border border-[oklch(0.5_0.13_252/0.42)] bg-[linear-gradient(168deg,oklch(0.11_0.045_262/0.96)_0%,oklch(0.048_0.04_272/0.99)_100%)] px-7 py-12 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06),0_48px_120px_-56px_rgba(0,0,0,0.88)] sm:px-11 sm:py-14">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.42_0.12_252/0.14),transparent_68%)]"
            aria-hidden
          />

          <div className="relative text-center">
            <div className="flex flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-14">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">Monthly</p>
                <div className="mt-2 flex items-baseline justify-center gap-1.5">
                  <span className="font-display text-[clamp(2.35rem,6vw,3rem)] tabular-nums tracking-[-0.045em] text-zinc-50">
                    {formatEur(PRICING_EUR.monthly)}
                  </span>
                  <span className="text-[14px] text-zinc-500">/ mo</span>
                </div>
              </div>
              <div className="hidden h-16 w-px bg-gradient-to-b from-transparent via-white/[0.1] to-transparent sm:block" aria-hidden />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600">Yearly</p>
                <div className="mt-2 flex flex-wrap items-baseline justify-center gap-2">
                  <span className="font-display text-[clamp(1.95rem,4.5vw,2.5rem)] tabular-nums tracking-[-0.04em] text-zinc-50">
                    {formatEur(PRICING_EUR.yearly)}
                  </span>
                  <span className="text-[14px] text-zinc-500">/ yr</span>
                  <span className="rounded-full border border-emerald-400/15 bg-emerald-500/[0.08] px-2 py-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-emerald-200/90">
                    ~{yearlySavingsPercentApprox()}% off
                  </span>
                </div>
                <p className="mt-2 font-mono text-[11px] text-zinc-600">
                  ≈ {formatEur(effectiveMonthlyFromYearlyEur())} / mo billed yearly
                </p>
              </div>
            </div>

            <p className="mx-auto mt-10 max-w-sm border-t border-white/[0.06] pt-10 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Journal · P&amp;L · Calendar · Chart
            </p>

            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <PremiumPrimaryLink href="/signup">Start free</PremiumPrimaryLink>
              <PremiumGhostLink href="/pricing">Details</PremiumGhostLink>
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">EUR · Cancel anytime</p>
          </div>
        </div>

        <p className="mt-8 text-center">
          <Link
            href="/pricing"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600 transition hover:text-zinc-400"
          >
            Full terms →
          </Link>
        </p>
      </div>
    </section>
  );
}
