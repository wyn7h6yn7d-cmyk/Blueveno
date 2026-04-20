import { Activity, Database, Shield } from "lucide-react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const pillars = [
  {
    icon: Database,
    label: "Data fidelity",
    line: "Fills and context stay one chain of record.",
  },
  {
    icon: Shield,
    label: "Review integrity",
    line: "Artifacts cannot rewrite the tape.",
  },
  {
    icon: Activity,
    label: "Capital-grade",
    line: "Built for daily desk use under real risk.",
  },
];

export function TrustBar() {
  return (
    <Section className="py-10 lg:py-12">
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-bv-surface/90 to-bv-base/95 shadow-bv-card">
          <div className="pointer-events-none border-b border-border/45 bg-black/15 px-6 py-3 sm:px-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">
              Engineering contract
            </p>
          </div>
          <div className="grid gap-px bg-border/30 sm:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.label}
                className="flex flex-col gap-4 bg-bv-base/95 p-7 sm:p-8 lg:flex-row lg:items-start lg:gap-5"
              >
                <p.icon className="size-[18px] shrink-0 text-primary/95" strokeWidth={1.35} aria-hidden />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bv-ice/85">
                    {p.label}
                  </p>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-400">{p.line}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 bg-black/25 px-6 py-3.5 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-600 sm:px-8">
            <span>Single source of truth · execution-bound</span>
            <span className="text-zinc-600">TLS · session isolation</span>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
