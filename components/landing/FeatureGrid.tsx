import {
  Activity,
  BookOpen,
  Building2,
  ClipboardList,
  ImageIcon,
  LineChart,
  Scale,
  FileText,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { PlatformPreviewStrip } from "@/components/landing/PlatformPreviewStrip";
import { marketingCtas } from "@/lib/marketing-ctas";

const features: { name: string; desc: string; icon: typeof BookOpen }[] = [
  { name: "Automatic journaling", desc: "Fills → one structured record.", icon: BookOpen },
  { name: "Performance analytics", desc: "Expectancy, slices, distributions.", icon: LineChart },
  { name: "Screenshot review", desc: "Chart state locked to the fill.", icon: ImageIcon },
  { name: "Setup playbooks", desc: "Rules where you trade; adherence tracked.", icon: ClipboardList },
  { name: "Behavioral tracking", desc: "Impulses surface before the month.", icon: Activity },
  { name: "Session recaps", desc: "Summaries you can export or defend.", icon: FileText },
  { name: "Rule violations", desc: "Desk constraints next to P&L.", icon: Scale },
  { name: "Account & prop oversight", desc: "Buffers and windows in view.", icon: Building2 },
];

export function FeatureGrid() {
  return (
    <Section id="platform" className="py-28 lg:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">The system</p>
          <h2 className="font-display mt-5 text-[2rem] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            From prints to proof.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-[17px]">
            Journal, analytics, review, and accountability share one normalized ledger—no stitched
            spreadsheets, no reconciliation tax.
          </p>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-14 max-w-5xl">
        <div className="overflow-hidden rounded-[1.35rem] border border-border/60 bg-bv-surface-inset/30 p-1 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.04)]">
          <PlatformPreviewStrip />
        </div>
      </Reveal>

      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Reveal key={f.name} delay={0.03 * (i % 4)}>
            <div className="group flex h-full flex-col rounded-xl border border-border/85 bg-bv-surface/95 p-5 shadow-bv-card transition hover:border-primary/20">
              <f.icon
                className="size-[17px] text-primary/95"
                strokeWidth={1.5}
                aria-hidden
              />
              <h3 className="font-display mt-4 text-[15px] font-medium tracking-tight text-zinc-100">{f.name}</h3>
              <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 text-center">
        <a
          href={marketingCtas.featureGrid.exploreDepth.href}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80 transition hover:text-primary"
        >
          {marketingCtas.featureGrid.exploreDepth.label} →
        </a>
      </Reveal>
    </Section>
  );
}
