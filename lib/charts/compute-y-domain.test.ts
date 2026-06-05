import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeBalanceYDomain } from "@/lib/charts/compute-y-domain";

describe("computeBalanceYDomain", () => {
  it("zooms around balance movement with 15% padding", () => {
    const balances = [25000, 25100, 26000];
    const [min, max] = computeBalanceYDomain(balances, 25000);
    const minBalance = 25000;
    const maxBalance = 26000;
    const range = 1000;
    const padding = range * 0.15;
    assert.equal(min, minBalance - padding);
    assert.equal(max, maxBalance + padding);
    assert.ok(min > 0);
  });

  it("uses starting balance floor when the visible range is flat", () => {
    const [min, max] = computeBalanceYDomain([25000, 25000], 25000);
    const range = Math.max(0, 25000 * 0.01, 100);
    const padding = range * 0.15;
    assert.equal(min, 25000 - padding);
    assert.equal(max, 25000 + padding);
    assert.ok(max - min > 0);
  });

  it("ignores non-finite values", () => {
    const [min, max] = computeBalanceYDomain([100, Number.NaN, Number.POSITIVE_INFINITY, 200], 10000);
    const range = Math.max(100, 10000 * 0.01, 100);
    const padding = range * 0.15;
    assert.equal(min, 100 - padding);
    assert.equal(max, 200 + padding);
  });
});
