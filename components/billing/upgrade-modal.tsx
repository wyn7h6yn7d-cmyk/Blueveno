"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { FeatureKey } from "@/lib/features";
import { FEATURE_UPGRADE_COPY } from "@/lib/billing/copy";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UpgradeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: FeatureKey;
};

/**
 * Placeholder modal — swap body for Stripe Checkout embed or Customer Portal CTA later.
 */
export function UpgradeModal({ open, onOpenChange, feature }: UpgradeModalProps) {
  const copy = FEATURE_UPGRADE_COPY[feature];

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        className={cn(
          "relative z-[101] w-full max-w-md rounded-2xl border border-white/[0.1] bg-[oklch(0.11_0.03_265)] p-6 shadow-bv-float",
        )}
      >
        <button
          type="button"
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[oklch(0.65_0.12_250)]">
          {copy.minPlan}+ required
        </p>
        <h2 id="upgrade-modal-title" className="font-display mt-2 text-xl font-medium text-zinc-50">
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{copy.description}</p>
        <p className="mt-4 rounded-lg border border-dashed border-white/[0.1] bg-bv-surface-inset/50 px-3 py-2 font-mono text-[11px] text-zinc-500">
          Stripe Checkout & Customer Portal will mount here — price IDs from env when wired.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/pricing"
            onClick={() => onOpenChange(false)}
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-10 rounded-xl bg-[oklch(0.72_0.14_250)] px-4 text-[oklch(0.12_0.04_265)] hover:bg-[oklch(0.78_0.12_250)]",
            )}
          >
            View plans
          </Link>
          <Link
            href="/app/settings/billing"
            onClick={() => onOpenChange(false)}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 rounded-xl border-white/[0.12] bg-transparent",
            )}
          >
            Billing settings
          </Link>
        </div>
      </div>
    </div>
  );
}
