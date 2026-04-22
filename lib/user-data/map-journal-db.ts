import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";

/** Shape returned by `journal_entries` select */
export type JournalRowDb = {
  id: string;
  created_at: string | null;
  /** Absent when DB has not run the entry_date migration yet. */
  entry_date?: string | null;
  entry_time: string;
  symbol: string;
  setup: string;
  r_value: string;
  tag: string;
  note: string | null;
  tradingview_url: string | null;
  mood_state?: "Calm" | "Focused" | "Hesitant" | "Tilted" | null;
  followed_plan?: boolean | null;
  respected_stop?: boolean | null;
  no_revenge_trade?: boolean | null;
};

export function mapJournalRowFromDb(r: JournalRowDb): JournalRow {
  return {
    id: r.id,
    createdAt: r.created_at ?? undefined,
    entryDate: r.entry_date ?? undefined,
    time: r.entry_time ?? "",
    sym: r.symbol ?? "",
    setup: r.setup ?? "—",
    r: r.r_value ?? "",
    tag: r.tag ?? "Manual",
    note: r.note ?? undefined,
    tradingViewUrl: r.tradingview_url ?? undefined,
    moodState: r.mood_state ?? undefined,
    followedPlan: r.followed_plan ?? false,
    respectedStop: r.respected_stop ?? false,
    noRevengeTrade: r.no_revenge_trade ?? false,
  };
}

export function mapJournalRowsFromDb(rows: JournalRowDb[]): UserWorkspaceSnapshot {
  return {
    version: 1,
    journal: rows.map(mapJournalRowFromDb),
  };
}
