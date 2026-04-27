import type { TradingAccount, TradingAccountType } from "@/lib/trading-accounts/types";

export function mapTradingAccountRow(row: Record<string, unknown>): TradingAccount {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name ?? ""),
    accountType: String(row.account_type ?? "Other") as TradingAccountType,
    currency: String(row.currency ?? "EUR"),
    brokerPlatform: row.broker_platform != null ? String(row.broker_platform) : null,
    startingBalance:
      row.starting_balance == null || row.starting_balance === ""
        ? null
        : Number(row.starting_balance),
    notes: row.notes != null ? String(row.notes) : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}
