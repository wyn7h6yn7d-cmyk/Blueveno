"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mapJournalRowFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { JournalEntryEditClient } from "@/components/journal/journal-entry-edit-client";

type Props = {
  userId: string;
  entryId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

/**
 * Loads the entry with the browser Supabase client (same JWT as journal list).
 * Server Components sometimes return no row on Vercel even when the user is signed in;
 * client fetch matches what Latest activity already proved works under RLS.
 */
export function JournalEntryEditLoader({ userId, entryId, initialWorkspace }: Props) {
  const [row, setRow] = useState<JournalRow | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    void (async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
        .eq("id", entryId)
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("[JournalEntryEditLoader]", error.message);
        setPhase("missing");
        return;
      }
      if (!data) {
        setPhase("missing");
        return;
      }
      setRow(mapJournalRowFromDb(data as JournalRowDb));
      setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [entryId, userId]);

  if (phase === "loading") {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 max-w-full animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="min-h-[18rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </div>
    );
  }

  if (phase === "missing" || !row) {
    notFound();
  }

  return (
    <JournalEntryEditClient
      userId={userId}
      entryId={entryId}
      initialWorkspace={initialWorkspace}
      initialRow={row}
    />
  );
}
