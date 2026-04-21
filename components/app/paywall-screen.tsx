import Link from "next/link";
import { PremiumPrimaryLink } from "@/components/marketing/blueveno-home/premium-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays, Sparkles } from "lucide-react";

export function PaywallScreen() {
  return (
    <div className="mx-auto max-w-[640px] py-6 md:py-12">
      <div className="relative overflow-hidden rounded-2xl border border-[oklch(0.48_0.12_252/0.35)] bg-[linear-gradient(165deg,oklch(0.12_0.04_262/0.95)_0%,oklch(0.065_0.038_268/0.98)_100%)] shadow-[0_0_0_1px_oklch(0.52_0.12_252/0.08),0_40px_100px_-48px_rgba(0,0,0,0.85)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.52_0.12_252/0.12) 1px, transparent 1px), linear-gradient(90deg, oklch(0.52_0.12_252/0.12) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden
        />
        <div className="relative px-6 py-12 text-center sm:px-10 sm:py-14">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-[oklch(0.52_0.12_252/0.35)] bg-[oklch(0.52_0.12_252/0.12)] text-[oklch(0.78_0.1_250)]">
            <Sparkles className="size-6" strokeWidth={1.5} />
          </div>
          <h1 className="font-display mt-8 text-[clamp(1.5rem,4vw,2rem)] font-bold leading-tight tracking-[-0.04em] text-zinc-50">
            Unlock your workspace
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-zinc-500">
            Blueveno is built for disciplined daily review—journal, calendar with weekly totals, and chart links in one
            place.
          </p>
          <div className="mt-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[oklch(0.62_0.12_252)]">Blueveno Pro</p>
            <div className="mt-4 flex items-baseline justify-center gap-1.5">
              <span className="font-display text-4xl tabular-nums tracking-[-0.03em] text-zinc-50">€5.99</span>
              <span className="text-[15px] text-zinc-500">/ month</span>
            </div>
            <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left text-[14px] text-zinc-400">
              <li className="flex gap-2">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-[oklch(0.65_0.11_252)]" strokeWidth={1.75} />
                Calendar + weekly totals
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)]" aria-hidden />
                Daily P&amp;L and notes
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)]" aria-hidden />
                TradingView link per day
              </li>
            </ul>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <PremiumPrimaryLink href="/pricing">View plans</PremiumPrimaryLink>
            <Link
              href="/app/settings/billing"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-11 rounded-xl border-white/[0.12] bg-white/[0.03] px-6 text-[13px] text-zinc-200 hover:bg-white/[0.06]",
              )}
            >
              Manage billing
            </Link>
          </div>
          <p className="mt-8 font-mono text-[11px] text-zinc-600">Cancel anytime · Billed in EUR</p>
        </div>
      </div>
    </div>
  );
}
