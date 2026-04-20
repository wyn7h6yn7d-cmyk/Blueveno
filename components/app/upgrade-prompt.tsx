import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeatureKey } from "@/lib/features";
import { FEATURE_UPGRADE_COPY } from "@/lib/billing/copy";

type UpgradePromptProps = {
  feature: FeatureKey;
};

export function UpgradePrompt({ feature }: UpgradePromptProps) {
  const c = FEATURE_UPGRADE_COPY[feature];
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/28",
        "bg-[linear-gradient(135deg,oklch(0.15_0.035_262/0.92),oklch(0.1_0.032_266/0.96))]",
        "p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05)]",
      )}
    >
      <div className="pointer-events-none absolute -right-16 top-0 size-40 rounded-full bg-primary/12 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-bv-eyebrow">
            Requires {c.minPlan} or higher
          </p>
          <p className="font-display text-base font-medium text-zinc-50">{c.title}</p>
          <p className="max-w-xl text-sm leading-relaxed text-zinc-400">{c.description}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ variant: "default" }),
              "inline-flex h-10 items-center gap-1.5 rounded-xl px-4",
            )}
          >
            View plans
            <ArrowUpRight className="size-4" strokeWidth={1.75} />
          </Link>
          <Link
            href="/app/settings/billing"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "inline-flex h-10 items-center rounded-xl border-white/[0.12] bg-transparent px-4 hover:bg-white/[0.05]",
            )}
          >
            Billing
          </Link>
        </div>
      </div>
    </div>
  );
}
