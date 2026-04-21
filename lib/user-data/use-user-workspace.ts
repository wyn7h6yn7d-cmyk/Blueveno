"use client";

import { useCallback, useEffect, useState } from "react";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";
import { createClient } from "@/lib/supabase/client";

export function useUserWorkspace(userId: string | undefined) {
  const [data, setData] = useState<UserWorkspaceSnapshot>(EMPTY_WORKSPACE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFromDb() {
      if (!userId) {
        if (!cancelled) {
          setData(EMPTY_WORKSPACE);
          setReady(true);
        }
        return;
      }
      const supabase = createClient();
      const { data: rows, error } = await supabase
        .from("journal_entries")
        .select("id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error || !rows) {
        setData(EMPTY_WORKSPACE);
        setReady(true);
        return;
      }
      setData({
        version: 1,
        journal: rows.map((r) => ({
          id: r.id as string,
          createdAt: (r.created_at as string | null) ?? undefined,
          entryDate: (r.entry_date as string | null) ?? undefined,
          time: (r.entry_time as string) ?? "",
          sym: (r.symbol as string) ?? "",
          setup: (r.setup as string) ?? "—",
          r: (r.r_value as string) ?? "",
          tag: (r.tag as string) ?? "Manual",
          note: (r.note as string | null) ?? undefined,
          tradingViewUrl: (r.tradingview_url as string | null) ?? undefined,
        })),
      });
      setReady(true);
    }

    void loadFromDb();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addRow = useCallback(
    async (row: Omit<JournalRow, "id">) => {
      if (!userId) return;
      const supabase = createClient();
      const { data: inserted, error } = await supabase
        .from("journal_entries")
        .insert({
          user_id: userId,
          entry_date: row.entryDate ?? null,
          entry_time: row.time,
          symbol: row.sym,
          setup: row.setup,
          r_value: row.r,
          tag: row.tag,
          note: row.note ?? null,
          tradingview_url: row.tradingViewUrl ?? null,
        })
        .select("id, created_at, entry_date, entry_time, symbol, setup, r_value, tag, note, tradingview_url")
        .single();
      if (error || !inserted) return;
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
    },
    [userId],
  );

  const removeRow = useCallback(
    async (id: string) => {
      if (!userId) return;
      const supabase = createClient();
      const { error } = await supabase.from("journal_entries").delete().eq("user_id", userId).eq("id", id);
      if (error) return;
      setData((prev) => ({ ...prev, journal: prev.journal.filter((j) => j.id !== id) }));
    },
    [userId],
  );

  const replaceAll = useCallback(
    (next: UserWorkspaceSnapshot) => {
      void userId;
      setData(next);
    },
    [userId],
  );

  return { data, ready, addRow, removeRow, replaceAll };
}
