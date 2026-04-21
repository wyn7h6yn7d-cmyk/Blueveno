"use client";

/**
 * Marketing backdrop: midnight navy, cobalt structure, slow drift.
 * Layers: base grid, fine grid, coordinate lines, CSS 3D perspective floor (2 planes),
 * parallax plates, scan band. No WebGL — transforms only for low CPU/GPU cost.
 */
export function AmbientField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 isolate -z-10 overflow-hidden [contain:strict]"
      aria-hidden
    >
      {/* Base — deep midnight */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.048_0.048_268)_0%,oklch(0.03_0.052_274)_48%,oklch(0.022_0.055_278)_100%)]" />

      {/* Structural depth — linear plates only */}
      <div
        className="bv-home-atmo-parallax-a absolute inset-[-8%] opacity-[0.55]"
        style={{
          background:
            "linear-gradient(148deg, oklch(0.12 0.08 258 / 0.14) 0%, transparent 46%), linear-gradient(218deg, transparent 42%, oklch(0.07 0.06 262 / 0.1) 100%)",
        }}
      />
      <div
        className="bv-home-atmo-parallax-b absolute inset-[-6%] opacity-[0.48]"
        style={{
          background:
            "linear-gradient(28deg, transparent 0%, oklch(0.1 0.07 260 / 0.1) 52%, transparent 100%), linear-gradient(192deg, oklch(0.065 0.055 268 / 0.12) 0%, transparent 48%)",
        }}
      />

      {/* Primary + fine grids — market surface */}
      <div className="bv-home-atmo-grid absolute inset-0 opacity-[0.5]" />
      <div className="bv-home-atmo-grid-fine absolute inset-0 opacity-[0.28]" />

      {/* Coordinate lines — slow drift */}
      <div className="bv-home-atmo-h-lines absolute inset-0 opacity-[0.22]" />
      <div className="bv-home-atmo-v-lines absolute inset-0 opacity-[0.18]" />

      {/* Cold pulse texture — diagonal micro-rhythm */}
      <div className="bv-home-atmo-pulse absolute inset-0 opacity-[0.14]" />

      {/* CSS 3D depth — two perspective grids (GPU transforms only, no WebGL) */}
      <div className="bv-home-atmo-3d-wrap absolute inset-0 overflow-hidden">
        <div className="bv-home-atmo-3d-stage">
          <div className="bv-home-atmo-3d-plane bv-home-atmo-3d-plane-far" />
          <div className="bv-home-atmo-3d-plane bv-home-atmo-3d-plane-near" />
        </div>
      </div>

      {/* Meridian anchor */}
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 max-lg:hidden bg-gradient-to-b from-transparent via-[oklch(0.52_0.13_252/0.22)] to-transparent opacity-80" />

      {/* Scan band — single restrained sweep */}
      <div className="absolute inset-0 overflow-hidden mask-[linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="bv-home-atmo-scan absolute -left-[30%] top-0 h-full w-[38%]" />
      </div>

      {/* Floor */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[oklch(0.016_0.045_274/0.94)] to-transparent" />

      {/* Film grain */}
      <div className="bg-noise absolute inset-0 opacity-[0.085] motion-reduce:opacity-0" />

      {/* Edge vignette */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 140px 56px oklch(0.018 0.048 274 / 0.78)",
        }}
      />
    </div>
  );
}
