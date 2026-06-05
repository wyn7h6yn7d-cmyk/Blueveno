import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  displaySessionLabel,
  getDefaultSessionTagForNewEntry,
  getTradingSession,
  getTradingSessionHeadline,
  sanitizeSessionTagForDb,
} from "@/lib/session";
import { isAllowedSessionTag, SESSION_TAG_OPTIONS } from "@/lib/user-data/journal-tags";

describe("session", () => {
  it("detected tags match DB-allowed SESSION_TAG_OPTIONS", () => {
    const at = new Date("2026-06-03T14:00:00.000Z");
    const tag = getTradingSession(at);
    assert.ok(SESSION_TAG_OPTIONS.includes(tag));
    assert.ok(isAllowedSessionTag(tag));
  });

  it("sanitizes top-bar headline overlap label for DB storage", () => {
    assert.equal(sanitizeSessionTagForDb("London · New York overlap"), "London/New York overlap");
    assert.equal(sanitizeSessionTagForDb("Off session"), "Other");
    assert.equal(sanitizeSessionTagForDb("Between main sessions"), "Other");
    assert.equal(sanitizeSessionTagForDb("not-a-real-session"), null);
  });

  it("maps London · New York overlap headline consistently", () => {
    // 14:00 UTC — London + New York windows overlap
    const at = new Date("2026-06-03T14:00:00.000Z");
    assert.equal(getTradingSession(at), "London/New York overlap");
    assert.equal(getTradingSessionHeadline(at), "London · New York overlap");
  });

  it("defaults new entry session to a valid tag", () => {
    const tag = getDefaultSessionTagForNewEntry("Europe/London");
    assert.ok(["London", "New York", "London/New York overlap", "Asia", "Other"].includes(tag));
  });

  it("uses saved session tag before fallback", () => {
    assert.equal(
      displaySessionLabel({
        sessionTag: "Asia",
        entryDate: "2026-01-01",
        time: "Day close",
        createdAt: "2026-01-01T10:00:00.000Z",
      }),
      "Asia",
    );
  });

  it("computes fallback session when tag is missing", () => {
    const label = displaySessionLabel({
      sessionTag: undefined,
      entryDate: "2026-06-03",
      time: "Day close",
      createdAt: "2026-06-03T14:00:00.000Z",
    });
    assert.equal(label, "London/New York overlap");
  });
});
