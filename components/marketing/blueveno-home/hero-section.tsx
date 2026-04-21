import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";

/**
 * Product reveal: editorial type + full-width readout strip — not a card collage.
 */
export function HeroSection() {
  return (
    <section
      className="relative overflow-hidden pt-[calc(4.5rem+env(safe-area-inset-top))] pb-6 sm:pb-10"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-[calc(4rem+env(safe-area-inset-top))] h-px max-w-7xl bg-gradient-to-r from-transparent via-[oklch(0.55_0.14_252/0.4)] to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-[oklch(0.55_0.12_252)]">Trading journal</p>
            <h1
              id="hero-heading"
              className="font-display mt-10 text-left text-[clamp(3.15rem,11vw,6rem)] font-bold leading-[0.88] tracking-[-0.062em] text-zinc-50"
            >
              Clarity
              <br />
              at the{" "}
              <span className="text-gradient-cobalt [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">close.</span>
            </h1>
            <p className="mt-9 max-w-[35ch] text-left text-[15px] leading-[1.55] tracking-[-0.02em] text-zinc-500">
              Your session, your chart, your numbers — one disciplined surface.
            </p>
            <div className="mt-11 flex flex-wrap gap-4">
              <PremiumPrimaryLink href="/signup">Open Blueveno</PremiumPrimaryLink>
              <PremiumGhostLink href="/app">Enter workspace</PremiumGhostLink>
            </div>
          </div>

          <div className="relative mt-14 hidden lg:col-span-5 lg:mt-0 lg:flex lg:justify-end lg:pb-2">
            <div
              className="h-[min(22rem,40vh)] w-px bg-gradient-to-b from-transparent via-[oklch(0.55_0.14_252/0.45)] to-transparent"
              aria-hidden
            />
            <div className="absolute bottom-0 right-0 max-w-[14ch] text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.28em] text-zinc-600">
              Journal · note · link · calendar
            </div>
          </div>
        </div>
      </div>

      {/* Readout strip: exchange-tape energy — flat, full width, no rounded card UI */}
      <div className="relative mt-20 w-full border-y border-white/[0.09] bg-[linear-gradient(90deg,oklch(0.04_0.04_272/0.85)_0%,oklch(0.065_0.045_262/0.65)_50%,oklch(0.04_0.04_272/0.85)_100%)] sm:mt-24">
        <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.18]" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.55_0.14_252/0.35)] to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between sm:gap-8 lg:items-center">
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-zinc-500">Session</span>
              <span className="font-mono text-sm tabular-nums tracking-[0.08em] text-zinc-400">24 APR</span>
            </div>

            <p className="font-display shrink-0 text-[clamp(3.25rem,12vw,5.5rem)] font-bold leading-none tracking-[-0.055em] text-emerald-200">
              +$180
            </p>

            <div className="min-w-0 sm:max-w-[min(100%,22rem)] sm:border-l sm:border-white/[0.08] sm:pl-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">TradingView</p>
              <p className="mt-2 truncate font-mono text-[13px] tracking-[-0.02em] text-[oklch(0.82_0.09_250)]">
                tradingview.com/chart · NQ1!
              </p>
            </div>
          </div>

          <p className="mt-10 max-w-xl border-l-2 border-[oklch(0.52_0.14_252/0.55)] pl-5 text-[14px] leading-[1.7] tracking-[-0.01em] text-zinc-500">
            Opening drive only. Size held. No revenge after the flush.
          </p>
        </div>
      </div>
    </section>
  );
}
