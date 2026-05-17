import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSettingsSection } from "@/lib/settings/sections";

describe("settings sections", () => {
  it("defaults to profile and accepts accounts deep link", () => {
    assert.equal(parseSettingsSection(null), "profile");
    assert.equal(parseSettingsSection("accounts"), "accounts");
    assert.equal(parseSettingsSection("invalid"), "profile");
  });
});
