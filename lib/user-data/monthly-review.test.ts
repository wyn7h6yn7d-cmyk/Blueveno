import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MONTHLY_REVIEW_MIN_TRADED_DAYS,
  computeMonthlyReview,
  formatMonthKeyLabel,
} from "@/lib/user-data/monthly-review";
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

describe("monthly-review", () => {
  it("uses preferred month and marks partial reports below threshold", () => {
    const monthKey = "2026-05";
    const entries = [
      row({ id: "a", entryDate: "2026-05-02", r: "120" }),
      row({ id: "b", entryDate: "2026-05-05", r: "-40" }),
    ];
    const review = computeMonthlyReview(entries, [], monthKey);
    assert.equal(review.monthKey, monthKey);
    assert.equal(review.monthLabel, formatMonthKeyLabel(monthKey));
    assert.equal(review.tradedDays, 2);
    assert.equal(review.isPartial, true);
    assert.equal(MONTHLY_REVIEW_MIN_TRADED_DAYS, 3);
    assert.equal(review.monthPnl, 80);
  });

  it("returns full month report at or above traded-day threshold", () => {
    const monthKey = "2026-05";
    const entries = [
      row({ id: "a", entryDate: "2026-05-02", r: "50" }),
      row({ id: "b", entryDate: "2026-05-05", r: "30" }),
      row({ id: "c", entryDate: "2026-05-08", r: "-10" }),
    ];
    const review = computeMonthlyReview(entries, [], monthKey);
    assert.equal(review.tradedDays, 3);
    assert.equal(review.isPartial, false);
    assert.ok(review.bestDay);
  });
});
