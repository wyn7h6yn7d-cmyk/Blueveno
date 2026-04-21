"use client";

/**
 * Marketing backdrop: layered midnight navy, cobalt structure, slow CSS motion.
 * Uses globals.css `.bv-home-atmo-*` — grid drift, line motion, pulse texture, scan sweep.
 * No blur fog, particles, or neon — motion is visible but restrained.
 */
export function AmbientField() {
  return (
    <div
      className="pointer-events-none fixed inset-0 isolate -z-10 overflow-hidden [contain:strict]"
      aria-hidden
    >
      {/* Base — midnight navy */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.052_0.046_268)_0%,oklch(0.034_0.05_272)_52%,oklch(0.026_0.052_276)_100%)]" />

      {/* Slow-moving cobalt light plate — CSS-only, readable motion */}
      <div
        className="bv-home-atmo-orb pointer-events-none absolute -left-[8%] top-[6%] h-[52%] w-[72%] max-w-[1100px] rounded-[50%] opacity-[0.48]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 42% 38%, oklch(0.38 0.12 252 / 0.42), oklch(0.22 0.08 258 / 0.12) 52%, transparent 72%)",
        }}
      />

      {/* Parallax surfaces — linear bands only (no soft radial blobs) */}
      <div
        className="bv-home-atmo-parallax-a absolute inset-[-8%] opacity-[0.68]"
        style={{
          background:
            "linear-gradient(152deg, oklch(0.14 0.09 258 / 0.16) 0%, transparent 48%), linear-gradient(220deg, transparent 40%, oklch(0.08 0.06 262 / 0.11) 100%)",
        }}
      />
      <div
        className="bv-home-atmo-parallax-b absolute inset-[-6%] opacity-[0.58]"
        style={{
          background:
            "linear-gradient(32deg, transparent 0%, oklch(0.11 0.07 260 / 0.12) 55%, transparent 100%), linear-gradient(188deg, oklch(0.06 0.05 268 / 0.13) 0%, transparent 45%)",
        }}
      />

      {/* Primary market grid — slow drift (single grid; extra layers removed for scroll perf) */}
      <div className="bv-home-atmo-grid absolute inset-0 opacity-[0.52]" />

      {/* Structural meridian — static anchor */}
      <div className="absolute inset-y-0 left-[40%] w-px max-lg:hidden bg-gradient-to-b from-transparent via-[oklch(0.55_0.14_252/0.28)] to-transparent opacity-[0.85]" />

      {/* Soft scan — single cold band, very slow */}
      <div className="absolute inset-0 overflow-hidden mask-[linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="bv-home-atmo-scan absolute -left-[30%] top-0 h-full w-[42%]" />
      </div>

      {/* Floor anchor — static depth */}
      <div className="absolute inset-x-0 bottom-0 h-[36%] bg-gradient-to-t from-[oklch(0.018_0.042_272/0.92)] to-transparent" />

      {/* Film grain — static, ties layers */}
      <div className="bg-noise absolute inset-0 opacity-[0.09] motion-reduce:opacity-0" />

      {/* Edge vignette — readability */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 120px 48px oklch(0.02 0.045 272 / 0.72)",
        }}
      />
    </div>
  );
}
