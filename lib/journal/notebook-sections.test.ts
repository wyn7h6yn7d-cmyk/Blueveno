import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildNotebookSections } from "@/lib/journal/notebook-sections";
describe("notebook-sections", () => {
  it("maps journal fields into structured sections", () => {
    const sections = buildNotebookSections(
      {
        id: "1",
        time: "Day close",
        sym: "NQ",
        setup: "Pullback",
        r: "120",
        tag: "None",
        moodState: "Calm",
        sessionTag: "New York",
        note: "Clean session",
        lessonLearned: "Wait for confirmation",
      },
      "USD",
    );
    assert.ok(sections.find((s) => s.id === "plan")?.hasContent);
    assert.ok(sections.find((s) => s.id === "review")?.body.includes("Clean session"));
    assert.ok(sections.find((s) => s.id === "lesson")?.hasContent);
  });
});
