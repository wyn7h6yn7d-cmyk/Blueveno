export function ValueStrip() {
  return (
    <section
      id="strip"
      className="scroll-mt-28 border-t border-[oklch(0.52_0.12_252/0.15)] py-12 sm:scroll-mt-32 sm:py-14"
      aria-labelledby="strip-heading"
    >
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <h2 id="strip-heading" className="sr-only">
          Product essence
        </h2>
        <p className="font-display text-[clamp(1.2rem,3vw,1.5rem)] font-medium tracking-[-0.04em] leading-snug text-zinc-200">
          Day · chart · numbers — <span className="text-zinc-500">one ledger. One review.</span>
        </p>
      </div>
    </section>
  );
}
