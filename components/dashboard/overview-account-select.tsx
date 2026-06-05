"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";
import { StatusPill } from "@/components/v2/data/status-pill";
import { cn } from "@/lib/utils";
import { v2FilterPill } from "@/lib/ui/v2-surface";

type OverviewAccountSelectProps = {
  className?: string;
};

export function OverviewAccountSelect({ className }: OverviewAccountSelectProps) {
  const { accounts, activeAccountId, setActiveAccount, loading } = useTradingAccountsWorkspace();
  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;

  if (loading && accounts.length === 0) {
    return (
      <div className={cn(v2FilterPill, "h-9 animate-pulse border-white/[0.06] bg-white/[0.02]", className)} />
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div className="inline-flex h-9 min-w-0 items-center gap-1.5 rounded-lg border border-bv-blue-accent/30 bg-bv-blue-accent/8 px-2.5">
        <Wallet className="size-3.5 shrink-0 text-bv-ice" aria-hidden />
        <select
          value={activeAccountId ?? ""}
          onChange={async (e) => {
            const id = e.target.value;
            if (id) await setActiveAccount(id);
          }}
          className="max-w-[10rem] truncate bg-transparent text-[13px] text-zinc-100 outline-none sm:max-w-[12rem]"
          aria-label="Select trading account"
        >
          {accounts.length === 0 ? <option value="">No accounts</option> : null}
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>
      {activeAccount ? (
        <StatusPill tone="active" dot size="sm">
          {activeAccount.accountType ?? "Active"}
        </StatusPill>
      ) : null}
      <Link
        href="/app/settings?section=accounts#accounts"
        className="text-[12px] text-bv-ice/80 transition hover:text-bv-ice hover:underline"
      >
        Manage
      </Link>
    </div>
  );
}
