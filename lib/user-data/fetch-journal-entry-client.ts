import { createClient } from "@/lib/supabase/client";
import { waitForSessionUser } from "@/lib/supabase/wait-for-browser-session";
import type { JournalRowDb } from "@/lib/user-data/map-journal-db";

const SELECT =
  "id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url";

export type FetchJournalEntryResult =
  | { ok: true; data: JournalRowDb }
  | { ok: false; reason: "missing" | "session" | "error"; message?: string };

/**
 * Loads one journal row with the same session gating as useUserWorkspace (wait + retries).
 */
export async function fetchJournalEntryForUser(
  userId: string,
  entryId: string,
  isCancelled: () => boolean,
): Promise<FetchJournalEntryResult> {
  const supabase = createClient();

  const sessionOk = await waitForSessionUser(supabase, userId, isCancelled);
  if (isCancelled()) return { ok: false, reason: "missing" };
  if (!sessionOk) return { ok: false, reason: "session" };

  for (let attempt = 0; attempt < 8; attempt++) {
    if (isCancelled()) return { ok: false, reason: "missing" };

    const { data, error } = await supabase
      .from("journal_entries")
      .select(SELECT)
      .eq("id", entryId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return { ok: false, reason: "error", message: error.message };
    }
    if (data) {
      return { ok: true, data: data as JournalRowDb };
    }

    if (attempt < 7) {
      if (attempt === 2) {
        await supabase.auth.refreshSession().catch(() => undefined);
      }
      await new Promise((r) => setTimeout(r, 100 + attempt * 70));
    }
  }

  return { ok: false, reason: "missing" };
}
