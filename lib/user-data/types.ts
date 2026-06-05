import type { MarketCondition, MistakeTag, SessionTag, SetupTag } from "@/lib/user-data/journal-tags";

export type JournalRow = {
  id: string;
  /** ISO timestamp from DB */
  createdAt?: string;
  /** Trading day date (YYYY-MM-DD) */
  entryDate?: string;
  time: string;
  sym: string;
  setup: SetupTag | string;
  r: string;
  tag: MistakeTag | string;
  /** Optional — journal page detail */
  note?: string;
  /** Optional linked chart URL */
  chartLinkUrl?: string;
  /** Optional behavior tag for the day */
  moodState?: "Calm" | "Focused" | "Hesitant" | "Tilted";
  followedPlan?: boolean;
  respectedStop?: boolean;
  noRevengeTrade?: boolean;
  sessionTag?: SessionTag | string;
  marketCondition?: MarketCondition | string;
  lessonLearned?: string;
  ruleChecks?: Record<string, boolean>;
  /** Present when loaded from journal_entries.account_id */
  accountId?: string;
};

export type UserWorkspaceSnapshot = {
  version: 1;
  journal: JournalRow[];
};

export const EMPTY_WORKSPACE: UserWorkspaceSnapshot = { version: 1, journal: [] };
