"use client";

import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, X } from "lucide-react";
import { useAccess } from "@/components/access/access-provider";
import { tradingAccountsMaxForAccess } from "@/lib/trading-accounts/entitlements";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";

type BoundaryState = {
  hasError: boolean;
};

class TopbarAccountSwitcherBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[TopbarAccountSwitcherBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <a
          href="/app/settings?section=accounts#accounts"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 text-[12px] text-zinc-300 transition hover:bg-white/[0.08]"
        >
          <Wallet className="size-3.5 text-zinc-400" />
          Accounts unavailable
        </a>
      );
    }
    return this.props.children;
  }
}

function TopbarAccountSwitcherInner() {
  const router = useRouter();
  const access = useAccess();
  const maxAccounts = tradingAccountsMaxForAccess(access);
  const { accounts, activeAccountId, error: accountLoadError, setActiveAccount } = useTradingAccountsWorkspace();
  const [accountActionError, setAccountActionError] = useState<string | null>(null);
  const [accountErrorDismissed, setAccountErrorDismissed] = useState(false);
  const activeAccount = accounts.find((a) => a.id === activeAccountId) ?? null;

  const accountErrorMessage = (() => {
    if (accountErrorDismissed) return null;
    const raw = accountActionError ?? accountLoadError;
    if (!raw) return null;
    const normalized = raw.toLowerCase();
    const missingTradingAccountsTable =
      normalized.includes("trading_accounts") &&
      (normalized.includes("could not find the table") ||
        normalized.includes("relation") ||
        normalized.includes("does not exist"));
    if (missingTradingAccountsTable) {
      return "Trading accounts are temporarily unavailable in this workspace.";
    }
    return raw;
  })();

  return (
    <>
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1.5">
        <div className="inline-flex min-h-10 min-w-0 max-w-full items-center gap-1.5 overflow-hidden rounded-full border border-[oklch(0.58_0.11_252/0.36)] bg-[oklch(0.14_0.045_262/0.88)] py-1 pl-2 pr-2 text-zinc-100 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)] sm:pr-2.5">
          <Wallet className="size-3.5 shrink-0 text-[oklch(0.74_0.11_252)]" />
          <select
            value={activeAccountId ?? ""}
            onChange={async (e) => {
              const selectedId = e.target.value;
              if (!selectedId) return;
              setAccountErrorDismissed(false);
              setAccountActionError(null);
              const result = await setActiveAccount(selectedId);
              if (result.ok) {
                return;
              }
              setAccountActionError(result.error);
            }}
            className="h-8 min-w-0 max-w-[7.5rem] shrink truncate bg-transparent text-[13px] text-zinc-100 outline-none min-[400px]:max-w-[9rem] sm:max-w-[11rem] md:max-w-[13rem]"
            aria-label="Select trading account"
          >
            {accounts.length === 0 ? <option value="">No accounts</option> : null}
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {activeAccount ? (
            <span className="hidden shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200 min-[400px]:inline-flex">
              Active
            </span>
          ) : null}
          <button
            type="button"
            className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 text-[12px] text-zinc-200 transition hover:bg-white/[0.1] sm:px-3"
            onClick={() => router.push("/app/settings?section=accounts#accounts")}
            aria-label="Manage trading accounts"
          >
            <span className="hidden sm:inline">Manage</span>
            <span className="sm:hidden">···</span>
          </button>
        </div>
        <span
          className="hidden shrink-0 items-center rounded-full border border-white/[0.12] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-zinc-400 min-[430px]:inline-flex"
          title={`Trading accounts in use (${Math.min(accounts.length, maxAccounts)} of ${maxAccounts})`}
        >
          Accounts {Math.min(accounts.length, maxAccounts)}/{maxAccounts}
        </span>
      </div>
      {access.state === "trial_active" && maxAccounts === 1 && accounts.length >= 1 ? (
        <p className="hidden text-[12px] text-zinc-500 sm:block">
          Trial: 1 account.{" "}
          <Link href="/app/settings/billing" className="text-[oklch(0.78_0.11_252)] hover:underline">
            Premium supports up to 5
          </Link>
        </p>
      ) : null}

      {accountErrorMessage ? (
        <div className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/[0.14] px-2.5 py-1 text-[11px] text-rose-100 sm:max-w-[30rem] sm:text-[12px]">
          <span className="truncate">{accountErrorMessage}</span>
          <button
            type="button"
            className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-rose-200/90 transition hover:bg-rose-500/25 hover:text-rose-100"
            onClick={() => setAccountErrorDismissed(true)}
            aria-label="Dismiss account error"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}
    </>
  );
}

export function TopbarAccountSwitcher() {
  return (
    <TopbarAccountSwitcherBoundary>
      <TopbarAccountSwitcherInner />
    </TopbarAccountSwitcherBoundary>
  );
}
