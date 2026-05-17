import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEFAULT_STATS_TAB, parseStatsTab } from "@/lib/stats/stats-tabs";

describe("stats-tabs", () => {
  it("defaults to summary", () => {
    assert.equal(parseStatsTab(null), DEFAULT_STATS_TAB);
    assert.equal(parseStatsTab("summary"), "summary");
  });

  it("maps legacy section ids", () => {
    assert.equal(parseStatsTab("stats-behavior"), "behavior");
  });

  it("falls back for unknown values", () => {
    assert.equal(parseStatsTab("unknown"), DEFAULT_STATS_TAB);
  });
});
