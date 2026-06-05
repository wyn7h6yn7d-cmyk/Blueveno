"use client";

import type { ReactNode } from "react";
import { CalendarRange, NotebookPen, Plus } from "lucide-react";
import { SegmentedTabs } from "@/components/v2/design-system";
import type { JournalWorkspaceTab } from "@/lib/journal/journal-tab";

export type { JournalWorkspaceTab } from "@/lib/journal/journal-tab";

type JournalNotebookLayoutProps = {
  tab: JournalWorkspaceTab;
  onTabChange: (tab: JournalWorkspaceTab) => void;
  reviewIndex: ReactNode;
  reviewDetail: ReactNode;
  addPanel: ReactNode;
  weeklyPanel: ReactNode;
};

const TAB_OPTIONS = [
  { id: "add" as const, label: (
    <span className="inline-flex items-center gap-1.5">
      <Plus className="size-3.5" aria-hidden />
      Add entry
    </span>
  ) },
  { id: "review" as const, label: (
    <span className="inline-flex items-center gap-1.5">
      <NotebookPen className="size-3.5" aria-hidden />
      Review entries
    </span>
  ) },
  { id: "weekly" as const, label: (
    <span className="inline-flex items-center gap-1.5">
      <CalendarRange className="size-3.5" aria-hidden />
      Weekly review
    </span>
  ) },
];

export function JournalNotebookLayout({
  tab,
  onTabChange,
  reviewIndex,
  reviewDetail,
  addPanel,
  weeklyPanel,
}: JournalNotebookLayoutProps) {
  return (
    <section className="space-y-5">
      <SegmentedTabs
        options={TAB_OPTIONS}
        value={tab}
        onChange={(id) => onTabChange(id as JournalWorkspaceTab)}
        aria-label="Journal workspace"
      />

      {tab === "add" ? (
        <div className="min-w-0">{addPanel}</div>
      ) : null}

      {tab === "review" ? (
        <div className="grid min-w-0 gap-5 overflow-x-hidden lg:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] lg:items-start lg:gap-6 xl:gap-8">
          <div className="blueveno-scrollbar min-h-0 min-w-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-1">
            {reviewIndex}
          </div>
          <div className="min-h-0 min-w-0 overflow-x-hidden">{reviewDetail}</div>
        </div>
      ) : null}

      {tab === "weekly" ? (
        <div className="min-w-0">{weeklyPanel}</div>
      ) : null}
    </section>
  );
}
