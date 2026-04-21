"use client";

/**
 * Cold void + slow parallax + meridian — elegant, not flashy.
 */
export function AmbientField() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[oklch(0.032_0.044_272)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_92%_52%_at_50%_-12%,oklch(0.38_0.12_252/0.2),transparent_58%)]" />
      <div className="bv-home-field-animated absolute inset-0 bg-[radial-gradient(ellipse_54%_40%_at_90%_16%,oklch(0.32_0.1_258/0.14),transparent_58%)]" />
      <div
        className="bv-home-field-animated absolute inset-0 bg-[radial-gradient(ellipse_50%_42%_at_8%_40%,oklch(0.2_0.07_262/0.1),transparent_55%)] opacity-90"
        style={{ animationDelay: "-28s" }}
      />

      <div
        className="bv-home-meridian-pulse absolute inset-y-[10%] left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[oklch(0.52_0.14_252/0.2)] to-transparent"
        style={{ animationDelay: "-8s" }}
      />

      <div
        className="bv-home-rake absolute inset-0 opacity-[0.038] motion-reduce:opacity-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(102deg, transparent 0, transparent 108px, oklch(0.68 0.09 252 / 0.12) 108.5px, transparent 109px, transparent 240px)",
          maskImage: "linear-gradient(90deg, transparent, black 14%, black 86%, transparent)",
        }}
      />

      <div className="bg-market-grid-drift absolute inset-0 opacity-[0.11]" />
      <div className="bg-market-wave absolute inset-0 opacity-[0.055]" />
      <div className="bg-market-wave-reverse absolute inset-0 opacity-[0.04]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_98%_48%_at_50%_108%,oklch(0.22_0.1_258/0.28),transparent_68%)]" />

      <div className="bg-scanlines absolute inset-0 opacity-[0.09]" />
      <div className="bg-noise absolute inset-0 opacity-[0.2]" />

      <div
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 140px 48px oklch(0.02 0.045 270 / 0.72)",
        }}
      />
    </div>
  );
}
