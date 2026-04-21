import Link from "next/link";
import { PlatformPreviewStrip } from "@/components/landing/PlatformPreviewStrip";
import { Reveal } from "@/components/landing/Reveal";
import { Section } from "@/components/landing/Section";
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
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductShowcaseFrame } from "./ProductShowcaseFrame";
import { ProductShowcaseRow } from "./ProductShowcaseRow";

const rows = [
  {
    id: "showcase-journal",
    eyebrow: "Automatic journaling",
    promise: "Every fill lands in one solution.",
    copy: "Time, size, setup, tags—no rebuilding the day from memory.",
    mock: <MockAutoJournal />,
  },
  {
    id: "showcase-analytics",
    eyebrow: "Performance analytics",
    promise: "Expectancy and slices on the same tape.",
    copy: "Equity curve and setup tables—same executions.",
    mock: <MockAnalytics />,
  },
  {
    id: "showcase-review",
    eyebrow: "Screenshot review",
    promise: "Chart state locked to the print.",
    copy: "Open review on the fill that produced the frame.",
    mock: <MockScreenshotReview />,
  },
  {
    id: "showcase-playbooks",
    eyebrow: "Setup playbooks",
    promise: "Rules where you read them.",
    copy: "Conditions beside R; adherence in view.",
    mock: <MockPlaybooks />,
  },
  {
    id: "showcase-behavior",
    eyebrow: "Behavioral tracking",
    promise: "Impulses before month-end P&L.",
    copy: "Patterns next to outcomes.",
    mock: <MockBehavior />,
  },
  {
    id: "showcase-rules",
    eyebrow: "Rule violations",
    promise: "Desk constraints beside execution.",
    copy: "Flags while risk is still live.",
    mock: <MockRuleViolations />,
  },
  {
    id: "showcase-accounts",
    eyebrow: "Account & prop tracking",
    promise: "Buffers and windows in frame.",
    copy: "Prop rules next to P&L.",
    mock: <MockAccountProp />,
  },
  {
    id: "showcase-recap",
    eyebrow: "Session recap",
    promise: "Exports a risk desk can sign.",
    copy: "What held, what broke, what you enforce next.",
    mock: <MockSessionRecap />,
  },
] as const;

const rowCtas = marketingCtas.productShowcase.rows;

export function ProductShowcase() {
  return (
    <Section size="wide" id="platform" className="relative bg-marketing-depth py-32 lg:py-44">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-bv-eyebrow">The platform</p>
          <h2 className="font-display mt-6 text-[2rem] font-medium leading-[1.1] tracking-[-0.03em] text-zinc-50 sm:text-4xl md:text-[2.35rem]">
            Same record. Eight surfaces.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-snug text-zinc-500">
            Scroll the workspace—then go deeper on each layer.
          </p>
          <p className="mt-6">
            <a
              href={marketingCtas.productShowcase.intro.href}
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/85 transition hover:text-primary"
            >
              {marketingCtas.productShowcase.intro.label} →
            </a>
          </p>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-14 max-w-6xl">
        <ProductShowcaseFrame>
          <PlatformPreviewStrip />
        </ProductShowcaseFrame>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Live overview · desk-linked
        </p>
      </Reveal>

      <div className="mx-auto mt-20 max-w-6xl lg:mt-28">
        {rows.map((row, i) => (
          <ProductShowcaseRow
            key={row.id}
            id={row.id}
            index={i + 1}
            eyebrow={row.eyebrow}
            promise={row.promise}
            copy={row.copy}
            reverse={i % 2 === 1}
            cta={rowCtas[i]!}
            visual={<ProductShowcaseFrame>{row.mock}</ProductShowcaseFrame>}
          />
        ))}
      </div>

      <Reveal className="mt-20 text-center lg:mt-24">
        <Link
          href={marketingCtas.productShowcase.pricing.href}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-11 rounded-full border-primary/35 bg-white/[0.03] px-8 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-200 hover:bg-white/[0.06]",
          )}
        >
          {marketingCtas.productShowcase.pricing.label} →
        </Link>
      </Reveal>
    </Section>
  );
}
