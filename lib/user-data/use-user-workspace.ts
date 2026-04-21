"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

function toUserDbError(message: string | undefined) {
  const normalized = (message ?? "").toLowerCase();
  if (normalized.includes("journal_entries") && normalized.includes("could not find")) {
    return "Database is not initialized yet (journal_entries table missing). Run Supabase migrations and reload.";
  }
  return message ?? "Could not save entry.";
}

type JournalRowDb = {
  id: string;
  created_at: string | null;
  entry_date: string | null;
  entry_time: string;
  symbol: string;
  setup: string;
  r_value: string;
  tag: string;
  note: string | null;
  tradingview_url: string | null;
};

function mapRows(rows: JournalRowDb[]): UserWorkspaceSnapshot {
  return {
    version: 1,
    journal: rows.map((r) => ({
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
    })),
  };
}

function hasBearerSession(supabase: SupabaseClient) {
  return supabase.auth.getSession().then(({ data: { session } }) => Boolean(session?.access_token));
}

/**
 * After a full page reload, `createBrowserClient` may run before the session is
 * hydrated from cookies. We wait until both `getUser` matches and a session with
 * an access token exists so PostgREST carries a JWT (RLS otherwise returns [] with no error).
 */
async function waitForSessionUser(supabase: SupabaseClient, userId: string, isCancelled: () => boolean) {
  for (let attempt = 0; attempt < 45; attempt++) {
    if (isCancelled()) return false;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    const tokenOk = await hasBearerSession(supabase);
    if (!error && user?.id === userId && tokenOk) return true;
    if (attempt === 8) {
      await supabase.auth.refreshSession().catch(() => undefined);
    }
    await new Promise((r) => setTimeout(r, 50 + Math.min(attempt, 20) * 20));
  }
  return false;
}

export function useUserWorkspace(userId: string | undefined) {
  const [data, setData] = useState<UserWorkspaceSnapshot>(EMPTY_WORKSPACE);
  const [ready, setReady] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const userIdRef = useRef(userId);
  const didTokenRefreshRefetch = useRef(false);
  userIdRef.current = userId;

  useEffect(() => {
    didTokenRefreshRefetch.current = false;
    let cancelled = false;
    const isCancelled = () => cancelled;
    const supabase = createClient();

    async function fetchJournalRows(): Promise<void> {
      const uid = userIdRef.current;
      if (!uid) return;

      const selectRows = () =>
        supabase
          .from("journal_entries")
          .select("id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
          .eq("user_id", uid)
          .order("created_at", { ascending: false });

      let resolved: JournalRowDb[] = [];
      let queryError: string | undefined;

      const pull = async () => {
        const { data: batch, error } = await selectRows();
        if (cancelled) return false;
        if (error) {
          queryError = error.message;
          return false;
        }
        resolved = (batch ?? []) as JournalRowDb[];
        return true;
      };

      // RLS often returns [] (no error) before JWT reaches PostgREST — retry only when needed.
      if (!(await pull())) {
        /* handled below */
      } else if (resolved.length === 0) {
        for (let attempt = 0; attempt < 5 && resolved.length === 0; attempt++) {
          if (cancelled) return;
          const tokenOk = await hasBearerSession(supabase);
          if (tokenOk) {
            await new Promise((r) => setTimeout(r, 140));
            if (!(await pull())) break;
            if (resolved.length > 0) break;
            break;
          }
          await waitForSessionUser(supabase, uid, isCancelled);
          if (cancelled) return;
          await new Promise((r) => setTimeout(r, 80 + attempt * 50));
          if (!(await pull())) break;
        }
      }

      if (cancelled) return;
      if (queryError !== undefined) {
        setLastError(toUserDbError(queryError));
        setData(EMPTY_WORKSPACE);
        setReady(true);
        return;
      }
      setData(mapRows(resolved));
      setLastError(null);
      setReady(true);
    }

    async function load() {
      if (!userId) {
        setData(EMPTY_WORKSPACE);
        setLastError(null);
        setReady(true);
        return;
      }

      setReady(false);
      setLastError(null);

      const sessionOk = await waitForSessionUser(supabase, userId, isCancelled);
      if (cancelled) return;

      if (!sessionOk) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (user?.id !== userId) {
          setLastError("Session not ready. Refresh the page or sign in again.");
        }
      }

      await fetchJournalRows();
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") return;
      const sameUser = session?.user?.id === userIdRef.current;
      if (!sameUser) return;

      // After reload, the first usable JWT sometimes arrives only on TOKEN_REFRESHED.
      if (event === "TOKEN_REFRESHED") {
        if (didTokenRefreshRefetch.current) return;
        didTokenRefreshRefetch.current = true;
        void fetchJournalRows();
        return;
      }

      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
        void fetchJournalRows();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [userId]);

  const addRow = useCallback(
    async (row: Omit<JournalRow, "id">) => {
      if (!userId) return { ok: false as const, error: "Not signed in." };
      const supabase = createClient();
      setLastError(null);

      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id !== userId) {
        const msg = "Session not ready. Refresh the page and try again.";
        setLastError(msg);
        return { ok: false as const, error: msg };
      }

      const basePayload = {
        user_id: userId,
        entry_time: row.time,
        symbol: row.sym,
        setup: row.setup,
        r_value: row.r,
        tag: row.tag,
        note: row.note ?? null,
        tradingview_url: row.tradingViewUrl ?? null,
      };

      let insertResult = await supabase
        .from("journal_entries")
        .insert({
          ...basePayload,
          entry_date: row.entryDate ?? null,
        })
        .select("id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
        .single();

      if (insertResult.error?.message?.toLowerCase().includes("entry_date")) {
        insertResult = await supabase
          .from("journal_entries")
          .insert(basePayload)
          .select("id, created_at, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
          .single();
      }

      const { data: inserted, error } = insertResult;
      if (error || !inserted) {
        const msg = toUserDbError(error?.message);
        setLastError(msg);
        return { ok: false as const, error: msg };
      }
      const mapped: JournalRow = {
        id: inserted.id as string,
        createdAt: (inserted.created_at as string | null) ?? undefined,
        entryDate: (inserted.entry_date as string | null) ?? undefined,
        time: (inserted.entry_time as string) ?? "",
        sym: (inserted.symbol as string) ?? "",
        setup: (inserted.setup as string) ?? "—",
        r: (inserted.r_value as string) ?? "",
        tag: (inserted.tag as string) ?? "Manual",
        note: (inserted.note as string | null) ?? undefined,
        tradingViewUrl: (inserted.tradingview_url as string | null) ?? undefined,
      };
      setData((prev) => ({ ...prev, journal: [mapped, ...prev.journal].slice(0, 200) }));
      return { ok: true as const };
    },
    [userId],
  );

  const removeRow = useCallback(
    async (id: string) => {
      if (!userId) return;
      const supabase = createClient();
      const { error } = await supabase.from("journal_entries").delete().eq("user_id", userId).eq("id", id);
      if (error) {
        setLastError(toUserDbError(error.message));
        return;
      }
      setData((prev) => ({ ...prev, journal: prev.journal.filter((j) => j.id !== id) }));
    },
    [userId],
  );

  const replaceAll = useCallback((next: UserWorkspaceSnapshot) => {
    setData(next);
  }, []);

  return { data, ready, lastError, addRow, removeRow, replaceAll };
}
