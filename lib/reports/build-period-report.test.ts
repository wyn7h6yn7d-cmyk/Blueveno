import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildPeriodReport } from "@/lib/reports/build-period-report";
import type { JournalRow } from "@/lib/user-data/types";

function row(partial: Partial<JournalRow>): JournalRow {
  return {
    id: partial.id ?? "1",
    time: "Day close",
    sym: partial.sym ?? "NQ",
    setup: partial.setup ?? "Pullback",
    r: partial.r ?? "100",
    tag: partial.tag ?? "None",
    ...partial,
  };
}

describe("build-period-report", () => {
  it("returns empty state when no entries in period", () => {
    const report = buildPeriodReport({
      reportType: "weekly_report",
      entries: [row({ entryDate: "2026-01-01", r: "50" })],
      from: "2026-05-01",
      to: "2026-05-31",
      currency: "USD",
    });
    assert.equal(report.hasData, false);
    assert.equal(report.tradeCount, 0);
  });

  it("builds trades export rows", () => {
    const entries = [
      row({ id: "1", setup: "Pullback", r: "100", entryDate: "2026-05-01" }),
      row({ id: "2", setup: "Breakout", r: "-40", entryDate: "2026-05-02" }),
    ];
    const report = buildPeriodReport({
      reportType: "trades_export",
      entries,
      from: "2026-05-01",
      to: "2026-05-31",
      currency: "USD",
    });
    assert.equal(report.hasData, true);
    assert.equal(report.tableRows.length, 2);
    assert.equal(report.mostCommonMistake, null);
  });

  it("builds account report from account rows", () => {
    const report = buildPeriodReport({
      reportType: "account_report",
      entries: [],
      from: "",
      to: "",
      currency: "USD",
      accountRows: [
        { id: "a", name: "Main", type: "Prop", pnl: 500, winRate: 60, tradedDays: 5, disciplineScore: 80 },
      ],
    });
    assert.equal(report.hasData, true);
    assert.equal(report.tableRows.length, 1);
    assert.equal(report.disciplineScore, null);
  });

  it("includes extended preview metrics for weekly report", () => {
    const entries = [
      row({ id: "1", r: "120", entryDate: "2026-05-01", moodState: "Calm" }),
      row({ id: "2", r: "-40", entryDate: "2026-05-02", tag: "Early exit" }),
    ];
    const report = buildPeriodReport({
      reportType: "weekly_report",
      entries,
      from: "2026-05-01",
      to: "2026-05-31",
      currency: "USD",
    });
    assert.equal(report.hasData, true);
    assert.ok(report.avgGreenDay !== null || report.avgRedDay !== null);
    assert.equal(report.mostCommonMistake, "Early exit");
  });
});
