import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isMissingPersonalRulesTableError } from "@/lib/user-data/personal-rules-schema";

describe("personal-rules-schema", () => {
  it("detects missing personal_rules table", () => {
    assert.equal(
      isMissingPersonalRulesTableError(
        "Could not find the table 'public.personal_rules' in the schema cache",
        "PGRST205",
      ),
      true,
    );
    assert.equal(isMissingPersonalRulesTableError("column personal_rules.foo does not exist"), false);
  });
});
