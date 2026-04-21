import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { MarketingBackground } from "@/components/landing/MarketingBackground";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One plan for journaling, review, and performance tracking. Simple pricing for serious traders.",
};

const features = [
  "Daily trading journal",
  "Calendar view with P&L",
  "Weekly totals",
  "Notes and TradingView links",
  "Clean performance workspace",
];

export default function PricingPage() {
  return (
    <MarketingBackground>
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-5 pb-28 pt-[calc(5.5rem+1.5rem)] sm:px-8 lg:pb-36 lg:pt-[calc(5.5rem+2.5rem)]">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.66_0.08_252)]">Pricing</p>
          <h1 className="font-display mt-5 text-[2.15rem] font-medium leading-[1.08] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.65rem]">
            Simple pricing for serious traders
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-zinc-400 md:text-base">
            One clean plan for journaling, review, and performance tracking.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-md">
          <div className="shadow-bv-showcase relative overflow-hidden rounded-[1.25rem] border border-white/[0.09] bg-[linear-gradient(165deg,oklch(0.13_0.04_262)_0%,oklch(0.078_0.032_266)_48%,oklch(0.058_0.035_268)_100%)] p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.3]" aria-hidden />
            <div
              className="pointer-events-none absolute -right-16 top-0 size-[280px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.42_0.11_252/0.2),transparent_68%)]"
              aria-hidden
            />

            <div className="relative text-center">
              <p className="font-display text-xl tracking-[-0.02em] text-zinc-100">Blueveno</p>
              <div className="mt-6 flex items-baseline justify-center gap-1.5">
                <span className="font-display text-4xl tabular-nums tracking-[-0.03em] text-zinc-50 sm:text-5xl">
                  €5.99
                </span>
                <span className="text-[15px] text-zinc-500">/ month</span>
              </div>
            </div>

            <ul className="relative mt-10 space-y-3.5 border-t border-white/[0.07] pt-9 text-left">
              {features.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-snug text-zinc-300">
                  <span
                    className="mt-2 size-1 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.85)] ring-4 ring-[oklch(0.58_0.12_252/0.12)]"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="relative mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
            <p className="relative mt-6 text-center font-mono text-[11px] text-zinc-500">
              Cancel anytime. Billed in EUR.
            </p>
          </div>
        </div>

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
