export type JournalWorkspaceTab = "add" | "review" | "weekly";

/** Primary Journal destination — Add entry (sidebar, CTAs, redirects). */
export const JOURNAL_ADD_ENTRY_HREF = "/app/journal?tab=add";
export const JOURNAL_REVIEW_HREF = "/app/journal?tab=review";
export const JOURNAL_WEEKLY_HREF = "/app/journal?tab=week";

export function journalTabToParam(tab: JournalWorkspaceTab): string {
  return tab === "weekly" ? "week" : tab;
}

export function parseJournalTabParam(value: string | null): JournalWorkspaceTab | null {
  if (value === "add") return "add";
  if (value === "review") return "review";
  if (value === "week" || value === "weekly") return "weekly";
  return null;
}

/** Resolve active tab from URL search params. Default: Add entry. */
export function resolveJournalTab(searchParams: URLSearchParams): JournalWorkspaceTab {
  const fromTab = parseJournalTabParam(searchParams.get("tab"));
  if (fromTab) return fromTab;
  if (searchParams.get("week")) return "weekly";
  return "add";
}

export function parseJournalHashTab(hash: string): JournalWorkspaceTab | null {
  if (hash === "#add") return "add";
  if (hash === "#weekly-review") return "weekly";
  return null;
}
