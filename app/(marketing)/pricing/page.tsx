import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/Footer";
import { MarketingBackground } from "@/components/landing/MarketingBackground";
import { Navbar } from "@/components/landing/Navbar";
import { Reveal } from "@/components/landing/Reveal";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { PRODUCT_DESCRIPTION, PRODUCT_TAGLINE } from "@/lib/product";
import type { PlanTier } from "@/lib/billing/types";

export const metadata: Metadata = {
  title: "Pricing",
  description: PRODUCT_DESCRIPTION,
};

const tierMeta: Record<
  PlanTier,
  { cta: string; href: string; highlight: boolean }
> = {
  free: { cta: "Start free", href: "/signup", highlight: false },
  pro: {
    cta: "Get Pro",
    href: "/login?callbackUrl=/app/settings/billing",
    highlight: true,
  },
  elite: {
    cta: "Get Elite",
    href: "/login?callbackUrl=/app/settings/billing",
    highlight: false,
  },
};

export default function PricingPage() {
  return (
    <MarketingBackground>
      <Navbar />
      <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-28 sm:px-6 lg:px-8 lg:pb-36 lg:pt-32">
        <Reveal>
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(0.68_0.12_250)]">
              Pricing
            </p>
            <h1 className="font-display mt-5 text-4xl font-medium tracking-[-0.02em] text-zinc-50 md:text-5xl lg:text-[3rem] lg:leading-[1.08]">
              Plans for operators, not tourists
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              {PRODUCT_TAGLINE} After checkout, Stripe Customer Portal opens from{" "}
              <code className="rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 font-mono text-[12px] text-zinc-300">
                /app/settings/billing
              </code>
              , once your Stripe price IDs are configured.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {PLAN_ORDER.map((id, i) => {
            const p = PLANS[id];
            const m = tierMeta[id];
            const priceLabel =
              p.priceUsd === null || p.priceUsd === 0 ? "$0" : `$${p.priceUsd}`;
            return (
              <Reveal key={p.id} delay={0.06 * i}>
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[oklch(0.1_0.028_265/0.85)] p-8 shadow-bv-card backdrop-blur-sm transition duration-300",
                    m.highlight &&
                      "border-[oklch(0.55_0.14_250/0.35)] shadow-bv-lift ring-1 ring-[oklch(0.55_0.14_250/0.15)]",
                    id === "elite" && !m.highlight && "border-[oklch(0.52_0.12_250/0.22)]",
                  )}
                >
                  <div>
                    <p className="font-display text-xl font-medium tracking-tight text-zinc-50">{p.name}</p>
                    <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                      {id === "free" && "Explore the workspace and core journaling flows."}
                      {id === "pro" && "Full performance stack for daily operators."}
                      {id === "elite" && "Exports, AI insights, and desk-grade seats when enabled."}
                    </p>
                    <p className="font-display mt-8 text-4xl tabular-nums tracking-tight text-zinc-50">
                      {priceLabel}
                      <span className="ml-1.5 text-base font-normal text-zinc-500">/mo</span>
                    </p>
                  </div>
                  <ul className="mt-8 flex-1 space-y-3 text-sm text-zinc-400">
                    {p.highlights.map((f) => (
                      <li key={f} className="flex gap-2.5">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[oklch(0.55_0.14_250/0.7)]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={m.href}
                    className={cn(
                      buttonVariants({ variant: m.highlight ? "default" : "outline" }),
                      "mt-10 h-11 w-full rounded-full font-semibold",
                      !m.highlight &&
                        "border-white/[0.12] bg-white/[0.03] text-zinc-200 hover:bg-white/[0.07]",
                    )}
                  >
                    {m.cta}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-16 text-center">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-[oklch(0.65_0.1_250)] transition hover:text-[oklch(0.82_0.08_250)]"
          >
            ← Back to home
          </Link>
        </p>
      </div>
      <Footer />
    </MarketingBackground>
  );
}
