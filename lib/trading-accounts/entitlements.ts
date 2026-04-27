import type { AccessContextClient } from "@/lib/access/types";

export function tradingAccountsMaxForAccess(access: Pick<AccessContextClient, "isAdmin" | "state">): number {
  if (access.isAdmin || access.state === "premium_active") return 5;
  return 1;
}

export function canManageTradingAccounts(access: Pick<AccessContextClient, "isAdmin" | "state">): boolean {
  return access.isAdmin || access.state === "premium_active" || access.state === "trial_active";
}

export function tradingAccountsUsageText(current: number, max: number): string {
  const noun = max === 1 ? "account" : "accounts";
  return `${current} of ${max} ${noun} used`;
}

