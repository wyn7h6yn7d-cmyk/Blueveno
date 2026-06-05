import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";

export type NotebookSection = {
  id: string;
  title: string;
  body: string;
  empty: string;
  hasContent: boolean;
};

function hasText(value: string | undefined | null): boolean {
  return Boolean(value?.trim());
}

export function buildNotebookSections(row: JournalRow, currency: string): NotebookSection[] {
  const pnl = parsePnlAmount(row.r);
  const pnlLabel = pnl !== null ? formatSignedPnlAmount(pnl, currency) : row.r?.trim() || "—";

  const planLines = [
    row.moodState ? `Mood: ${row.moodState}` : null,
    row.setup ? `Setup: ${row.setup}` : null,
    row.sessionTag ? `Session: ${row.sessionTag}` : null,
    row.marketCondition ? `Market: ${row.marketCondition}` : null,
  ].filter((line): line is string => Boolean(line));

  const executionLines = [
    `Result: ${pnlLabel}`,
    row.tag && row.tag !== "None" ? `Mistake tag: ${row.tag}` : null,
    row.time ? `Logged at: ${row.time}` : null,
  ].filter((line): line is string => Boolean(line));

  return [
    {
      id: "plan",
      title: "Pre-market plan",
      body: planLines.join("\n"),
      empty: "Add mood, setup, session, or market tags when logging to capture pre-session context.",
      hasContent: planLines.length > 0,
    },
    {
      id: "execution",
      title: "Execution",
      body: executionLines.join("\n"),
      empty: "Result and tags appear here after you log the day.",
      hasContent: executionLines.length > 0,
    },
    {
      id: "review",
      title: "Review",
      body: row.note?.trim() ?? "",
      empty: "No review note yet. Add context in the note field when logging or editing.",
      hasContent: hasText(row.note),
    },
    {
      id: "lesson",
      title: "Lessons learned",
      body: row.lessonLearned?.trim() ?? "",
      empty: "Capture one takeaway in the lesson field on your next edit.",
      hasContent: hasText(row.lessonLearned),
    },
  ];
}
