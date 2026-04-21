"use client";

import Link from "next/link";
import { LockOpen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccess } from "@/components/access/access-provider";
import { formatEur, PRICING_EUR } from "@/lib/marketing/pricing-copy";

/** Read-only after trial — calm, trustworthy, single path to billing */
export function TrialUpgradeBanner() {
  const { state, canWriteJournal, trialEndsAt } = useAccess();

  if (canWriteJournal || state === "admin") return null;

  const end =
    trialEndsAt && !Number.isNaN(Date.parse(trialEndsAt))
      ? new Date(trialEndsAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : null;

  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-5 rounded-2xl border border-white/[0.1] p-5 sm:flex-row sm:items-center sm:justify-between",
        "bg-[linear-gradient(135deg,oklch(0.14_0.04_262/0.95),oklch(0.095_0.035_266/0.97))]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.05),0_20px_50px_-36px_rgba(0,0,0,0.5)]",
      )}
    >
      <div className="flex min-w-0 items-start gap-4">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-[oklch(0.78_0.1_250)]">
          <LockOpen className="size-[18px]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 space-y-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Read-only workspace</p>
          <p className="font-display text-[1.05rem] font-medium tracking-tight text-zinc-50">
            Trial complete — your workspace is read-only
          </p>
          <p className="max-w-xl text-[13px] leading-relaxed text-zinc-500">
            Calendar, journal, and stats stay visible.
            {end ? ` Ended ${end}.` : null}{" "}
            <span className="text-zinc-400">
              Upgrade to Premium ({formatEur(PRICING_EUR.monthly)} / month) to log new days.
            </span>
          </p>
        </div>
      </div>
      <Link
        href="/app/settings/billing"
        className={cn(
          buttonVariants({ variant: "default" }),
          "h-11 shrink-0 rounded-xl bg-[linear-gradient(180deg,oklch(0.76_0.14_250),oklch(0.68_0.15_252))] px-6 text-[13px] font-medium text-[oklch(0.12_0.04_265)] shadow-[0_12px_36px_-12px_oklch(0.45_0.14_252/0.45)] hover:brightness-[1.03]",
        )}
      >
        Upgrade
      </Link>
    </div>
  );
}
