/**
 * Optical transition between major marketing sections — gradient hairline, no clutter.
 */
export function SectionDivider() {
  return (
    <div
      className="relative mx-auto max-w-2xl px-6 py-10 sm:py-12 lg:py-14"
      aria-hidden
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
        <div className="h-1 w-24 rounded-full bg-[oklch(0.55_0.14_250/0.12)] blur-md" />
      </div>
    </div>
  );
}
