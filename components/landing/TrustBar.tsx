import { Reveal } from "./Reveal";
import { Section } from "./Section";

const items = [
  { label: "Sync-ready", detail: "Designed for clean handoff from your execution stack" },
  { label: "Privacy-minded", detail: "Your journal is treated like proprietary research" },
  { label: "Desk-grade", detail: "Built for daily use when capital is on the line" },
];

export function TrustBar() {
  return (
    <Section className="border-y border-white/[0.06] bg-[#06070b]/80 py-10">
      <Reveal>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-sm font-display text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            Trust layer
          </p>
          <div className="grid flex-1 gap-6 sm:grid-cols-3">
            {items.map((it) => (
              <div key={it.label} className="border-l border-white/[0.08] pl-4">
                <p className="font-mono text-xs uppercase tracking-widest text-teal-300/80">
                  {it.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{it.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
