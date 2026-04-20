import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { FeatureKey } from "@/lib/features";
import { FEATURE_UPGRADE_COPY } from "@/lib/billing/copy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UpgradeCtaProps = {
  feature: FeatureKey;
  className?: string;
  /** Compact row vs padded card */
  variant?: "inline" | "card";
};

/**
 * Inline upgrade block for app surfaces — use under gated previews or empty states.
 */
export function UpgradeCta({ feature, className, variant = "card" }: UpgradeCtaProps) {
  const copy = FEATURE_UPGRADE_COPY[feature];

  const inner = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bv-eyebrow">
          Requires {copy.minPlan} or higher
        </p>
        <p className="font-display mt-1 text-sm font-medium text-zinc-100">{copy.title}</p>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">{copy.description}</p>
      </div>
      <Link
        href="/pricing"
        className={cn(
          buttonVariants({ variant: "default" }),
          "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-4",
        )}
      >
        Compare plans
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );

  if (variant === "inline") {
    return <div className={cn("border-b border-border/80 py-3", className)}>{inner}</div>;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-[linear-gradient(135deg,oklch(0.14_0.035_262/0.55),oklch(0.1_0.032_266/0.92))] p-4 sm:p-5",
        className,
      )}
    >
      {inner}
    </div>
  );
}
