import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";

const key = (userId: string) => `bv_journal_v1_${userId}`;

export function readJournalCache(userId: string | undefined): UserWorkspaceSnapshot | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserWorkspaceSnapshot;
    if (parsed?.version === 1 && Array.isArray(parsed.journal)) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeJournalCache(userId: string, snapshot: UserWorkspaceSnapshot) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(snapshot));
  } catch {
    /* quota / private mode */
  }
}

export function clearJournalCache(userId: string) {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    /* ignore */
  }
}
