export type JournalRow = {
  id: string;
  /** ISO timestamp from DB */
  createdAt?: string;
  /** Trading day date (YYYY-MM-DD) */
  entryDate?: string;
  time: string;
  sym: string;
  setup: string;
  r: string;
  tag: string;
  /** Optional — journal page detail */
  note?: string;
  /** Optional TradingView chart URL */
  tradingViewUrl?: string;
};

export type UserWorkspaceSnapshot = {
  version: 1;
  journal: JournalRow[];
};

export const EMPTY_WORKSPACE: UserWorkspaceSnapshot = { version: 1, journal: [] };
