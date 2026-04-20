/**
 * Strong section break — cobalt line + center bead (scan rhythm).
 */
export function SectionDivider() {
  return (
    <div className="relative w-full px-6 py-10 sm:py-12 lg:py-14" aria-hidden>
      <div className="mx-auto max-w-5xl">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-bv-border-accent to-transparent" />
        <div className="relative -mt-[5px] flex justify-center">
          <div className="size-2.5 rounded-full border border-primary/35 bg-bv-void shadow-bv-divider-bead" />
        </div>
      </div>
    </div>
  );
}
