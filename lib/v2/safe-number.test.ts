import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clampPercent, safeFiniteNumber, safeProgressRatio } from "@/lib/v2/safe-number";

describe("safe-number", () => {
  it("coerces invalid values to fallback", () => {
    assert.equal(safeFiniteNumber(NaN), 0);
    assert.equal(safeFiniteNumber(Infinity), 0);
    assert.equal(safeFiniteNumber(undefined), 0);
    assert.equal(safeFiniteNumber("12.5"), 12.5);
  });

  it("clamps percent", () => {
    assert.equal(clampPercent(120), 100);
    assert.equal(clampPercent(-5), 0);
    assert.equal(clampPercent(NaN), 0);
  });

  it("computes safe progress ratio", () => {
    assert.equal(safeProgressRatio(50, 100), 50);
    assert.equal(safeProgressRatio(50, 0), 100);
    assert.equal(safeProgressRatio(NaN, 100), 0);
  });
});
