import { PremiumGhostLink, PremiumPrimaryLink } from "./premium-button";

export function HeroSection() {
  return (
    <section
      className="relative min-h-[min(96vh,940px)] pt-[calc(4.35rem+env(safe-area-inset-top))] sm:min-h-[min(100vh,980px)] sm:pt-[calc(4.75rem+env(safe-area-inset-top))]"
      aria-labelledby="hero-heading"
    >
      {/* Film frame — top hairline */}
      <div
        className="pointer-events-none absolute left-4 right-4 top-[calc(3.85rem+env(safe-area-inset-top))] h-px max-w-7xl bg-gradient-to-r from-transparent via-white/[0.14] to-transparent sm:left-8 sm:right-8 lg:left-[max(2rem,calc(50%-40rem))] lg:right-[max(2rem,calc(50%-40rem))]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-start gap-14 px-4 pb-10 sm:gap-16 sm:px-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1.12fr)] lg:gap-20 lg:pb-14">
        {/* Copy — left column, editorial rag */}
        <div className="max-lg:text-center lg:pb-4 lg:text-left">
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[oklch(0.55_0.12_252/0.55)] max-lg:hidden" aria-hidden />
            <p className="font-mono text-[10px] uppercase tracking-[0.38em] text-[oklch(0.62_0.1_252)]">Trading journal</p>
          </div>
          <h1
            id="hero-heading"
            className="font-display mt-8 max-w-[15ch] text-[clamp(2.85rem,7.2vw,4.65rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-zinc-50 max-lg:mx-auto lg:mt-10 lg:max-w-[13ch]"
          >
            Clarity at the{" "}
            <span className="text-gradient-cobalt [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">
              close.
            </span>
          </h1>
          <p className="mx-auto mt-7 max-w-[38ch] text-[15px] leading-[1.65] text-zinc-500 max-lg:mx-auto lg:mx-0 lg:text-[16px]">
            Your session, your chart, your numbers — composed in one disciplined surface.
          </p>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-3 lg:justify-start lg:gap-4">
            <PremiumPrimaryLink href="/signup">Open Blueveno</PremiumPrimaryLink>
            <PremiumGhostLink href="/app">Enter workspace</PremiumGhostLink>
          </div>
        </div>

        {/* Product slab — sculpted, stage-lit */}
        <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:mt-10 lg:max-w-none">
          <div className="[perspective:1400px]">
            <div className="relative origin-[50%_100%] max-lg:transform-none lg:[transform:rotateX(4.5deg)] lg:transition-transform lg:duration-700 lg:ease-out">
              <div className="relative rounded-[1.42rem] bg-gradient-to-br from-white/[0.14] via-white/[0.04] to-transparent p-[1px] shadow-bv-showcase">
                <div className="relative overflow-hidden rounded-[1.38rem] border border-white/[0.06] bg-[linear-gradient(172deg,oklch(0.125_0.05_262)_0%,oklch(0.058_0.04_268)_54%,oklch(0.042_0.042_270)_100%)]">
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-0 bg-grid-fine-sharp opacity-[0.22]" aria-hidden />
                <div
                  className="pointer-events-none absolute -right-[20%] -top-[30%] h-[85%] w-[70%] rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.48_0.12_252/0.14),transparent_62%)]"
                  aria-hidden
                />

                <div className="relative border-b border-white/[0.055] px-5 py-3.5 sm:px-7 sm:py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="size-[7px] shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_2px_oklch(0.12_0.05_155/0.45),0_0_16px_oklch(0.65_0.16_155/0.35)]" />
                      <span className="truncate font-mono text-[11px] tracking-[0.14em] text-zinc-500">
                        Session saved
                      </span>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums tracking-tight text-zinc-400">
                      Fri · 24 Apr
                    </span>
                  </div>
                </div>

                <div className="relative grid sm:grid-cols-[1fr_1.08fr] sm:divide-x sm:divide-white/[0.045]">
                  <div className="p-5 sm:p-7 sm:pr-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Day P&amp;L</p>
                    <p className="font-display mt-4 text-[clamp(2.4rem,6.5vw,3.45rem)] font-semibold tabular-nums leading-none tracking-[-0.045em] text-emerald-200">
                      +$180
                    </p>
                    <p className="mt-7 border-l-2 border-emerald-500/35 pl-4 text-[14px] leading-[1.75] text-zinc-400">
                      Opening drive only. Size held. No revenge after the flush.
                    </p>
                  </div>
                  <div className="border-t border-white/[0.045] p-5 sm:border-t-0 sm:p-7 sm:pl-8">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">Chart</p>
                    <div className="mt-4 flex items-center gap-2.5 rounded-[0.4rem] border border-white/[0.08] bg-[linear-gradient(168deg,oklch(0.52_0.12_252/0.09)_0%,oklch(0.08_0.04_268/0.5)_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] transition duration-500 hover:border-[oklch(0.55_0.13_252/0.35)]">
                      <svg
                        className="size-4 shrink-0 text-[oklch(0.74_0.1_250)]"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="truncate font-mono text-[11.5px] text-[oklch(0.82_0.08_250)]">
                        tradingview.com/chart · NQ1!
                      </span>
                    </div>
                    <p className="mt-6 font-mono text-[11px] leading-relaxed text-zinc-500">
                      Link sits with the note. Review stays honest.
                    </p>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
          {/* Base reflection line */}
          <div
            className="pointer-events-none absolute -bottom-6 left-1/2 h-px w-[76%] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/18 to-transparent"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
