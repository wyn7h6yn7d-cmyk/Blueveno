"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAccess } from "@/components/access/access-provider";

/** Shown when trial ended and user is read-only — calm, single CTA */
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
        "mb-6 flex flex-col gap-4 rounded-2xl border border-[oklch(0.55_0.12_252/0.35)]",
        "bg-[linear-gradient(135deg,oklch(0.16_0.045_262/0.95),oklch(0.11_0.04_266/0.98))] p-5 shadow-[inset_0_1px_0_0_oklch(1_0_0_/0.06)] sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
          <Sparkles className="size-4 text-[oklch(0.78_0.12_250)]" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Trial ended</p>
          <p className="font-display text-[15px] font-medium tracking-tight text-zinc-50">
            Read-only workspace — upgrade to log new days
          </p>
          <p className="text-[13px] leading-relaxed text-zinc-500">
            Your journal and calendar stay available. {end ? `Trial ended ${end}.` : null} Blueveno Premium is €5.99/month.
          </p>
        </div>
      </div>
      <Link
        href="/app/settings/billing"
        className={cn(
          buttonVariants({ variant: "default" }),
          "h-10 shrink-0 rounded-xl bg-[oklch(0.72_0.14_250)] px-5 text-[13px] text-[oklch(0.12_0.04_265)] hover:bg-[oklch(0.78_0.12_250)]",
        )}
      >
        Upgrade
      </Link>
    </div>
  );
}
