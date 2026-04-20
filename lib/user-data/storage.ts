import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";
import { EMPTY_WORKSPACE } from "@/lib/user-data/types";

const KEY = (userId: string) => `bv_workspace_v1_${userId}`;

export function loadWorkspace(userId: string): UserWorkspaceSnapshot {
  if (typeof window === "undefined") return EMPTY_WORKSPACE;
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return { ...EMPTY_WORKSPACE };
    const parsed = JSON.parse(raw) as UserWorkspaceSnapshot;
    if (parsed?.version !== 1 || !Array.isArray(parsed.journal)) return { ...EMPTY_WORKSPACE };
    return parsed;
  } catch {
    return { ...EMPTY_WORKSPACE };
  }
}

export function saveWorkspace(userId: string, data: UserWorkspaceSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY(userId), JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function addJournalEntry(userId: string, row: Omit<JournalRow, "id">): UserWorkspaceSnapshot {
  const cur = loadWorkspace(userId);
  const entry: JournalRow = {
    ...row,
    id: crypto.randomUUID(),
  };
  const next: UserWorkspaceSnapshot = {
    ...cur,
    journal: [entry, ...cur.journal].slice(0, 200),
  };
  saveWorkspace(userId, next);
  return next;
}

export function deleteJournalEntry(userId: string, id: string): UserWorkspaceSnapshot {
  const cur = loadWorkspace(userId);
  const next: UserWorkspaceSnapshot = {
    ...cur,
    journal: cur.journal.filter((j) => j.id !== id),
  };
  saveWorkspace(userId, next);
  return next;
}
