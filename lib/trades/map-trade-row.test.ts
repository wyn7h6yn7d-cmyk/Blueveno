import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterTradeRowsByResult,
  mapJournalRowToTradeRow,
} from "@/lib/trades/map-trade-row";
import type { JournalRow } from "@/lib/user-data/types";

function row(partial: Partial<JournalRow>): JournalRow {
  return {
    id: partial.id ?? "1",
    time: "09:30",
    sym: partial.sym ?? "EURUSD",
    setup: partial.setup ?? "Pullback",
    r: partial.r ?? "100",
    tag: partial.tag ?? "None",
    ...partial,
  };
}

describe("map-trade-row", () => {
  it("maps journal fields to trade row shape", () => {
    const mapped = mapJournalRowToTradeRow(
      row({
        entryDate: "2026-05-12",
        moodState: "Calm",
        sessionTag: "London",
        followedPlan: true,
        note: "Clean execution",
        chartLinkUrl: "https://example.com/chart",
        tag: "Early exit",
      }),
      "USD",
    );
    assert.equal(mapped.symbol, "EURUSD");
    assert.equal(mapped.mood, "Calm");
    assert.equal(mapped.session, "London");
    assert.equal(mapped.hasNotes, true);
    assert.equal(mapped.hasChart, true);
    assert.equal(mapped.exitBehavior, "Early exit");
    assert.equal(mapped.mistakeTag, "Early exit");
    assert.equal(mapped.disciplineScore, 100);
    assert.equal(mapped.accountName, "—");
  });

  it("filters wins and losses", () => {
    const rows = [
      mapJournalRowToTradeRow(row({ id: "w", r: "50" }), "USD"),
      mapJournalRowToTradeRow(row({ id: "l", r: "-20" }), "USD"),
      mapJournalRowToTradeRow(row({ id: "f", r: "0" }), "USD"),
    ];
    assert.equal(filterTradeRowsByResult(rows, "wins").length, 1);
    assert.equal(filterTradeRowsByResult(rows, "losses").length, 1);
  });
});
