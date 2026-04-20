import { Reveal } from "./Reveal";
import { Section } from "./Section";

const items = [
  {
    label: "Execution fidelity",
    detail: "Ingestion designed for clean handoff from your stack—no duct-tape CSVs.",
  },
  {
    label: "Evidence discipline",
    detail: "Journal entries stay tied to fills and context so review cannot rewrite history.",
  },
  {
    label: "Operator-grade",
    detail: "Built for daily use when drawdowns and rules are measured in real money.",
  },
];

export function TrustBar() {
  return (
    <Section className="border-y border-white/[0.05] bg-[oklch(0.1_0.025_265/0.5)] py-14 backdrop-blur-sm">
      <Reveal>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:justify-between lg:gap-16">
          <p className="font-display shrink-0 text-[11px] font-medium uppercase tracking-[0.35em] text-zinc-500">
            Proof of intent
          </p>
          <div className="grid flex-1 gap-8 sm:grid-cols-3">
            {items.map((it) => (
              <div
                key={it.label}
                className="relative border-l border-[oklch(0.55_0.12_250/0.35)] pl-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[oklch(0.72_0.1_250)]">
                  {it.label}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{it.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
