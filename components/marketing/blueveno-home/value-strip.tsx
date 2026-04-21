/** Single breath between hero and calendar — not a second headline. */
export function ValueStrip() {
  return (
    <section
      id="strip"
      className="scroll-mt-28 relative border-b border-white/[0.06] sm:scroll-mt-32"
      aria-labelledby="strip-heading"
    >
      <h2 id="strip-heading" className="sr-only">
        Product essence
      </h2>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.14_0.06_262/0.35)_0%,transparent_58%)]" aria-hidden />
      <div className="relative mx-auto max-w-[1100px] px-5 py-10 sm:px-10 sm:py-12">
        <div className="flex items-start gap-6 sm:items-center sm:gap-10">
          <div
            className="mt-1 hidden h-12 w-px shrink-0 bg-gradient-to-b from-[oklch(0.55_0.14_252/0.85)] via-[oklch(0.5_0.12_252/0.35)] to-transparent sm:block sm:h-14"
            aria-hidden
          />
          <p className="font-display text-[clamp(1.15rem,2.5vw,1.4rem)] font-medium leading-[1.25] tracking-[-0.045em] text-zinc-300">
            P&amp;L · notes · charts — <span className="text-zinc-500">one ledger.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
