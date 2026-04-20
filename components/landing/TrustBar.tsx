import { Activity, Database, Shield } from "lucide-react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

const pillars = [
  {
    icon: Database,
    label: "Data fidelity",
    line: "One chain of record.",
  },
  {
    icon: Shield,
    label: "Review integrity",
    line: "Artifacts cannot rewrite the tape.",
  },
  {
    icon: Activity,
    label: "Capital-grade",
    line: "Built for real risk, daily.",
  },
];

export function TrustBar() {
  return (
    <Section className="py-12 lg:py-14">
      <Reveal>
        <div className="overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-b from-bv-surface-high/95 to-bv-base/98 shadow-bv-float ring-1 ring-primary/[0.08]">
          <div className="pointer-events-none border-b border-border/50 bg-black/25 px-6 py-3 bv-hairline-top sm:px-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-600">
              Engineering contract
            </p>
          </div>
          <div className="grid gap-px bg-border/35 sm:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.label}
                className="flex flex-col gap-4 bg-bv-base/98 p-7 transition-colors hover:bg-bv-raised/40 sm:p-8 lg:flex-row lg:items-start lg:gap-5"
              >
                <p.icon className="size-[18px] shrink-0 text-primary/95" strokeWidth={1.35} aria-hidden />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bv-ice/85">
                    {p.label}
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-zinc-400">{p.line}</p>
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
