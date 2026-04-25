import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { MarketingBackground } from "@/components/landing/MarketingBackground";
import { PricingComparison } from "@/components/marketing/pricing-comparison";
import {
  COMPARISON_ROWS,
  PRICING_EUR,
  effectiveMonthlyFromYearlyEur,
  formatEur,
  yearlySavingsPercentApprox,
} from "@/lib/marketing/pricing-copy";

export const metadata: Metadata = {
  title: "Pricing",
  description: `Blueveno — ${PRICING_EUR.trialDays}-day trial, then ${formatEur(PRICING_EUR.monthly)}/mo or ${formatEur(PRICING_EUR.yearly)}/yr. Journal, calendar, and stats for serious traders.`,
};

const premiumFeatures = [
  "Unlimited new trading days & edits",
  "Notes and a saved chart link per day",
  "Daily P&L and calendar with weekly totals",
  "Stats and overview for your history",
];

export default function PricingPage() {
  const effMo = effectiveMonthlyFromYearlyEur();
  const savePct = yearlySavingsPercentApprox();

  return (
    <MarketingBackground>
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-5 pb-28 pt-[calc(5.5rem+1.5rem)] sm:px-8 lg:pb-36 lg:pt-[calc(5.5rem+2.5rem)]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.66_0.08_252)]">Pricing</p>
          <h1 className="font-display mt-5 text-[2.15rem] font-medium leading-[1.08] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.65rem]">
            One premium. Trial first.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-zinc-400 md:text-base">
            Every account starts with a <strong className="font-medium text-zinc-300">{PRICING_EUR.trialDays}-day trial</strong> with full
            access. After that, stay on Premium to keep logging — or keep read-only access to what you already built.
          </p>
        </div>

        {/* Monthly vs yearly */}
        <div className="mx-auto mt-14 grid max-w-3xl gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.09] bg-[linear-gradient(165deg,oklch(0.13_0.04_262)_0%,oklch(0.078_0.032_266)_48%,oklch(0.058_0.035_268)_100%)] p-8 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Monthly</p>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display text-4xl tabular-nums tracking-[-0.03em] text-zinc-50 sm:text-5xl">{formatEur(PRICING_EUR.monthly)}</span>
              <span className="text-[15px] text-zinc-500">/ month</span>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-zinc-500">Billed monthly. Cancel anytime.</p>
          </div>

          <div className="relative overflow-hidden rounded-[1.25rem] border border-[oklch(0.55_0.12_252/0.35)] bg-[linear-gradient(165deg,oklch(0.14_0.045_262/0.55)_0%,oklch(0.09_0.038_266)_100%)] p-8 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)]">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[oklch(0.72_0.1_252)]">Yearly</p>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-emerald-200">
                Save ~{savePct}%
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display text-4xl tabular-nums tracking-[-0.03em] text-zinc-50 sm:text-5xl">{formatEur(PRICING_EUR.yearly)}</span>
              <span className="text-[15px] text-zinc-500">/ year</span>
            </div>
            <p className="mt-2 text-[14px] text-zinc-400">
              ≈ {formatEur(effMo)} / month <span className="text-zinc-500">when paid annually</span>
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-zinc-500">One invoice per year. Cancel before renewal if you prefer not to continue.</p>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[13px] leading-relaxed text-zinc-500">
          Checkout is rolling out; your trial and access stay the same. Prices in EUR. Stripe price IDs can be wired when billing goes live.
        </p>

        {/* What premium includes */}
        <div className="mx-auto mt-16 max-w-xl">
          <h2 className="text-center font-display text-xl font-medium tracking-[-0.02em] text-zinc-50 sm:text-2xl">What Premium includes</h2>
          <ul className="relative mt-8 space-y-3.5 border-t border-white/[0.07] pt-8 text-left">
            {premiumFeatures.map((item) => (
              <li key={item} className="flex gap-3 text-[15px] leading-snug text-zinc-300">
                <span
                  className="mt-2 size-1 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.85)] ring-4 ring-[oklch(0.58_0.12_252/0.12)]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* If you don&apos;t upgrade */}
        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
          <h2 className="font-display text-lg font-medium tracking-[-0.02em] text-zinc-100 sm:text-xl">
            If you don&apos;t upgrade after the trial
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
            Your workspace becomes <strong className="font-medium text-zinc-300">read-only</strong>. You can still open the app, browse your
            calendar, and review past days and stats — but you <strong className="font-medium text-zinc-300">won&apos;t be able to add new days</strong>{" "}
            or edit existing entries until you subscribe. Nothing is deleted; upgrading restores full logging.
          </p>
        </div>

        {/* Comparison table */}
        <div className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-center font-display text-xl font-medium tracking-[-0.02em] text-zinc-50 sm:text-2xl">Comparison</h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-[14px] text-zinc-500">
            Trial ({PRICING_EUR.trialDays} days) · Premium (monthly or yearly) · After trial without Premium
          </p>
          <div className="mt-8">
            <PricingComparison rows={COMPARISON_ROWS} />
          </div>
        </div>

        <div className="mx-auto mt-14 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full bg-[oklch(0.64_0.125_252)] px-6 text-sm font-semibold text-[oklch(0.09_0.04_268)] shadow-bv-primary transition hover:bg-[oklch(0.7_0.11_252)]"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] px-6 text-sm font-medium text-zinc-200 transition hover:border-white/[0.18] hover:bg-white/[0.06]"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-8 text-center font-mono text-[11px] text-zinc-500">Cancel anytime · Billed in EUR</p>

        <p className="mt-16 text-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </MarketingBackground>
  );
}
