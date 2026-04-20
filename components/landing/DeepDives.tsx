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

const blocks: {
  eyebrow: string;
  title: string;
  body: string;
  mock: ReactNode;
}[] = [
  {
    eyebrow: "Ingestion",
    title: "Auto journaling that finishes the record for you",
    body: "Trades land as structured events—time, size, context—so the journal is complete even on the days you would rather skip the write-up.",
    mock: <MockAutoJournal />,
  },
  {
    eyebrow: "Analytics",
    title: "Performance analytics that answer the questions you actually ask",
    body: "Slice expectancy by setup, session, and regime. See what repeats—and what only looked good in hindsight.",
    mock: <MockAnalytics />,
  },
  {
    eyebrow: "Review",
    title: "Screenshot review that cannot divorce from the fill",
    body: "The chart moment and the account moment share one thread—so post-trade review stays specific, not nostalgic.",
    mock: <MockScreenshotReview />,
  },
  {
    eyebrow: "Playbooks",
    title: "Setup playbooks that survive real markets",
    body: "Write the conditions and the non-negotiables where you can read them—then track whether you traded your plan or your mood.",
    mock: <MockPlaybooks />,
  },
  {
    eyebrow: "Behavior",
    title: "Behavioral tracking for the patterns that move P&L",
    body: "Surface impulses and repeat behaviors with the same rigor you apply to R-multiples—before they own the month.",
    mock: <MockBehavior />,
  },
  {
    eyebrow: "Recaps",
    title: "Session recaps you can stand behind",
    body: "Structured summaries: what worked, what broke, what you enforce next—exportable for a coach or your future self.",
    mock: <MockSessionRecap />,
  },
  {
    eyebrow: "Rules",
    title: "Rule violations you see before the statement does",
    body: "Personal and firm rules tracked alongside execution—so discretion does not collide with compliance.",
    mock: <MockRuleViolations />,
  },
  {
    eyebrow: "Accounts",
    title: "Account and prop tracking in the same frame as performance",
    body: "Buffers, windows, and desk constraints visible beside P&L—risk stays operational, not a spreadsheet you open once a week.",
    mock: <MockAccountProp />,
  },
];

export function DeepDives() {
  return (
    <Section size="wide" className="py-28 lg:py-36">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.65_0.12_250)]">
            Inside the product
          </p>
          <h2 className="font-display mt-5 text-3xl font-medium tracking-tight text-zinc-50 sm:text-4xl">
            Depth that matches the stakes—not feature sprawl for a landing page.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-400 sm:text-lg">
            Each layer connects to the same thesis: turn trade data into decisions you can defend.
          </p>
        </Reveal>
      </div>

      <div className="mt-24 space-y-28 lg:space-y-36">
        {blocks.map((b, i) => (
          <div
            key={b.title}
            className={cn(
              "flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-20",
              i % 2 === 1 && "lg:flex-row-reverse",
            )}
          >
            <Reveal className="flex-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[oklch(0.55_0.1_250)]">
                {b.eyebrow}
              </p>
              <h3 className="font-display mt-5 text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl lg:max-w-xl">
                {b.title}
              </h3>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-[17px]">
                {b.body}
              </p>
              <div className="mt-10 h-px max-w-xs bg-gradient-to-r from-[oklch(0.55_0.14_250/0.5)] via-white/10 to-transparent" />
              <Link
                href="#cta"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "mt-8 -ml-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500 hover:text-[oklch(0.75_0.1_250)]",
                )}
              >
                Request access →
              </Link>
            </Reveal>
            <Reveal delay={0.08} className="flex-1">
              {b.mock}
            </Reveal>
          </div>
        ))}
      </div>
    </Section>
  );
}
