import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOverviewOnboardingSchemaError } from "@/lib/onboarding/overview-onboarding-preference";

describe("isOverviewOnboardingSchemaError", () => {
  it("detects missing column in schema cache", () => {
    assert.equal(
      isOverviewOnboardingSchemaError(
        "Could not find the 'overview_onboarding_dismissed_at' column of 'user_profiles' in the schema cache",
        undefined,
      ),
      true,
    );
  });

  it("detects missing RPC", () => {
    assert.equal(isOverviewOnboardingSchemaError("function dismiss_overview_onboarding() does not exist", "PGRST202"), true);
  });

  it("ignores unrelated errors", () => {
    assert.equal(isOverviewOnboardingSchemaError("permission denied", "42501"), false);
  });
});
