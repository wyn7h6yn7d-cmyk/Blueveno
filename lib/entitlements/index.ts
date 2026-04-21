/**
 * Product entitlements — pure helpers + types. Mirrors Postgres RLS on `journal_entries`.
 *
 * Server: `import { loadAccessForUser } from "@/lib/access/load-access"` then use helpers below.
 * Client: `useAccess()` from `AccessProvider`.
 */

export type { AccessContext, AccessState, UserProfileRow } from "@/lib/access/types";
export { resolveAccess, toClientAccess } from "@/lib/access/resolve-access";

import type { AccessContext } from "@/lib/access/types";

/** Whether the user may insert/update/delete journal rows (server + UI should agree). */
export function canWriteJournal(access: AccessContext): boolean {
  return access.canWriteJournal;
}

/** Throws if journal writes are not allowed — call from Server Actions before mutating data. */
export function assertJournalWriteAccess(access: AccessContext): void {
  if (!access.canWriteJournal) {
    throw new Error("Upgrade to Blueveno Premium to add or edit trading days.");
  }
}

/** Read-only period after trial (still signed in). */
export function isReadOnlyAfterTrial(access: AccessContext): boolean {
  return access.isReadOnlyTrial;
}
