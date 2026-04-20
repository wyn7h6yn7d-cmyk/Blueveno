import type { ReactNode } from "react";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

/**
 * Shared cinematic depth stack for marketing routes — matches design system layering.
 */
export function MarketingBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-full overflow-x-hidden bg-bv-void">
      <div className="pointer-events-none fixed inset-0 -z-40 bg-bv-void" aria-hidden />
      {/* Side key lights — depth without carnival color */}
      <div className="pointer-events-none fixed inset-0 -z-[39] bg-bv-cinematic-left opacity-[0.85]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[38] bg-bv-cinematic-right opacity-[0.75]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[37] bg-bv-cinematic-horizon opacity-[0.9]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-36 bg-marketing-rim opacity-[0.98]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-35 bg-hero-spotlight opacity-[0.82]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-34 bg-marketing-floor opacity-[0.78]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-33 bg-vignette" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[6] bg-grid opacity-[0.22]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[5] bg-grid-fine opacity-[0.14]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[4] bg-scanlines opacity-[0.32]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[3] bg-noise opacity-[0.2]" aria-hidden />
      {children}
      <ScrollToTop />
    </div>
  );
}
