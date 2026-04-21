export function ValueStrip() {
  return (
    <section
      id="strip"
      className="scroll-mt-28 border-t border-[oklch(0.52_0.12_252/0.15)] py-10 sm:scroll-mt-32 sm:py-12"
      aria-labelledby="strip-heading"
    >
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <h2 id="strip-heading" className="sr-only">
          Product essence
        </h2>
        <p className="font-display text-[clamp(1.15rem,2.8vw,1.45rem)] font-medium tracking-[-0.04em] text-zinc-200">
          Day · Chart · Month — <span className="text-zinc-500">one cold ledger.</span>
        </p>
      </div>
    </section>
  );
}
