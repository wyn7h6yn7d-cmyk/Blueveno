import Link from "next/link";
import { PremiumPrimaryLink } from "@/components/marketing/blueveno-home/premium-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { formatEur, PRICING_EUR } from "@/lib/marketing/pricing-copy";

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
            Read-only mode is active
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-zinc-500">
            After trial, your data stays read-only until upgrade. Premium unlocks ongoing journaling. Your history stays visible.
          </p>
          <div className="mt-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-6">
            <p className="app-eyebrow">Blueveno Premium</p>
            <div className="mt-4 flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-4xl tabular-nums tracking-[-0.03em] text-zinc-50">{formatEur(PRICING_EUR.monthly)}</span>
                <span className="text-[15px] text-zinc-500">/ month</span>
              </div>
              <span className="text-zinc-600">or</span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl tabular-nums tracking-[-0.03em] text-zinc-50">{formatEur(PRICING_EUR.yearly)}</span>
                <span className="text-[15px] text-zinc-500">/ year</span>
              </div>
            </div>
            <ul className="mx-auto mt-6 max-w-xs space-y-2.5 text-left text-[14px] text-zinc-400">
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)]" aria-hidden />
                Ongoing journaling after trial
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)]" aria-hidden />
                Up to 5 trading accounts
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)]" aria-hidden />
                Calendar with weekly totals
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)]" aria-hidden />
                Stats, behavior review, and discipline score
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[oklch(0.58_0.12_252/0.9)]" aria-hidden />
                Linked chart on every entry
              </li>
            </ul>
          </div>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <PremiumPrimaryLink href="/pricing">View pricing</PremiumPrimaryLink>
            <Link
              href="/app/settings/billing"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "min-h-11 rounded-xl border-white/[0.12] bg-white/[0.03] px-6 text-[13px] text-zinc-200 hover:bg-white/[0.06]",
              )}
            >
              Keep journaling
            </Link>
          </div>
          <p className="mt-8 font-mono text-[11px] text-zinc-600">Read-only after trial · History stays visible</p>
        </div>
      </div>
    </div>
  );
}
