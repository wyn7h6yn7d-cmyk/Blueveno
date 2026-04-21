import Link from "next/link";
import { formatEur, PRICING_EUR, effectiveMonthlyFromYearlyEur, yearlySavingsPercentApprox } from "@/lib/marketing/pricing-copy";
import { PremiumPrimaryLink } from "./premium-button";

const bullets = [
  "Daily journal & P&L",
  "Calendar with weekly totals",
  "Notes & TradingView link per day",
];

export function HomePricingSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-28 border-t border-[oklch(0.52_0.12_252/0.18)] py-24 sm:scroll-mt-32 sm:py-32 lg:py-36"
      aria-labelledby="home-pricing-heading"
    >
      <div className="mx-auto max-w-[720px] px-4 sm:px-8">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.38em] text-[oklch(0.58_0.11_252)]">Pricing</p>
        <h2
          id="home-pricing-heading"
          className="font-display mt-6 text-center text-[clamp(1.85rem,5vw,2.65rem)] font-bold leading-[1.05] tracking-[-0.045em] text-zinc-50"
        >
          One plan. Full surface.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-[15px] leading-relaxed tracking-[-0.018em] text-zinc-500">
          {PRICING_EUR.trialDays}-day full trial, then monthly or yearly. After trial, stay Premium to keep logging — or stay read-only on past data.
        </p>

        <div className="relative mt-14 overflow-hidden rounded-2xl border border-[oklch(0.48_0.13_252/0.35)] bg-[linear-gradient(168deg,oklch(0.11_0.045_262/0.92)_0%,oklch(0.055_0.042_272/0.96)_100%)] px-8 py-12 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05),0_40px_100px_-48px_rgba(0,0,0,0.85)] sm:px-12 sm:py-14">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.2]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.52_0.12_252/0.12) 1px, transparent 1px), linear-gradient(90deg, oklch(0.52_0.12_252/0.12) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
            aria-hidden
          />
          <div className="relative text-center">
            <p className="font-display text-lg tracking-[-0.02em] text-zinc-100">Blueveno</p>
            <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[clamp(2.25rem,7vw,3rem)] tabular-nums tracking-[-0.04em] text-zinc-50">
                  {formatEur(PRICING_EUR.monthly)}
                </span>
                <span className="text-[15px] text-zinc-500">/ month</span>
              </div>
              <div className="hidden h-10 w-px bg-white/[0.08] sm:block" aria-hidden />
              <div className="text-center sm:text-left">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Yearly</p>
                <div className="mt-1 flex flex-wrap items-baseline justify-center gap-2 sm:justify-start">
                  <span className="font-display text-[clamp(1.85rem,5vw,2.35rem)] tabular-nums tracking-[-0.04em] text-zinc-50">
                    {formatEur(PRICING_EUR.yearly)}
                  </span>
                  <span className="text-[15px] text-zinc-500">/ year</span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-200/90">
                    ~{yearlySavingsPercentApprox()}% vs 12× monthly
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-zinc-500">
                  ≈ {formatEur(effectiveMonthlyFromYearlyEur())} / mo paid annually
                </p>
              </div>
            </div>
            <ul className="mx-auto mt-10 max-w-sm space-y-3.5 border-t border-white/[0.07] pt-10 text-left">
              {bullets.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-snug text-zinc-300">
                  <span
                    className="mt-2 size-1 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)] ring-4 ring-[oklch(0.58_0.12_252/0.12)]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <PremiumPrimaryLink href="/signup">Create account</PremiumPrimaryLink>
              <Link
                href="/pricing"
                className="inline-flex min-h-[44px] items-center justify-center text-[13px] font-medium tracking-[-0.01em] text-zinc-500 underline-offset-4 transition hover:text-zinc-300 hover:underline"
              >
                Full plan details
              </Link>
            </div>
            <p className="mt-6 font-mono text-[11px] text-zinc-600">Cancel anytime · Billed in EUR</p>
          </div>
        </div>
      </div>
    </section>
  );
}
