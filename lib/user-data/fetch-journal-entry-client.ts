import { createClient } from "@/lib/supabase/client";
import { waitForSessionUser } from "@/lib/supabase/wait-for-browser-session";
import {
  isMissingEntryDateColumnError,
  JOURNAL_SELECT_WITH_ENTRY_DATE,
  JOURNAL_SELECT_WITHOUT_ENTRY_DATE,
} from "@/lib/user-data/journal-entry-columns";
import type { JournalRowDb } from "@/lib/user-data/map-journal-db";

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

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("active_trading_account_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (profileError) {
    return { ok: false, reason: "error", message: profileError.message };
  }
  const activeTradingAccountId = (profile?.active_trading_account_id as string | null) ?? null;
  if (!activeTradingAccountId) {
    return { ok: false, reason: "missing" };
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    if (isCancelled()) return { ok: false, reason: "missing" };

    let { data, error } = await supabase
      .from("journal_entries")
      .select(JOURNAL_SELECT_WITH_ENTRY_DATE)
      .eq("id", entryId)
      .eq("user_id", userId)
      .eq("account_id", activeTradingAccountId)
      .maybeSingle();

    if (error && isMissingEntryDateColumnError(error.message)) {
      ({ data, error } = await supabase
        .from("journal_entries")
        .select(JOURNAL_SELECT_WITHOUT_ENTRY_DATE)
        .eq("id", entryId)
        .eq("user_id", userId)
        .eq("account_id", activeTradingAccountId)
        .maybeSingle());
    }

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
