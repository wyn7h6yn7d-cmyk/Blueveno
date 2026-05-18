import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";

const keyV2 = (userId: string) => `bv_journal_v2_${userId}`;
const keyV1 = (userId: string) => `bv_journal_v1_${userId}`;

export function readJournalCache(userId: string | undefined): UserWorkspaceSnapshot | null {
  if (typeof window === "undefined" || !userId) return null;
  for (const storageKey of [keyV2(userId), keyV1(userId)]) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as UserWorkspaceSnapshot;
      if (parsed?.version === 1 && Array.isArray(parsed.journal)) return parsed;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function writeJournalCache(userId: string, snapshot: UserWorkspaceSnapshot) {
  try {
    localStorage.setItem(keyV2(userId), JSON.stringify(snapshot));
    localStorage.removeItem(keyV1(userId));
  } catch {
    /* quota / private mode */
  }
}

export function clearJournalCache(userId: string) {
  try {
    localStorage.removeItem(keyV2(userId));
    localStorage.removeItem(keyV1(userId));
  } catch {
    /* ignore */
  }
}
