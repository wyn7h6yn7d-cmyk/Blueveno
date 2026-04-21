import "server-only";

import { createClient } from "@/lib/supabase/server";
import { mapJournalRowsFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";

/**
 * Load journal rows with the server Supabase client (cookies / session).
 * Avoids the browser JWT hydration race where client selects return [] under RLS.
 */
export async function getUserWorkspaceSnapshotForUser(userId: string): Promise<UserWorkspaceSnapshot> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("journal_entries")
    .select("id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getUserWorkspaceSnapshotForUser]", error.message);
    return EMPTY_WORKSPACE;
  }

  return mapJournalRowsFromDb((rows ?? []) as JournalRowDb[]);
}
