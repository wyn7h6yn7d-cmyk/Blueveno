"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import {
  formatTrialDaysLabel,
  formatTrialEndDate,
  getTrialDaysRemaining,
  isReadOnlyWorkspace,
  PLAN_ACCESS_HREF,
  PREMIUM_VALUE_POINTS,
  shouldShowUpgradeMessaging,
} from "@/lib/access/access-messaging";
import { PremiumRequestLink } from "@/components/analytics/premium-request-link";
import { appPrimaryCta, appSecondaryCta } from "@/lib/ui/app-surface";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Calm trial / read-only banner — hidden for Premium and admin */
export function AccessStatusBanner({ className }: Props) {
  const access = useAccess();

  if (!shouldShowUpgradeMessaging(access)) return null;

  const daysLeft = getTrialDaysRemaining(access.trialEndsAt);
  const daysLabel = formatTrialDaysLabel(daysLeft);
  const endDate = formatTrialEndDate(access.trialEndsAt);
  const readOnly = isReadOnlyWorkspace(access);
  const endingSoon = access.state === "trial_active" && daysLeft !== null && daysLeft <= 2;

  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4",
        readOnly
          ? "border-white/[0.1] bg-[linear-gradient(155deg,oklch(0.12_0.03_266/0.96),oklch(0.09_0.028_268/0.98))]"
          : "border-emerald-400/22 bg-[linear-gradient(155deg,oklch(0.15_0.04_155/0.35),oklch(0.1_0.032_266/0.94))]",
        "shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06),0_16px_48px_-36px_rgba(0,0,0,0.55)]",
        className,
      )}
      role="status"
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <span
          className={cn(
            "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border",
            readOnly
              ? "border-white/[0.1] bg-white/[0.04] text-zinc-400"
              : "border-emerald-400/28 bg-emerald-500/10 text-emerald-200",
          )}
        >
          {readOnly ? <Lock className="size-[18px]" strokeWidth={1.75} /> : <Sparkles className="size-[18px]" strokeWidth={1.75} />}
        </span>
        <div className="min-w-0 space-y-1.5">
          {readOnly ? (
            <>
              <p className="text-[12px] font-medium text-zinc-500">Read-only workspace</p>
              <p className="font-display text-[1.05rem] font-medium tracking-tight text-zinc-50">
                Your trial has ended
              </p>
              <p className="max-w-xl text-[14px] leading-relaxed text-zinc-400">
                Your journal and calendar history remain visible. Request Premium to journal again and use up to 5
                accounts.
                {endDate ? ` Trial ended ${endDate}.` : null}
              </p>
            </>
          ) : (
            <>
              <p className="text-[12px] font-medium text-emerald-200/90">
                {endingSoon ? "Trial ending soon" : "Trial active"}
              </p>
              <p className="font-display text-[1.05rem] font-medium tracking-tight text-zinc-50">
                {daysLabel ?? "Your free trial is active"}
              </p>
              <p className="max-w-xl text-[14px] leading-relaxed text-zinc-400">
                Trial includes 1 trading account.
                {endDate ? (
                  <>
                    {" "}
                    Ends <span className="text-zinc-300">{endDate}</span>.
                  </>
                ) : null}{" "}
                After trial, your data stays available — Premium keeps journaling open.
              </p>
            </>
          )}
          <p className="hidden max-w-xl pt-0.5 text-[12px] leading-relaxed text-zinc-500 sm:block">
            Premium includes {PREMIUM_VALUE_POINTS.slice(0, 3).join(" · ")}.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">
        {readOnly ? (
          <PremiumRequestLink source="access_banner" className={cn(appPrimaryCta, "h-10 px-5 text-[14px]")}>
            Request Premium access
          </PremiumRequestLink>
        ) : (
          <Link href={PLAN_ACCESS_HREF} className={cn(appPrimaryCta, "h-10 px-5 text-[14px]")}>
            Plan &amp; access
          </Link>
        )}
        {!readOnly ? (
          <Link href={PLAN_ACCESS_HREF} className={cn(appSecondaryCta, "h-10 px-4 text-[13px]")}>
            See Premium benefits
          </Link>
        ) : (
          <Link href={PLAN_ACCESS_HREF} className={cn(appSecondaryCta, "h-10 px-4 text-[13px]")}>
            View plan details
          </Link>
        )}
      </div>
    </div>
  );
}
