export const TRADING_ACCOUNT_TYPES = ["Live", "Demo", "Prop", "Challenge", "Funded", "Other"] as const;

export type TradingAccountType = (typeof TRADING_ACCOUNT_TYPES)[number];

export type TradingAccount = {
  id: string;
  userId: string;
  name: string;
  accountType: TradingAccountType;
  currency: string;
  brokerPlatform: string | null;
  startingBalance: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
