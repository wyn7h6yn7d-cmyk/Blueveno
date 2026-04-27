"use client";

import { Component, type ErrorInfo, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet, X } from "lucide-react";
import { useTradingAccounts } from "@/lib/trading-accounts/use-trading-accounts";

type Props = {
  userId: string;
};

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

function TopbarAccountSwitcherInner({ userId }: Props) {
  const router = useRouter();
  const { accounts, activeAccountId, error: accountLoadError, setActiveAccount } = useTradingAccounts(userId);
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
      return "Trading accounts are not set up in this environment yet. Run the latest Supabase migration and reload.";
    }
    return raw;
  })();

  return (
    <>
      <div className="inline-flex min-w-0 max-w-[20.5rem] items-center gap-1.5 rounded-full border border-[oklch(0.58_0.11_252/0.36)] bg-[oklch(0.14_0.045_262/0.88)] px-2 py-1 text-zinc-100 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]">
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
              router.refresh();
              return;
            }
            setAccountActionError(result.error);
          }}
          className="h-6 min-w-[7rem] max-w-[11.5rem] truncate bg-transparent pr-1 text-[12px] text-zinc-100 outline-none"
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
          <span className="shrink-0 rounded-full border border-emerald-400/35 bg-emerald-500/20 px-1.5 py-[1px] text-[9px] uppercase tracking-[0.12em] text-emerald-200">
            Active
          </span>
        ) : null}
        <button
          type="button"
          className="h-6 shrink-0 rounded-full border border-white/[0.12] bg-white/[0.04] px-2 text-[11px] text-zinc-200 transition hover:bg-white/[0.1]"
          onClick={() => router.push("/app/settings?section=accounts&new=1#accounts")}
        >
          Create
        </button>
        <button
          type="button"
          className="h-6 shrink-0 rounded-full border border-white/[0.12] bg-white/[0.04] px-2 text-[11px] text-zinc-200 transition hover:bg-white/[0.1]"
          onClick={() => router.push("/app/settings?section=accounts#accounts")}
        >
          Manage
        </button>
      </div>

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

export function TopbarAccountSwitcher(props: Props) {
  return (
    <TopbarAccountSwitcherBoundary>
      <TopbarAccountSwitcherInner {...props} />
    </TopbarAccountSwitcherBoundary>
  );
}
