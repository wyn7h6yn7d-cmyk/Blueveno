"use client";

/**
 * Cinematic depth: slow parallax mesh, meridian, rake line, drift grids — crisp, not hazy.
 */
export function AmbientField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[oklch(0.038_0.042_270)]" />

      {/* Cold key — tighter, higher contrast than standard wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_48%_at_50%_-8%,oklch(0.42_0.11_252/0.16),transparent_56%)]" />
      <div className="bv-home-field-animated absolute inset-0 bg-[radial-gradient(ellipse_52%_38%_at_92%_18%,oklch(0.34_0.09_258/0.12),transparent_58%)]" />
      <div
        className="bv-home-field-animated absolute inset-0 bg-[radial-gradient(ellipse_48%_42%_at_4%_42%,oklch(0.22_0.06_262/0.09),transparent_54%)] opacity-80"
        style={{ animationDelay: "-26s" }}
      />

      {/* Vertical meridian — editorial spine */}
      <div
        className="bv-home-meridian-pulse absolute inset-y-[8%] left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[oklch(0.55_0.12_252/0.2)] to-transparent"
        style={{ animationDelay: "-6s" }}
      />

      {/* Scan rake — slow, barely-there */}
      <div
        className="bv-home-rake absolute inset-0 opacity-[0.045] motion-reduce:opacity-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(105deg, transparent 0, transparent 100px, oklch(0.7 0.08 250 / 0.15) 100.5px, transparent 101px, transparent 220px)",
          maskImage: "linear-gradient(90deg, transparent, black 16%, black 84%, transparent)",
        }}
      />

      <div className="bg-market-grid-drift absolute inset-0 opacity-[0.14]" />
      <div className="bg-market-wave absolute inset-0 opacity-[0.06]" />
      <div className="bg-market-wave-reverse absolute inset-0 opacity-[0.045]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_46%_at_50%_105%,oklch(0.26_0.1_258/0.22),transparent_65%)]" />

      <div className="bg-scanlines absolute inset-0 opacity-[0.11]" />
      <div className="bg-noise absolute inset-0 opacity-[0.22]" />

      {/* Cinematic letterbox vignette — edge falloff, not blur fog */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 120px 40px oklch(0.02 0.04 270 / 0.65)",
        }}
      />
    </div>
  );
}
