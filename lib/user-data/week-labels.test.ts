import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatWeekHeadline, formatWeekTitle, isoWeekNumberFromDayKey } from "@/lib/user-data/week-labels";

describe("week-labels", () => {
  it("formats ISO week number from Monday week start", () => {
    assert.equal(isoWeekNumberFromDayKey("2026-05-11"), 20);
    assert.equal(formatWeekTitle("2026-05-11"), "Week 20");
    assert.equal(formatWeekHeadline("2026-05-11"), "Week 20 · May 11–17");
  });
});
