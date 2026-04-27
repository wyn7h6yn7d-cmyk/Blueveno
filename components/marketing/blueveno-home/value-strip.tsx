/** Single breath between hero and calendar — not a second headline. */
export function ValueStrip() {
  return (
    <section
      id="essence"
      className="scroll-mt-28 relative border-b border-white/[0.06] sm:scroll-mt-32"
      aria-labelledby="strip-heading"
    >
      <h2 id="strip-heading" className="sr-only">
        Product essence
      </h2>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,oklch(0.14_0.06_262/0.3)_0%,transparent_58%)]" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 py-6 sm:px-8 sm:py-7 lg:px-10">
        <div className="grid grid-cols-1 gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2.5 min-[520px]:grid-cols-3 sm:gap-3 sm:p-3">
          {["Log the day", "Linked chart", "Behavior review"].map((item) => (
            <div
              key={item}
              className="flex min-h-[2.7rem] items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-300 sm:text-[11px]">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
