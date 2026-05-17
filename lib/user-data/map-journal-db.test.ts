import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeDisciplineScorePercent } from "@/lib/user-data/discipline-stats";
import { mapJournalRowFromDb } from "@/lib/user-data/map-journal-db";

describe("mapJournalRowFromDb discipline", () => {
  it("maps behavior columns when present (including false)", () => {
    const row = mapJournalRowFromDb({
      id: "a",
      created_at: "2026-05-01T00:00:00Z",
      entry_time: "Day close",
      symbol: "NQ",
      setup: "Pullback",
      r_value: "100",
      tag: "None",
      followed_plan: false,
      respected_stop: true,
      no_revenge_trade: false,
    });

    assert.equal(row.followedPlan, false);
    assert.equal(row.respectedStop, true);
    assert.equal(row.noRevengeTrade, false);
    assert.equal(computeDisciplineScorePercent([row]), 33);
  });

  it("treats null discipline values as missing, not false", () => {
    const row = mapJournalRowFromDb({
      id: "c",
      created_at: "2026-05-01T00:00:00Z",
      entry_time: "Day close",
      symbol: "NQ",
      setup: "Pullback",
      r_value: "100",
      tag: "None",
      followed_plan: null,
      respected_stop: null,
      no_revenge_trade: null,
    });

    assert.equal(row.followedPlan, undefined);
    assert.equal(row.respectedStop, undefined);
    assert.equal(row.noRevengeTrade, undefined);
    assert.equal(computeDisciplineScorePercent([row]), null);
  });

  it("leaves discipline undefined when behavior columns were not selected", () => {
    const row = mapJournalRowFromDb({
      id: "b",
      created_at: "2026-05-01T00:00:00Z",
      entry_time: "Day close",
      symbol: "NQ",
      setup: "Pullback",
      r_value: "100",
      tag: "None",
    });

    assert.equal(row.followedPlan, undefined);
    assert.equal(computeDisciplineScorePercent([row]), null);
  });
});
