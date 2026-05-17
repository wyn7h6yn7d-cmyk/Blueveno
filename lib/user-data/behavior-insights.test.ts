import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getBehaviorInsights } from "@/lib/user-data/behavior-insights";
import type { JournalRow } from "@/lib/user-data/types";

function row(partial: Partial<JournalRow>): JournalRow {
  return {
    id: partial.id ?? "1",
    time: "",
    sym: partial.sym ?? "EURUSD",
    setup: partial.setup ?? "Pullback",
    r: partial.r ?? "100",
    tag: partial.tag ?? "None",
    ...partial,
  };
}

describe("behavior-insights", () => {
  it("shows empty state below activity threshold", () => {
    const result = getBehaviorInsights({
      entries: [row({ id: "1", r: "50" }), row({ id: "2", r: "-20" })],
      currency: "USD",
    });
    assert.equal(result.showEmptyState, true);
    assert.equal(result.insights.length, 0);
  });

  it("returns at least two insights when enough entries exist without discipline checks", () => {
    const entries = Array.from({ length: 10 }).map((_, i) =>
      row({
        id: String(i),
        r: i % 2 === 0 ? "120" : "-40",
        moodState: i % 3 === 0 ? "Calm" : "Focused",
        entryDate: `2026-05-${String(i + 1).padStart(2, "0")}`,
      }),
    );
    const result = getBehaviorInsights({ entries, currency: "USD" });
    assert.equal(result.showEmptyState, false);
    assert.ok(result.insights.length >= 2);
    assert.equal(result.disciplineDataNote, "Most entries are missing discipline checks.");
  });

  it("uses only explicit false discipline checks in comparisons", () => {
    const entries = [
      ...Array.from({ length: 4 }).map((_, i) =>
        row({
          id: `y-${i}`,
          r: "200",
          followedPlan: true,
          entryDate: `2026-04-0${i + 1}`,
        }),
      ),
      ...Array.from({ length: 4 }).map((_, i) =>
        row({
          id: `n-${i}`,
          r: "-80",
          followedPlan: false,
          entryDate: `2026-04-1${i}`,
        }),
      ),
      row({ id: "missing", r: "10", entryDate: "2026-04-20" }),
    ];
    const result = getBehaviorInsights({ entries, currency: "USD" });
    const planInsight = result.insights.find((item) => item.title.includes("plan"));
    assert.ok(planInsight);
  });
});
