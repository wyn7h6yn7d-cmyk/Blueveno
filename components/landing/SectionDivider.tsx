/**
 * Cinematic section break — dual read + cobalt bead (institutional pacing).
 */
export function SectionDivider() {
  return (
    <div className="relative w-full px-6 py-14 sm:py-16 lg:py-20" aria-hidden>
      <div className="mx-auto max-w-5xl">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-90" />
        <div className="relative -mt-px h-px w-full bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        <div className="relative -mt-[6px] flex justify-center">
          <div
            className="size-3 rounded-full border border-primary/45 bg-bv-void shadow-[0_0_28px_-2px_oklch(0.52_0.14_252/0.42),inset_0_1px_0_0_oklch(1_0_0_/0.12)] ring-1 ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}
