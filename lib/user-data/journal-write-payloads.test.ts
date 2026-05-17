import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildJournalUpdatePayloads } from "@/lib/user-data/journal-write-payloads";
import { syncLegacyBehaviorFromRuleChecks } from "@/lib/user-data/sync-rule-checks";

describe("journal-write-payloads", () => {
  it("keeps behavior fields when rule_checks is dropped from fallback payloads", () => {
    const payloads = buildJournalUpdatePayloads({
      entryDate: "2026-05-11",
      time: "Day close",
      sym: "NQ",
      setup: "Pullback",
      r: "100",
      tag: "None",
      followedPlan: true,
      respectedStop: true,
      noRevengeTrade: false,
      ruleChecks: { "rule-1": true },
    });
    const withoutRuleChecks = payloads.find((p) => !("rule_checks" in p) && "followed_plan" in p);
    assert.ok(withoutRuleChecks);
    assert.equal(withoutRuleChecks?.followed_plan, true);
  });
});

describe("sync-rule-checks", () => {
  it("maps default personal rules into legacy behavior toggles", () => {
    const synced = syncLegacyBehaviorFromRuleChecks(
      [
        { id: "a", title: "Followed my plan" },
        { id: "b", title: "Respected my stop" },
      ],
      { a: true, b: false },
      { followedPlan: false, respectedStop: true, noRevengeTrade: false },
    );
    assert.equal(synced.followedPlan, true);
    assert.equal(synced.respectedStop, false);
  });
});
