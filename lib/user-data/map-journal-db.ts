import type { JournalRow, UserWorkspaceSnapshot } from "@/lib/user-data/types";

/** Shape returned by `journal_entries` select */
export type JournalRowDb = {
  id: string;
  created_at: string | null;
  /** Absent when DB has not run the entry_date migration yet. */
  entry_date?: string | null;
  entry_time: string;
  symbol: string;
  setup: string;
  r_value: string;
  tag: string;
  note: string | null;
  chart_link_url: string | null;
  mood_state?: "Calm" | "Focused" | "Hesitant" | "Tilted" | null;
  followed_plan?: boolean | null;
  respected_stop?: boolean | null;
  no_revenge_trade?: boolean | null;
  session_tag?: string | null;
  market_condition?: string | null;
  lesson_learned?: string | null;
  rule_checks?: Record<string, unknown> | null;
};

function mapDisciplineFields(
  r: JournalRowDb,
): Pick<JournalRow, "followedPlan" | "respectedStop" | "noRevengeTrade"> {
  const hasBehaviorColumns =
    Object.prototype.hasOwnProperty.call(r, "followed_plan") ||
    Object.prototype.hasOwnProperty.call(r, "respected_stop") ||
    Object.prototype.hasOwnProperty.call(r, "no_revenge_trade");

  if (!hasBehaviorColumns) {
    return { followedPlan: undefined, respectedStop: undefined, noRevengeTrade: undefined };
  }

  return {
    followedPlan: mapOptionalBool(r.followed_plan),
    respectedStop: mapOptionalBool(r.respected_stop),
    noRevengeTrade: mapOptionalBool(r.no_revenge_trade),
  };
}

function mapOptionalBool(value: boolean | null | undefined): boolean | undefined {
  if (value === null || value === undefined) return undefined;
  return value;
}

export function mapJournalRowFromDb(r: JournalRowDb): JournalRow {
  return {
    id: r.id,
    createdAt: r.created_at ?? undefined,
    entryDate: r.entry_date ?? undefined,
    time: r.entry_time ?? "",
    sym: r.symbol ?? "",
    setup: r.setup ?? "—",
    r: r.r_value ?? "",
    tag: r.tag ?? "Manual",
    note: r.note ?? undefined,
    chartLinkUrl: r.chart_link_url ?? undefined,
    moodState: r.mood_state ?? undefined,
    ...mapDisciplineFields(r),
    sessionTag: r.session_tag ?? undefined,
    marketCondition: r.market_condition ?? undefined,
    lessonLearned: r.lesson_learned ?? undefined,
    ruleChecks: r.rule_checks
      ? Object.fromEntries(
          Object.entries(r.rule_checks).map(([k, v]) => [k, Boolean(v)]),
        )
      : undefined,
  };
}

export function mapJournalRowsFromDb(rows: JournalRowDb[]): UserWorkspaceSnapshot {
  return {
    version: 1,
    journal: rows.map(mapJournalRowFromDb),
  };
}
