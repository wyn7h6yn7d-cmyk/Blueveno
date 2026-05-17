import "server-only";

import { createClient } from "@/lib/supabase/server";
import { queryJournalWithSelectFallback } from "@/lib/user-data/journal-entry-columns";
import { mapJournalRowsFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";

/**
 * Load journal rows with the server Supabase client (cookies / session).
 * Avoids the browser JWT hydration race where client selects return [] under RLS.
 */
export async function getUserWorkspaceSnapshotForUser(userId: string): Promise<UserWorkspaceSnapshot> {
  const supabase = await createClient();
  const { data: profileRow } = await supabase
    .from("user_profiles")
    .select("active_trading_account_id")
    .eq("user_id", userId)
    .maybeSingle();
  const activeAccountId = (profileRow?.active_trading_account_id as string | null) ?? null;
  if (!activeAccountId) {
    return EMPTY_WORKSPACE;
  }

  const { data: rows, error } = await queryJournalWithSelectFallback<JournalRowDb[]>(async (select) => {
    const result = await supabase
      .from("journal_entries")
      .select(select)
      .eq("user_id", userId)
      .eq("account_id", activeAccountId)
      .order("created_at", { ascending: false });
    return { data: (result.data ?? null) as JournalRowDb[] | null, error: result.error };
  });

  if (error) {
    console.error("[getUserWorkspaceSnapshotForUser]", error.message);
    return EMPTY_WORKSPACE;
  }

  return mapJournalRowsFromDb(rows ?? []);
}
