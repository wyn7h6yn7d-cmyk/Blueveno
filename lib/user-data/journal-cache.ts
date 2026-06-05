import type { UserWorkspaceSnapshot } from "@/lib/user-data/types";

const keyV3 = (userId: string, accountId: string) => `bv_journal_v3_${userId}_${accountId}`;
const keyV2 = (userId: string) => `bv_journal_v2_${userId}`;
const keyV1 = (userId: string) => `bv_journal_v1_${userId}`;

export function readJournalCache(
  userId: string | undefined,
  accountId?: string | null,
): UserWorkspaceSnapshot | null {
  if (typeof window === "undefined" || !userId) return null;

  const keys: string[] = accountId
    ? [keyV3(userId, accountId)]
    : [keyV2(userId), keyV1(userId)];

  for (const storageKey of keys) {
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

export function writeJournalCache(userId: string, accountId: string, snapshot: UserWorkspaceSnapshot) {
  try {
    localStorage.setItem(keyV3(userId, accountId), JSON.stringify(snapshot));
    localStorage.removeItem(keyV2(userId));
    localStorage.removeItem(keyV1(userId));
  } catch {
    /* quota / private mode */
  }
}

export function clearJournalCache(userId: string, accountId?: string) {
  try {
    if (accountId) {
      localStorage.removeItem(keyV3(userId, accountId));
    } else {
      const prefix = `bv_journal_v3_${userId}_`;
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const k = localStorage.key(i);
        if (k?.startsWith(prefix)) localStorage.removeItem(k);
      }
    }
    localStorage.removeItem(keyV2(userId));
    localStorage.removeItem(keyV1(userId));
  } catch {
    /* ignore */
  }
}
