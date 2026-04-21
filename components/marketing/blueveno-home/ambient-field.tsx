"use client";

/**
 * Blueveno marketing atmosphere: coordinate-grid drift, parallax plates,
 * hairline motion, soft scan — structural motion, not glow blobs.
 */
export function AmbientField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 isolate -z-10 overflow-hidden [contain:strict]"
      aria-hidden
    >
      {/* Midnight foundation */}
      <div className="absolute inset-0 bg-[linear-gradient(168deg,oklch(0.048_0.04_268)_0%,oklch(0.032_0.044_272)_42%,oklch(0.026_0.048_276)_100%)]" />

      {/* Parallax depth — slow transform only, fixed luminance (no “breathing” fog) */}
      <div className="bv-home-atmo-parallax-a absolute inset-[-12%] bg-[radial-gradient(ellipse_72%_56%_at_18%_14%,oklch(0.14_0.065_258/0.22),transparent_58%)]" />
      <div className="bv-home-atmo-parallax-b absolute inset-[-8%] bg-[radial-gradient(ellipse_68%_48%_at_88%_72%,oklch(0.11_0.055_262/0.16),transparent_62%)]" />

      {/* Primary coordinate field */}
      <div className="bv-home-atmo-grid absolute inset-0 opacity-[0.55]" />
      {/* Finer phase-offset grid — subtle moiré / depth */}
      <div className="bv-home-atmo-grid-fine absolute inset-0 opacity-[0.38]" />

      {/* Hairline drift: horizontal emphasis */}
      <div className="bv-home-atmo-h-lines absolute inset-0 opacity-[0.065]" />
      {/* Hairline drift: vertical emphasis */}
      <div className="bv-home-atmo-v-lines absolute inset-0 opacity-[0.058]" />

      {/* Slow market-pulse texture (diagonal micro-bands) */}
      <div className="bv-home-atmo-pulse absolute inset-0 opacity-[0.045]" />

      {/* Soft scanning luminance — single cold band */}
      <div className="absolute inset-0 overflow-hidden mask-[linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="bv-home-atmo-scan absolute -left-[35%] top-[-5%] h-[110%] w-[38%]" />
      </div>

      {/* Static meridian hairline — structure, not pulse */}
      <div className="absolute inset-y-[8%] left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[oklch(0.52_0.12_252/0.07)] to-transparent" />

      {/* Floor anchor — static */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_96%_52%_at_50%_108%,oklch(0.2_0.09_258/0.2),transparent_68%)]" />

      {/* Film grain — very light */}
      <div className="bg-noise absolute inset-0 opacity-[0.11] motion-reduce:opacity-0" />

      {/* Edge falloff */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 120px 56px oklch(0.02 0.045 270 / 0.78)",
        }}
      />
    </div>
  );
}
