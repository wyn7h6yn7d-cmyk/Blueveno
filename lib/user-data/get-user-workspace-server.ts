import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  isMissingEntryDateColumnError,
  JOURNAL_SELECT_WITH_ENTRY_DATE,
  JOURNAL_SELECT_WITHOUT_ENTRY_DATE,
} from "@/lib/user-data/journal-entry-columns";
import { mapJournalRowsFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";

/**
 * Load journal rows with the server Supabase client (cookies / session).
 * Avoids the browser JWT hydration race where client selects return [] under RLS.
 */
export async function getUserWorkspaceSnapshotForUser(userId: string): Promise<UserWorkspaceSnapshot> {
  const supabase = await createClient();
  const first = await supabase
    .from("journal_entries")
    .select(JOURNAL_SELECT_WITH_ENTRY_DATE)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  let rows: JournalRowDb[] | null = null;
  let error = first.error;

  if (first.error && isMissingEntryDateColumnError(first.error.message)) {
    const second = await supabase
      .from("journal_entries")
      .select(JOURNAL_SELECT_WITHOUT_ENTRY_DATE)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    rows = second.data as JournalRowDb[] | null;
    error = second.error;
  } else {
    rows = first.data as JournalRowDb[] | null;
  }

  if (error) {
    console.error("[getUserWorkspaceSnapshotForUser]", error.message);
    return EMPTY_WORKSPACE;
  }

  return mapJournalRowsFromDb(rows ?? []);
}
