import { Reveal } from "./Reveal";
import { Section } from "./Section";

const items = [
  {
    label: "Data fidelity",
    detail: "Ingestion built for clean handoff from your stack—so the record matches the tape, not a reconstructed story.",
  },
  {
    label: "Review integrity",
    detail: "Fills, context, and artifacts stay bound—review cannot quietly rewrite what happened.",
  },
  {
    label: "Capital-grade",
    detail: "Intended for daily use when drawdowns, rules, and reputation are measured in real terms.",
  },
];

export function TrustBar() {
  return (
    <Section className="py-6">
      <Reveal>
        <div className="rounded-2xl border border-white/[0.07] bg-[oklch(0.095_0.028_265/0.75)] px-6 py-12 shadow-bv-card backdrop-blur-md sm:px-10 lg:px-12 lg:py-14">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between lg:gap-16">
            <p className="font-display shrink-0 text-[11px] font-medium uppercase tracking-[0.38em] text-zinc-500">
              Standards
            </p>
            <div className="grid flex-1 gap-8 sm:grid-cols-3">
              {items.map((it) => (
                <div
                  key={it.label}
                  className="relative border-l border-[oklch(0.55_0.12_250/0.4)] pl-5"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[oklch(0.74_0.1_250)]">
                    {it.label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{it.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
