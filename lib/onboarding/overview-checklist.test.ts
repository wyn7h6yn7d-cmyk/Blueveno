import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getOverviewOnboardingChecklist,
  ONBOARDING_HIDE_ENTRY_COUNT,
  ONBOARDING_HIDE_TRADED_DAYS,
} from "@/lib/onboarding/overview-checklist";

describe("getOverviewOnboardingChecklist", () => {
  it("shows account and first-day steps for brand-new users", () => {
    const result = getOverviewOnboardingChecklist({ accountCount: 0, entryCount: 0, tradedDays: 0 });
    assert.equal(result.show, true);
    assert.deepEqual(
      result.items.map((i) => i.id),
      ["account", "first-day", "calendar"],
    );
  });

  it("hides completed steps", () => {
    const result = getOverviewOnboardingChecklist({ accountCount: 1, entryCount: 0, tradedDays: 0 });
    assert.equal(result.show, true);
    assert.deepEqual(
      result.items.map((i) => i.id),
      ["first-day", "calendar"],
    );
  });

  it("includes stats step after first entry until unlocked", () => {
    const result = getOverviewOnboardingChecklist({ accountCount: 1, entryCount: 2, tradedDays: 2 });
    assert.equal(result.show, true);
    assert.ok(result.items.some((i) => i.id === "stats"));
  });

  it("hides checklist when user has enough data", () => {
    const result = getOverviewOnboardingChecklist({
      accountCount: 1,
      entryCount: ONBOARDING_HIDE_ENTRY_COUNT,
      tradedDays: 1,
    });
    assert.equal(result.show, false);
    assert.equal(result.items.length, 0);
  });

  it("hides checklist when traded days threshold is met", () => {
    const result = getOverviewOnboardingChecklist({
      accountCount: 1,
      entryCount: 3,
      tradedDays: ONBOARDING_HIDE_TRADED_DAYS,
    });
    assert.equal(result.show, false);
  });

  it("hides checklist when all steps are complete", () => {
    const result = getOverviewOnboardingChecklist({ accountCount: 1, entryCount: 4, tradedDays: 4 });
    assert.equal(result.show, false);
  });
});
