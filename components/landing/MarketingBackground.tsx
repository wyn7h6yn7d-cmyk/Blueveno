import type { ReactNode } from "react";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

/**
 * Shared cinematic depth stack for marketing routes — matches design system layering.
 */
export function MarketingBackground({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-full overflow-x-hidden bg-bv-void">
      <div className="pointer-events-none fixed inset-0 -z-40 bg-bv-void" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-39 bg-marketing-rim opacity-95" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-38 bg-hero-spotlight opacity-[0.72]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-37 bg-marketing-floor opacity-[0.68]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-36 bg-vignette" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[5] bg-grid opacity-[0.18]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[4] bg-grid-fine opacity-[0.1]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[3] bg-scanlines opacity-[0.28]" aria-hidden />
      <div className="pointer-events-none fixed inset-0 -z-[2] bg-noise opacity-[0.18]" aria-hidden />
      {children}
      <ScrollToTop />
    </div>
  );
}
