"use client";

import { useCallback, useEffect, useState } from "react";
import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";
import { addJournalEntry, deleteJournalEntry, loadWorkspace, saveWorkspace } from "@/lib/user-data/storage";

export function useUserWorkspace(userId: string | undefined) {
  const [data, setData] = useState<UserWorkspaceSnapshot>(EMPTY_WORKSPACE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) {
      setData(EMPTY_WORKSPACE);
      setReady(true);
      return;
    }
    setData(loadWorkspace(userId));
    setReady(true);
  }, [userId]);

  const addRow = useCallback(
    (row: Omit<JournalRow, "id">) => {
      if (!userId) return;
      setData(addJournalEntry(userId, row));
    },
    [userId],
  );

  const removeRow = useCallback(
    (id: string) => {
      if (!userId) return;
      setData(deleteJournalEntry(userId, id));
    },
    [userId],
  );

  const replaceAll = useCallback(
    (next: UserWorkspaceSnapshot) => {
      if (!userId) return;
      saveWorkspace(userId, next);
      setData(next);
    },
    [userId],
  );

  return { data, ready, addRow, removeRow, replaceAll };
}
