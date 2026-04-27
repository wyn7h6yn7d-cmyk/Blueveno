"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTradingAccounts } from "@/lib/trading-accounts/use-trading-accounts";

type TradingAccountsContextValue = ReturnType<typeof useTradingAccounts>;

const TradingAccountsContext = createContext<TradingAccountsContextValue | null>(null);

export function TradingAccountsProvider({ userId, children }: { userId: string; children: ReactNode }) {
  const value = useTradingAccounts(userId);
  return <TradingAccountsContext.Provider value={value}>{children}</TradingAccountsContext.Provider>;
}

export function useTradingAccountsWorkspace(): TradingAccountsContextValue {
  const ctx = useContext(TradingAccountsContext);
  if (!ctx) {
    throw new Error("useTradingAccountsWorkspace must be used within TradingAccountsProvider");
  }
  return ctx;
}
