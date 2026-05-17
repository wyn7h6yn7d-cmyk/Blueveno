import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeDisciplineScorePercent,
  entryDisciplineScore,
  formatDisciplinePercent,
  rowDisciplineChecks,
} from "@/lib/user-data/discipline-stats";
import { pickBestWorstWeeks } from "@/lib/user-data/week-aggregation";
import { pickWorstOrSmallestGreenDay } from "@/lib/user-data/stats-display";
import type { JournalRow } from "@/lib/user-data/types";

function row(partial: Partial<JournalRow>): JournalRow {
  return {
    id: "1",
    time: "",
    sym: "EURUSD",
    setup: "Other",
    r: "100",
    tag: "None",
    ...partial,
  };
}

describe("discipline-stats", () => {
  it("returns null when no discipline fields were recorded", () => {
    assert.equal(computeDisciplineScorePercent([row({})]), null);
    assert.equal(formatDisciplinePercent(null), "Not enough data");
  });

  it("scores recorded checks and ignores missing fields", () => {
    assert.equal(
      computeDisciplineScorePercent([
        row({ followedPlan: true, respectedStop: false, noRevengeTrade: true }),
        row({ followedPlan: false, respectedStop: false, noRevengeTrade: false }),
      ]),
      33,
    );
    assert.equal(entryDisciplineScore(row({ followedPlan: true })), 100);
    assert.deepEqual(rowDisciplineChecks(row({})), { completed: 0, total: 0 });
  });
});

describe("week-aggregation", () => {
  it("hides weakest week when only one active week exists", () => {
    const single = [{ weekStart: "2026-05-12", pnl: 120 }];
    assert.deepEqual(pickBestWorstWeeks(single), {
      bestWeek: single[0],
      weakestWeek: null,
    });
  });

  it("returns both weeks when multiple distinct weeks exist", () => {
    const rows = [
      { weekStart: "2026-05-05", pnl: -20 },
      { weekStart: "2026-05-12", pnl: 50 },
    ];
    const { bestWeek, weakestWeek } = pickBestWorstWeeks(rows);
    assert.equal(bestWeek?.weekStart, "2026-05-12");
    assert.equal(weakestWeek?.weekStart, "2026-05-05");
  });
});

describe("stats-display", () => {
  it("labels smallest green when no losing days", () => {
    const picked = pickWorstOrSmallestGreenDay([
      { date: "2026-05-10", pnl: 40 },
      { date: "2026-05-11", pnl: 10 },
    ]);
    assert.equal(picked?.label, "Smallest green day");
    assert.equal(picked?.pnl, 10);
  });
});
