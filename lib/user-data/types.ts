export type JournalRow = {
  id: string;
  time: string;
  sym: string;
  setup: string;
  r: string;
  tag: string;
  /** Optional — journal page detail */
  note?: string;
};

export type UserWorkspaceSnapshot = {
  version: 1;
  journal: JournalRow[];
};

export const EMPTY_WORKSPACE: UserWorkspaceSnapshot = { version: 1, journal: [] };
