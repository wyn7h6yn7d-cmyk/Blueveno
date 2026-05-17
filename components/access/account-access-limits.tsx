"use client";

import Link from "next/link";
import { useAccess } from "@/components/access/access-provider";
import { AdminAccessNotice } from "@/components/access/admin-access-notice";
import { ReadOnlyBlockedNotice } from "@/components/access/read-only-blocked-notice";
import { PLAN_ACCESS_HREF, isReadOnlyWorkspace } from "@/lib/access/access-messaging";
import {
  tradingAccountsMaxForAccess,
  tradingAccountsUsageText,
} from "@/lib/trading-accounts/entitlements";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Settings → account limits copy by access state */
export function AccountAccessLimits({ className }: Props) {
  const access = useAccess();
  const { accounts } = useTradingAccountsWorkspace();
  const maxAccounts = tradingAccountsMaxForAccess(access);
  const usage = tradingAccountsUsageText(accounts.length, maxAccounts);

  if (access.isAdmin || access.state === "admin") {
    return <AdminAccessNotice className={className} />;
  }

  if (isReadOnlyWorkspace(access)) {
    return (
      <div className={cn("space-y-3", className)}>
        <ReadOnlyBlockedNotice compact context="creating or editing accounts" />
        <p className="text-[13px] text-zinc-500">
          {usage} — you can still switch between existing accounts.
        </p>
      </div>
    );
  }

  if (access.state === "premium_active") {
    return (
      <p className={cn("text-[13px] leading-relaxed text-zinc-400", className)}>
        Premium includes up to {maxAccounts} trading accounts. {usage}.
      </p>
    );
  }

  if (access.state === "trial_active") {
    return (
      <p className={cn("text-[13px] leading-relaxed text-zinc-400", className)}>
        Trial includes 1 trading account ({usage}).{" "}
        <Link href={PLAN_ACCESS_HREF} className="text-[oklch(0.78_0.11_252)] underline-offset-4 hover:underline">
          Premium supports up to 5
        </Link>
        .
      </p>
    );
  }

  return null;
}
