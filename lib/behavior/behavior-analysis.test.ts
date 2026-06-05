import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeBehaviorAnalysis,
  computeEmotionalConsistencyScore,
  computeExitBehaviorRows,
  computeMoodPerformance,
  generateBehaviorRecommendations,
  generateCoachingInsights,
  splitEntriesByPeriod,
} from "@/lib/behavior/behavior-analysis";
import type { JournalRow } from "@/lib/user-data/types";

function row(partial: Partial<JournalRow>): JournalRow {
  return {
    id: partial.id ?? "1",
    time: "",
    sym: partial.sym ?? "EURUSD",
    setup: partial.setup ?? "Pullback",
    r: partial.r ?? "100",
    tag: partial.tag ?? "None",
    ...partial,
  };
}

describe("behavior-analysis", () => {
  it("splitEntriesByPeriod separates current and previous windows", () => {
    const now = new Date("2026-06-05T12:00:00");
    const entries = [
      row({ id: "old", entryDate: "2026-04-01", r: "50" }),
      row({ id: "new", entryDate: "2026-06-01", r: "80" }),
    ];
    const { current, previous } = splitEntriesByPeriod(entries, 30, now);
    assert.equal(current.length, 1);
    assert.equal(previous.length, 1);
    assert.equal(current[0]?.id, "new");
  });

  it("computeMoodPerformance requires minimum sample per mood", () => {
    const entries = [
      row({ moodState: "Calm", r: "100" }),
      row({ moodState: "Calm", r: "50" }),
      row({ moodState: "Tilted", r: "-20" }),
    ];
    const rows = computeMoodPerformance(entries);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.mood, "Calm");
    assert.equal(rows[0]?.count, 2);
  });

  it("computeEmotionalConsistencyScore returns null with sparse mood data", () => {
    assert.equal(computeEmotionalConsistencyScore([row({ moodState: "Calm" })]), null);
    const entries = [
      row({ moodState: "Calm", r: "10" }),
      row({ moodState: "Focused", r: "20" }),
      row({ moodState: "Calm", r: "30" }),
    ];
    const score = computeEmotionalConsistencyScore(entries);
    assert.ok(score !== null);
    assert.ok(score >= 0 && score <= 100);
  });

  it("computeExitBehaviorRows uses mistake tags and plan proxy", () => {
    const entries = [
      row({ tag: "Early exit", r: "-40" }),
      row({ tag: "Early exit", r: "-20" }),
      row({ followedPlan: true, r: "100" }),
      row({ followedPlan: true, r: "80" }),
      row({ tag: "FOMO", r: "-60" }),
      row({ followedPlan: false, r: "-30" }),
    ];
    const rows = computeExitBehaviorRows(entries);
    const early = rows.find((r) => r.key === "early_exit");
    assert.ok(early);
    assert.equal(early.count, 2);
    const impulsive = rows.find((r) => r.key === "impulsive_style");
    const planned = rows.find((r) => r.key === "planned_style");
    assert.ok(impulsive);
    assert.ok(planned);
  });

  it("computeBehaviorAnalysis marks insufficient data below threshold", () => {
    const result = computeBehaviorAnalysis({
      entries: [row({ r: "10" }), row({ r: "-5" })],
      currency: "USD",
    });
    assert.equal(result.sufficientData, false);
  });

  it("surfaces plan-follow correlation in coaching insights", () => {
    const entries = [
      ...Array.from({ length: 4 }).map((_, i) =>
        row({
          id: `y-${i}`,
          r: "200",
          followedPlan: true,
          respectedStop: true,
          noRevengeTrade: true,
          moodState: "Calm",
          entryDate: `2026-05-0${i + 1}`,
        }),
      ),
      ...Array.from({ length: 4 }).map((_, i) =>
        row({
          id: `n-${i}`,
          r: "-80",
          followedPlan: false,
          respectedStop: false,
          noRevengeTrade: false,
          moodState: "Tilted",
          entryDate: `2026-05-1${i}`,
        }),
      ),
    ];
    const result = computeBehaviorAnalysis({ entries, currency: "USD" });
    assert.equal(result.sufficientData, true);
    assert.ok(result.coachingInsights.some((i) => i.id === "plan-split" || i.id === "mood-contrast"));
    assert.equal(result.recommendations.length, 3);
    const kinds = new Set(result.recommendations.map((r) => r.kind));
    assert.ok(kinds.has("protective"));
    assert.ok(kinds.has("performance"));
    assert.ok(kinds.has("consistency"));
  });

  it("generateBehaviorRecommendations always returns three kinds", () => {
    const recs = generateBehaviorRecommendations({
      scores: {
        disciplineScore: 55,
        planFollowScore: 60,
        emotionalConsistencyScore: 45,
        disciplineTrend: -5,
        planFollowTrend: null,
        currentSample: 10,
        previousSample: 8,
        hasTrend: true,
      },
      bestMood: { mood: "Calm", count: 4, winRate: 75, avgPnl: 120, totalPnl: 480 },
      riskiestMood: { mood: "Tilted", count: 3, winRate: 20, avgPnl: -90, totalPnl: -270 },
      worstRule: {
        key: "followed_plan",
        label: "Followed plan",
        pct: 50,
        yesCount: 4,
        noCount: 4,
        avgPnlWhenYes: 100,
        avgPnlWhenNo: -50,
        pnlDelta: 150,
      },
      ruleMetrics: [],
      currency: "USD",
    });
    assert.equal(recs.length, 3);
  });

  it("includes weekly reflection notes in coaching insights", () => {
    const insights = generateCoachingInsights({
      scores: {
        disciplineScore: 70,
        planFollowScore: 80,
        emotionalConsistencyScore: 65,
        disciplineTrend: 3,
        planFollowTrend: 2,
        currentSample: 12,
        previousSample: 10,
        hasTrend: true,
      },
      moodRows: [],
      ruleMetrics: [],
      bestMood: null,
      riskiestMood: null,
      bestRule: null,
      worstRule: null,
      exitRows: [],
      reflectionWorked: "Stopped trading after two losses.",
      reflectionSlipped: "Overtraded on Friday.",
      currency: "USD",
    });
    assert.ok(insights.some((i) => i.id === "review-worked"));
    assert.ok(insights.some((i) => i.id === "review-slipped"));
  });
});
