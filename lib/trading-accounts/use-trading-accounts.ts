"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapTradingAccountRow } from "@/lib/trading-accounts/map";
import type { TradingAccount } from "@/lib/trading-accounts/types";

type TradingAccountsState = {
  accounts: TradingAccount[];
  activeAccountId: string | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setActiveAccount: (id: string) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function useTradingAccounts(userId: string | undefined): TradingAccountsState {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setAccounts([]);
      setActiveAccountId(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const [{ data: accountRows, error: accountError }, { data: profileRow, error: profileError }] = await Promise.all([
      supabase.from("trading_accounts").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("user_profiles").select("active_trading_account_id").eq("user_id", userId).maybeSingle(),
    ]);
    if (accountError || profileError) {
      setLoading(false);
      setError(accountError?.message ?? profileError?.message ?? "Could not load trading accounts.");
      return;
    }
    const mapped = (accountRows ?? []).map((row) => mapTradingAccountRow(row as unknown as Record<string, unknown>));
    setAccounts(mapped);
    setActiveAccountId((profileRow?.active_trading_account_id as string | null) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hook bootstraps account state from Supabase */
    void reload();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [reload]);

  const setActiveAccount = useCallback(
    async (id: string) => {
      if (!userId) return { ok: false as const, error: "Not signed in." };
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ active_trading_account_id: id, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (updateError) {
        return { ok: false as const, error: updateError.message };
      }
      setActiveAccountId(id);
      return { ok: true as const };
    },
    [userId],
  );

  return useMemo(
    () => ({
      accounts,
      activeAccountId,
      loading,
      error,
      reload,
      setActiveAccount,
    }),
    [accounts, activeAccountId, loading, error, reload, setActiveAccount],
  );
}
