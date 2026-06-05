"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJournalEntryForUser } from "@/lib/user-data/fetch-journal-entry-client";
import { mapJournalRowFromDb } from "@/lib/user-data/map-journal-db";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { JournalEntryEditClient } from "@/components/journal/journal-entry-edit-client";
import { JOURNAL_ADD_ENTRY_HREF } from "@/lib/journal/journal-tab";
import { Button } from "@/components/ui/button";

type Props = {
  userId: string;
  entryId: string;
  initialWorkspace: UserWorkspaceSnapshot;
};

export function JournalEntryEditLoader({ userId, entryId, initialWorkspace }: Props) {
  const [row, setRow] = useState<JournalRow | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setPhase("loading");
      setErrorMsg(null);
      const result = await fetchJournalEntryForUser(userId, entryId, () => cancelled);
      if (cancelled) return;

      if (!result.ok) {
        if (result.reason === "missing") {
          setPhase("missing");
          return;
        }
        setErrorMsg(result.message ?? (result.reason === "session" ? "Session not ready." : "Could not load entry."));
        setPhase("error");
        return;
      }
      setRow(mapJournalRowFromDb(result.data));
      setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, entryId, retryKey]);

  if (phase === "loading") {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 max-w-full animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="min-h-[18rem] animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
        <p className="text-[15px] leading-relaxed text-zinc-300">
          {errorMsg ?? "Could not load this entry. Try again in a moment."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => setRetryKey((k) => k + 1)}>
            Try again
          </Button>
          <Link
            href={JOURNAL_ADD_ENTRY_HREF}
            className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-[14px] text-zinc-400 transition hover:text-zinc-200"
          >
            Back to journal
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "missing" || !row) {
    return (
      <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8">
        <p className="text-[15px] leading-relaxed text-zinc-300">
          This journal entry is no longer available.
        </p>
        <Link
          href={JOURNAL_ADD_ENTRY_HREF}
          className="inline-flex h-10 items-center justify-center rounded-xl px-4 text-[14px] text-zinc-400 transition hover:text-zinc-200"
        >
          Back to journal
        </Link>
      </div>
    );
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
