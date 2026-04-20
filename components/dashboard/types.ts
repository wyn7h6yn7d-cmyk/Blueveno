/** Shared shapes for dashboard mockups — swap for API types later. */

export type JournalRow = {
  id: string;
  time: string;
  symbol: string;
  side: "Long" | "Short" | "Flat";
  setup: string;
  size: string;
  rMultiple: string;
  slippage: string;
  note?: string;
};

export type TradeDetail = {
  id: string;
  symbol: string;
  side: string;
  openedAt: string;
  closedAt: string;
  setup: string;
  entry: string;
  exit: string;
  size: string;
  grossPnl: string;
  fees: string;
  netPnl: string;
  rMultiple: string;
  mae: string;
  mfe: string;
  tags: string[];
  notes?: string;
};

export type StrategyRow = {
  setup: string;
  trades: number;
  winRate: string;
  expectancy: string;
  netR: string;
  profitFactor: string;
};

export type RuleRow = {
  id: string;
  label: string;
  state: "ok" | "warn" | "breach";
  detail: string;
};
