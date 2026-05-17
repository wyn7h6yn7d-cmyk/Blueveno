"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";
import { createClient } from "@/lib/supabase/client";
import { hasBearerSession, waitForSessionUser } from "@/lib/supabase/wait-for-browser-session";
import { queryJournalWithSelectFallback } from "@/lib/user-data/journal-entry-columns";
import {
  buildJournalInsertPayloads,
  buildJournalUpdatePayloads,
  insertJournalWithPayloadFallback,
  updateJournalWithPayloadFallback,
} from "@/lib/user-data/journal-write-payloads";
import { mapJournalRowFromDb, mapJournalRowsFromDb, type JournalRowDb } from "@/lib/user-data/map-journal-db";
import { clearJournalCache, readJournalCache, writeJournalCache } from "@/lib/user-data/journal-cache";
import { useAccess } from "@/components/access/access-provider";
import { useTradingAccountsWorkspace } from "@/components/trading-accounts/trading-accounts-provider";

function toUserDbError(message: string | undefined) {
  const normalized = (message ?? "").toLowerCase();
  const missingJournalTable =
    normalized.includes("journal_entries") &&
    (normalized.includes("could not find") || normalized.includes("does not exist") || normalized.includes("relation"));
  if (missingJournalTable) {
    return "Journal database setup is incomplete in this environment. Run the latest Supabase migrations and reload.";
  }
  return message ?? "Could not save entry.";
}

function isMissingWeeklyReflectionsTableError(message: string | undefined, code: string | undefined) {
  const normalized = (message ?? "").toLowerCase();
  return (
    (code ?? "").toUpperCase() === "PGRST205" ||
    (normalized.includes("weekly_reflections") &&
      (normalized.includes("does not exist") || normalized.includes("could not find the table")))
  );
}

type UseUserWorkspaceOptions = {
  /** From RSC: always use cookie-backed session so first paint is correct */
  initialWorkspace?: UserWorkspaceSnapshot;
};

export function useUserWorkspace(userId: string | undefined, options?: UseUserWorkspaceOptions) {
  const { canWriteJournal } = useAccess();
  const { activeAccountId: topbarActiveAccountId } = useTradingAccountsWorkspace();
  const initialWorkspace = options?.initialWorkspace;

  /** Object identity from RSC is unstable; stringify lets us detect real server payload changes */
  const workspaceBootstrapKey = useMemo(
    () =>
      initialWorkspace === undefined
        ? ""
        : JSON.stringify({ uid: userId ?? "", workspace: initialWorkspace }),
    [userId, initialWorkspace],
  );

  const [data, setData] = useState<UserWorkspaceSnapshot>(() => initialWorkspace ?? EMPTY_WORKSPACE);
  const [ready, setReady] = useState(() => initialWorkspace !== undefined);
  const [lastError, setLastError] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const userIdRef = useRef(userId);
  const activeAccountIdRef = useRef<string | null>(null);
  const lastFetchedAccountIdRef = useRef<string | null>(null);
  const didTokenRefreshRefetch = useRef(false);
  /** Used to avoid accepting a transient empty client read right after load */
  const mountTimeRef = useRef(0);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  useEffect(() => {
    activeAccountIdRef.current = activeAccountId;
  }, [activeAccountId]);

  useEffect(() => {
    mountTimeRef.current = Date.now();
  }, [userId]);

  /** Hydrate from local cache when there is no RSC snapshot */
  useEffect(() => {
    if (!userId) return;
    if (initialWorkspace !== undefined) {
      if (initialWorkspace.journal.length > 0) writeJournalCache(userId, initialWorkspace);
      return;
    }
    const cached = readJournalCache(userId);
    if (cached && cached.journal.length > 0) {
      /* eslint-disable react-hooks/set-state-in-effect -- hydrate from local cache when no RSC snapshot */
      setData((prev) => (prev.journal.length === 0 ? cached : prev));
      setReady(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [userId, initialWorkspace]);

  useEffect(() => {
    didTokenRefreshRefetch.current = false;
    let cancelled = false;
    const isCancelled = () => cancelled;
    const supabase = createClient();

    // RSC refresh / navigation: merge so empty server props never wipe cache / optimistic rows
    if (initialWorkspace !== undefined) {
      /* eslint-disable react-hooks/set-state-in-effect -- server props after router.refresh / navigation */
      setData((prev) => {
        if (initialWorkspace.journal.length > 0) {
          if (userId) writeJournalCache(userId, initialWorkspace);
          return initialWorkspace;
        }
        if (prev.journal.length > 0) return prev;
        if (userId) {
          const cached = readJournalCache(userId);
          if (cached && cached.journal.length > 0) return cached;
        }
        return initialWorkspace;
      });
      setReady(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }

    async function fetchJournalRows(targetAccountId?: string | null): Promise<void> {
      const uid = userIdRef.current;
      if (!uid) return;
      const accountId = targetAccountId ?? activeAccountIdRef.current;
      if (!accountId) {
        setData(EMPTY_WORKSPACE);
        setLastError(null);
        setReady(true);
        return;
      }

      let resolved: JournalRowDb[] = [];
      let queryError: string | undefined;

      const pull = async () => {
        const { data: batch, error } = await queryJournalWithSelectFallback<JournalRowDb[]>(async (select) => {
          const result = await supabase
            .from("journal_entries")
            .select(select)
            .eq("user_id", uid)
            .eq("account_id", accountId)
            .order("created_at", { ascending: false });
          return { data: (result.data ?? null) as JournalRowDb[] | null, error: result.error };
        });

        if (cancelled) return false;
        if (error) {
          queryError = error.message;
          return false;
        }
        resolved = batch ?? [];
        return true;
      };

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
        setReady(true);
        return;
      }

      setData((prev) => {
        const next = mapJournalRowsFromDb(resolved);
        const sinceMount = Date.now() - mountTimeRef.current;
        // Transient empty client read (RLS/JWT): ignore for a short window, then trust server
        if (
          prev.journal.length > 0 &&
          next.journal.length === 0 &&
          sinceMount < 45_000 &&
          lastFetchedAccountIdRef.current === accountId
        ) {
          return prev;
        }
        lastFetchedAccountIdRef.current = accountId;
        if (uid) writeJournalCache(uid, next);
        return next;
      });
      setLastError(null);
      setReady(true);
    }

    async function load() {
      if (!userId) {
        setData(EMPTY_WORKSPACE);
        setLastError(null);
        setActiveAccountId(null);
        setReady(true);
        return;
      }

      if (initialWorkspace === undefined) {
        setReady(false);
      }
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

      const { data: profileRow, error: profileError } = await supabase
        .from("user_profiles")
        .select("active_trading_account_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (profileError) {
        setLastError(toUserDbError(profileError.message));
        setReady(true);
        return;
      }
      const profileActiveId = (profileRow?.active_trading_account_id as string | null) ?? null;
      let activeId = topbarActiveAccountId ?? profileActiveId;
      if (!activeId) {
        const { data: fallbackAccountRow, error: fallbackAccountError } = await supabase
          .from("trading_accounts")
          .select("id")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (cancelled) return;
        if (fallbackAccountError) {
          setLastError(toUserDbError(fallbackAccountError.message));
          setReady(true);
          return;
        }
        activeId = (fallbackAccountRow?.id as string | null) ?? null;
        if (activeId && activeId !== profileActiveId) {
          const { error: persistError } = await supabase
            .from("user_profiles")
            .update({ active_trading_account_id: activeId, updated_at: new Date().toISOString() })
            .eq("user_id", userId);
          if (cancelled) return;
          if (persistError) {
            setLastError(toUserDbError(persistError.message));
            setReady(true);
            return;
          }
        }
      }
      const previousActiveId = activeAccountIdRef.current;
      setActiveAccountId(activeId);
      activeAccountIdRef.current = activeId;
      if (previousActiveId !== activeId) {
        setData(EMPTY_WORKSPACE);
      }

      if (!activeId) {
        setData(EMPTY_WORKSPACE);
        setReady(true);
        setLastError(null);
        return;
      }

      await fetchJournalRows(activeId);
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") return;
      const sameUser = session?.user?.id === userIdRef.current;
      if (!sameUser) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- workspaceBootstrapKey encodes initialWorkspace + userId
  }, [userId, workspaceBootstrapKey, activeAccountId, topbarActiveAccountId]);

  const addRow = useCallback(
    async (row: Omit<JournalRow, "id">) => {
      if (!userId) return { ok: false as const, error: "Not signed in." };
      if (!activeAccountId) {
        return { ok: false as const, error: "Select an active trading account before adding entries." };
      }
      if (!canWriteJournal) {
        return {
          ok: false as const,
          error: "Your trial has ended. Upgrade to Blueveno Premium to log new days.",
        };
      }
      const supabase = createClient();
      setLastError(null);

      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id !== userId) {
        const msg = "Session not ready. Refresh the page and try again.";
        setLastError(msg);
        return { ok: false as const, error: msg };
      }

      const { data: inserted, error } = await insertJournalWithPayloadFallback(
        supabase,
        buildJournalInsertPayloads(row, userId, activeAccountId),
      );
      if (error || !inserted) {
        const msg = toUserDbError(error?.message);
        setLastError(msg);
        return { ok: false as const, error: msg };
      }
      const mapped = mapJournalRowFromDb(inserted);
      setData((prev) => {
        const next = { ...prev, journal: [mapped, ...prev.journal].slice(0, 200) };
        if (userId) writeJournalCache(userId, next);
        return next;
      });
      return { ok: true as const };
    },
    [userId, canWriteJournal, activeAccountId],
  );

  const updateRow = useCallback(
    async (id: string, row: Omit<JournalRow, "id" | "createdAt">) => {
      if (!userId) return { ok: false as const, error: "Not signed in." };
      if (!activeAccountId) {
        return { ok: false as const, error: "Select an active trading account before editing entries." };
      }
      if (!canWriteJournal) {
        return {
          ok: false as const,
          error: "Your trial has ended. Upgrade to Blueveno Premium to edit entries.",
        };
      }
      const supabase = createClient();
      setLastError(null);

      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.id !== userId) {
        const msg = "Session not ready. Refresh the page and try again.";
        setLastError(msg);
        return { ok: false as const, error: msg };
      }

      const { data: updated, error } = await updateJournalWithPayloadFallback(
        supabase,
        buildJournalUpdatePayloads(row),
        { userId, accountId: activeAccountId, id },
      );
      if (error || !updated) {
        const msg = toUserDbError(error?.message);
        setLastError(msg);
        return { ok: false as const, error: msg };
      }
      const mapped = mapJournalRowFromDb(updated);
      setData((prev) => {
        const next = {
          ...prev,
          journal: prev.journal.map((j) => (j.id === id ? mapped : j)),
        };
        if (userId) writeJournalCache(userId, next);
        return next;
      });
      return { ok: true as const };
    },
    [userId, canWriteJournal, activeAccountId],
  );

  const removeRow = useCallback(
    async (id: string) => {
      if (!userId) return { ok: false as const, error: "Not signed in." };
      if (!activeAccountId) {
        return { ok: false as const, error: "Select an active trading account before deleting entries." };
      }
      if (!canWriteJournal) {
        const msg =
          "Your trial has ended. Upgrade to Blueveno Premium to modify journal entries.";
        setLastError(msg);
        return { ok: false as const, error: msg };
      }
      setLastError(null);
      const supabase = createClient();
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("user_id", userId)
        .eq("account_id", activeAccountId)
        .eq("id", id);
      if (error) {
        const msg = toUserDbError(error.message);
        setLastError(msg);
        return { ok: false as const, error: msg };
      }
      setData((prev) => {
        const next = { ...prev, journal: prev.journal.filter((j) => j.id !== id) };
        if (userId) writeJournalCache(userId, next);
        return next;
      });
      return { ok: true as const };
    },
    [userId, canWriteJournal, activeAccountId],
  );

  const resetJournal = useCallback(async () => {
    if (!userId) return { ok: false as const, error: "Not signed in." };
    if (!activeAccountId) return { ok: false as const, error: "Select an active trading account first." };
    setLastError(null);
    const supabase = createClient();

    const { data: authUser } = await supabase.auth.getUser();
    if (authUser.user?.id !== userId) {
      const msg = "Session not ready. Refresh the page and try again.";
      setLastError(msg);
      return { ok: false as const, error: msg };
    }

    const { error: reflectionsError } = await supabase
      .from("weekly_reflections")
      .delete()
      .eq("user_id", userId)
      .eq("account_id", activeAccountId);
    if (reflectionsError && !isMissingWeeklyReflectionsTableError(reflectionsError.message, reflectionsError.code)) {
      const msg = toUserDbError(reflectionsError.message);
      setLastError(msg);
      return { ok: false as const, error: msg };
    }

    const { error } = await supabase.from("journal_entries").delete().eq("user_id", userId).eq("account_id", activeAccountId);
    if (error) {
      const msg = toUserDbError(error.message);
      setLastError(msg);
      return { ok: false as const, error: msg };
    }

    setData(EMPTY_WORKSPACE);
    clearJournalCache(userId);
    return { ok: true as const };
  }, [userId, activeAccountId]);

  const replaceAll = useCallback((next: UserWorkspaceSnapshot) => {
    setData(next);
    if (userId) writeJournalCache(userId, next);
  }, [userId]);

  return { data, ready, lastError, activeAccountId, addRow, updateRow, removeRow, resetJournal, replaceAll };
}
