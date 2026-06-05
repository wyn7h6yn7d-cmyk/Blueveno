import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBalanceEquityCurve,
  computeCapitalProgress,
  drawdownStatsFromEquity,
  estimatedBalance,
} from "@/lib/capital/compute-capital-progress";
import type { JournalRow } from "@/lib/user-data/types";

function row(partial: Partial<JournalRow>): JournalRow {
  return {
    id: partial.id ?? "1",
    time: "Day close",
    sym: "NQ",
    setup: "Pullback",
    r: partial.r ?? "100",
    tag: "None",
    entryDate: partial.entryDate ?? "2026-05-01",
    ...partial,
  };
}

describe("compute-capital-progress", () => {
  it("estimates balance from starting balance and net pnl", () => {
    assert.equal(estimatedBalance(10000, 500), 10500);
    assert.equal(estimatedBalance(null, 500), null);
  });

  it("builds equity curve from daily bars", () => {
    const curve = buildBalanceEquityCurve(
      [
        { date: "2026-05-01", pnl: 100 },
        { date: "2026-05-02", pnl: -40 },
      ],
      10000,
    );
    assert.equal(curve.length, 2);
    assert.equal(curve[0]?.pnl, 10100);
    assert.equal(curve[0]?.balance, 10100);
    assert.equal(curve[0]?.dailyPnl, 100);
    assert.equal(curve[0]?.cumulativePnl, 100);
    assert.equal(curve[1]?.pnl, 10060);
    assert.equal(curve[1]?.dailyPnl, -40);
    assert.equal(curve[1]?.cumulativePnl, 60);
  });

  it("computes drawdown from peak equity", () => {
    const stats = drawdownStatsFromEquity(
      [
        { date: "2026-05-01", pnl: 200 },
        { date: "2026-05-02", pnl: -150 },
        { date: "2026-05-03", pnl: 50 },
      ],
      10000,
    );
    assert.equal(stats.peakEquity, 10200);
    assert.equal(stats.maxDrawdown, -150);
  });

  it("returns pacing target when starting balance is set", () => {
    const snapshot = computeCapitalProgress(
      { startingBalance: 10000, currency: "USD" },
      [row({ r: "250", entryDate: "2026-05-01" }), row({ id: "2", r: "100", entryDate: "2026-05-02" })],
    );
    assert.equal(snapshot.profitTarget, 1000);
    assert.equal(snapshot.estimatedBalance, 10350);
    assert.equal(snapshot.hasJournalData, true);
  });
});
