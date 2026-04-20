import type { ReactNode } from "react";
import Link from "next/link";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MockAccountProp,
  MockAnalytics,
  MockAutoJournal,
  MockBehavior,
  MockPlaybooks,
  MockRuleViolations,
  MockScreenshotReview,
  MockSessionRecap,
} from "@/components/landing/mockups";
import { marketingCtas } from "@/lib/marketing-ctas";

const blocks: {
  eyebrow: string;
  title: string;
  body: string;
  mock: ReactNode;
}[] = [
  {
    eyebrow: "Ingestion",
    title: "Journaling that finishes the record",
    body: "Structured events—time, size, context—without rebuilding the day from memory.",
    mock: <MockAutoJournal />,
  },
  {
    eyebrow: "Analytics",
    title: "Analytics you actually query",
    body: "Expectancy and regime slices on one underlying record.",
    mock: <MockAnalytics />,
  },
  {
    eyebrow: "Review",
    title: "Screenshots bound to fills",
    body: "Chart and account share one ID—review stays specific.",
    mock: <MockScreenshotReview />,
  },
  {
    eyebrow: "Playbooks",
    title: "Playbooks that survive the session",
    body: "Conditions where you read them; adherence next to R.",
    mock: <MockPlaybooks />,
  },
  {
    eyebrow: "Behavior",
    title: "Behavior with the same rigor as R",
    body: "Surface impulses before they own the month.",
    mock: <MockBehavior />,
  },
  {
    eyebrow: "Recaps",
    title: "Recaps worth exporting",
    body: "What worked, what broke, what you enforce next.",
    mock: <MockSessionRecap />,
  },
  {
    eyebrow: "Rules",
    title: "Violations before the statement",
    body: "Firm rules beside execution—discretion stays visible.",
    mock: <MockRuleViolations />,
  },
  {
    eyebrow: "Accounts",
    title: "Prop and account context in frame",
    body: "Buffers and windows next to P&L—risk stays operational.",
    mock: <MockAccountProp />,
  },
];

export function DeepDives() {
  return (
    <Section size="wide" id="product-depth" className="bg-marketing-band py-28 lg:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">Product depth</p>
          <h2 className="font-display mt-5 text-[2rem] font-medium leading-[1.15] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            Built as one instrument—not a bundle.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-[17px]">
            Scroll the layers in order. Each panel is the same underlying record—structure you can ship
            against.
          </p>
        </Reveal>
      </div>

      <div className="mt-20 space-y-24 lg:space-y-28">
        {blocks.map((b, i) => (
          <div
            key={b.title}
            className={cn(
              "flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-16 xl:gap-20",
              i % 2 === 1 && "lg:flex-row-reverse",
            )}
          >
            <Reveal className="flex-1 lg:max-w-md">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-3xl font-medium tabular-nums text-zinc-700">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bv-eyebrow/85">
                    {b.eyebrow}
                  </p>
                  <h3 className="font-display mt-2 text-[1.35rem] font-medium leading-snug tracking-tight text-zinc-50 sm:text-2xl">
                    {b.title}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-[13px] leading-relaxed text-zinc-500">{b.body}</p>
              <div className="mt-8 h-px max-w-[12rem] bg-gradient-to-r from-bv-border-accent to-transparent" />
            </Reveal>
            <Reveal delay={0.06} className="min-w-0 flex-1">
              {b.mock}
            </Reveal>
          </div>
        ))}
      </div>

      <Reveal className="mt-24 text-center">
        <Link
          href={marketingCtas.deepDives.pricing.href}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-11 rounded-full border-primary/35 bg-white/[0.03] px-8 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-200 hover:bg-white/[0.06]",
          )}
        >
          {marketingCtas.deepDives.pricing.label} →
        </Link>
      </Reveal>
    </Section>
  );
}
