"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

export type ExportAccount = {
  id: string;
  name: string;
  account_type: string | null;
};

export type ExportJournalEntry = {
  account_id: string | null;
  entry_date: string | null;
  symbol: string | null;
  pnl: number | null;
  currency: string | null;
  mood_score: number | null;
  followed_plan: boolean | null;
  respected_stop: boolean | null;
  no_revenge_trade: boolean | null;
  setup_tag: string | null;
  mistake_tag: string | null;
  session_tag: string | null;
  market_condition: string | null;
  note: string | null;
  lesson_learned: string | null;
  chart_link: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function fetchOwnedAccounts(supabase: SupabaseClient): Promise<ExportAccount[]> {
  const { data, error } = await supabase
    .from("trading_accounts")
    .select("id,name,account_type")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ExportAccount[];
}

export async function fetchJournalEntriesForExport(
  supabase: SupabaseClient,
  accountId?: string,
): Promise<ExportJournalEntry[]> {
  let query = supabase
    .from("journal_entries")
    .select(
      "account_id,entry_date,symbol,pnl,currency,mood_score,followed_plan,respected_stop,no_revenge_trade,setup_tag,mistake_tag,session_tag,market_condition,note,lesson_learned,chart_link,created_at,updated_at",
    )
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (accountId) {
    query = query.eq("account_id", accountId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as ExportJournalEntry[];
}
