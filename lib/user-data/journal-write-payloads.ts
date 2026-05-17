import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isRetryableJournalSchemaError,
  queryJournalWithSelectFallback,
} from "@/lib/user-data/journal-entry-columns";
import type { JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow } from "@/lib/user-data/types";

export type JournalWriteInput = Omit<JournalRow, "id" | "createdAt">;

function coreFields(row: JournalWriteInput) {
  return {
    entry_time: row.time,
    symbol: row.sym,
    setup: row.setup,
    r_value: row.r,
    tag: row.tag,
    note: row.note ?? null,
    chart_link_url: row.chartLinkUrl ?? null,
  };
}

function behaviorFields(row: JournalWriteInput) {
  return {
    mood_state: row.moodState ?? null,
    followed_plan: row.followedPlan ?? false,
    respected_stop: row.respectedStop ?? false,
    no_revenge_trade: row.noRevengeTrade ?? false,
  };
}

function contextFields(row: JournalWriteInput) {
  return {
    session_tag: row.sessionTag ?? null,
    market_condition: row.marketCondition ?? null,
    lesson_learned: row.lessonLearned ?? null,
  };
}

/** Ordered update payloads: drop optional columns only after schema errors, never skip behavior before legacy core. */
export function buildJournalUpdatePayloads(row: JournalWriteInput): Record<string, unknown>[] {
  const core = coreFields(row);
  const behavior = behaviorFields(row);
  const context = contextFields(row);
  const ruleChecks = { rule_checks: row.ruleChecks ?? {} };
  const entryDate = { entry_date: row.entryDate ?? null };

  const attempts = [
    { ...core, ...behavior, ...context, ...ruleChecks, ...entryDate },
    { ...core, ...behavior, ...context, ...ruleChecks },
    { ...core, ...behavior, ...context, ...entryDate },
    { ...core, ...behavior, ...context },
    { ...core, ...behavior, ...entryDate },
    { ...core, ...behavior },
    core,
  ];

  const seen = new Set<string>();
  return attempts.filter((payload) => {
    const key = JSON.stringify(payload);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Ordered insert payloads for journal_entries (includes user_id + account_id). */
export function buildJournalInsertPayloads(
  row: JournalWriteInput,
  userId: string,
  accountId: string,
): Record<string, unknown>[] {
  const core = coreFields(row);
  const behavior = behaviorFields(row);
  const context = contextFields(row);
  const ruleChecks = { rule_checks: row.ruleChecks ?? {} };
  const entryDate = { entry_date: row.entryDate ?? null };
  const ids = { user_id: userId, account_id: accountId };

  const attempts = [
    { ...ids, ...core, ...behavior, ...context, ...ruleChecks, ...entryDate },
    { ...ids, ...core, ...behavior, ...context, ...ruleChecks },
    { ...ids, ...core, ...behavior, ...context, ...entryDate },
    { ...ids, ...core, ...behavior, ...context },
    { ...ids, ...core, ...behavior, ...entryDate },
    { ...ids, ...core, ...behavior },
    { ...ids, ...core },
  ];

  const seen = new Set<string>();
  return attempts.filter((payload) => {
    const key = JSON.stringify(payload);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

type JournalMutationResult = { data: JournalRowDb | null; error: { message?: string } | null };

export async function insertJournalWithPayloadFallback(
  supabase: SupabaseClient,
  payloads: Record<string, unknown>[],
): Promise<JournalMutationResult> {
  let last: JournalMutationResult = { data: null, error: null };
  for (const payload of payloads) {
    const result = await queryJournalWithSelectFallback<JournalRowDb>(async (select) => {
      const response = await supabase.from("journal_entries").insert(payload).select(select).single();
      return { data: (response.data ?? null) as JournalRowDb | null, error: response.error };
    });
    last = result;
    if (!result.error && result.data) return result;
    if (!isRetryableJournalSchemaError(result.error?.message)) return result;
  }
  return last;
}

export async function updateJournalWithPayloadFallback(
  supabase: SupabaseClient,
  payloads: Record<string, unknown>[],
  filters: { userId: string; accountId: string; id: string },
): Promise<JournalMutationResult> {
  let last: JournalMutationResult = { data: null, error: null };
  for (const payload of payloads) {
    const result = await queryJournalWithSelectFallback<JournalRowDb>(async (select) => {
      const response = await supabase
        .from("journal_entries")
        .update(payload)
        .eq("user_id", filters.userId)
        .eq("account_id", filters.accountId)
        .eq("id", filters.id)
        .select(select)
        .single();
      return { data: (response.data ?? null) as JournalRowDb | null, error: response.error };
    });
    last = result;
    if (!result.error && result.data) return result;
    if (!isRetryableJournalSchemaError(result.error?.message)) return result;
  }
  return last;
}
