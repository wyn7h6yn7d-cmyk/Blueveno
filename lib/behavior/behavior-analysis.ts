import { formatSignedPnlAmount } from "@/lib/format-pnl";
import { computeDisciplineScorePercent } from "@/lib/user-data/discipline-stats";
import { dayKeyFromRow } from "@/lib/user-data/journal-metrics";
import { parsePnlAmount } from "@/lib/user-data/kpi";
import type { JournalRow } from "@/lib/user-data/types";

export type BehaviorScoreSummary = {
  disciplineScore: number | null;
  planFollowScore: number | null;
  emotionalConsistencyScore: number | null;
  disciplineTrend: number | null;
  planFollowTrend: number | null;
  currentSample: number;
  previousSample: number;
  hasTrend: boolean;
};

export type MoodPerformanceRow = {
  mood: string;
  count: number;
  winRate: number | null;
  avgPnl: number | null;
  totalPnl: number;
};

export type RuleAdherenceMetric = {
  key: string;
  label: string;
  pct: number | null;
  yesCount: number;
  noCount: number;
  avgPnlWhenYes: number | null;
  avgPnlWhenNo: number | null;
  /** Best correlation: positive delta means rule adherence associates with better P&L */
  pnlDelta: number | null;
};

export type ExitBehaviorRow = {
  key: string;
  label: string;
  count: number;
  avgPnl: number | null;
  totalPnl: number;
  source: "mistake_tag" | "discipline_proxy";
};

export type CoachingInsight = {
  id: string;
  title: string;
  body: string;
  severity: "positive" | "negative" | "warning" | "neutral" | "info";
  tag: string;
};

export type BehaviorRecommendation = {
  id: string;
  kind: "protective" | "performance" | "consistency";
  title: string;
  body: string;
};

export type PersonalRuleCorrelation = {
  ruleId: string;
  title: string;
  followedPct: number | null;
  avgWhenFollowed: number | null;
  avgWhenBroken: number | null;
  breakCost: number | null;
};

export type BehaviorAnalysisResult = {
  scores: BehaviorScoreSummary;
  moodRows: MoodPerformanceRow[];
  bestMood: MoodPerformanceRow | null;
  riskiestMood: MoodPerformanceRow | null;
  ruleMetrics: RuleAdherenceMetric[];
  bestRuleCorrelation: RuleAdherenceMetric | null;
  worstRuleCorrelation: RuleAdherenceMetric | null;
  exitRows: ExitBehaviorRow[];
  coachingInsights: CoachingInsight[];
  recommendations: BehaviorRecommendation[];
  personalRuleRows: PersonalRuleCorrelation[];
  dataNotes: string[];
  sufficientData: boolean;
};

const MOOD_STATES = ["Calm", "Focused", "Hesitant", "Tilted"] as const;
const MIN_MOOD_SAMPLE = 2;
const MIN_RULE_SAMPLE = 2;
const MIN_ENTRIES_FOR_INSIGHTS = 3;
const PERIOD_DAYS = 30;

const EXIT_MISTAKE_TAGS: Record<string, string> = {
  early_exit: "Early exit",
  late_entry: "Late entry",
  moved_stop: "Moved stop",
};

const IMPULSIVE_TAGS = new Set(["FOMO", "Revenge", "Broke plan", "Overtraded", "Moved stop"]);

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const v = nums.reduce((s, n) => s + n, 0) / nums.length;
  return Number.isFinite(v) ? v : null;
}

function winRate(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const wins = nums.filter((n) => n > 0).length;
  return Math.round((wins / nums.length) * 100);
}

function boolMetric(
  entries: JournalRow[],
  key: string,
  label: string,
  pick: (row: JournalRow) => boolean | undefined,
): RuleAdherenceMetric {
  const yesPnls: number[] = [];
  const noPnls: number[] = [];
  let yesCount = 0;
  let noCount = 0;

  for (const row of entries) {
    const flag = pick(row);
    if (flag === undefined) continue;
    const pnl = parsePnlAmount(row.r);
    if (pnl === null) continue;
    if (flag) {
      yesCount += 1;
      yesPnls.push(pnl);
    } else {
      noCount += 1;
      noPnls.push(pnl);
    }
  }

  const total = yesCount + noCount;
  const avgYes = avg(yesPnls);
  const avgNo = avg(noPnls);
  return {
    key,
    label,
    pct: total > 0 ? Math.round((yesCount / total) * 100) : null,
    yesCount,
    noCount,
    avgPnlWhenYes: avgYes,
    avgPnlWhenNo: avgNo,
    pnlDelta: avgYes !== null && avgNo !== null ? avgYes - avgNo : null,
  };
}

function overtradingProxyMetric(entries: JournalRow[]): RuleAdherenceMetric {
  const notOvertraded: number[] = [];
  const overtraded: number[] = [];
  let yesCount = 0;
  let noCount = 0;

  for (const row of entries) {
    const tag = String(row.tag ?? "").trim();
    if (!tag || tag === "None" || tag === "Manual") continue;
    const pnl = parsePnlAmount(row.r);
    if (pnl === null) continue;
    if (tag === "Overtraded") {
      noCount += 1;
      overtraded.push(pnl);
    } else {
      yesCount += 1;
      notOvertraded.push(pnl);
    }
  }

  const total = yesCount + noCount;
  const avgYes = avg(notOvertraded);
  const avgNo = avg(overtraded);
  return {
    key: "no_overtrading",
    label: "No overtrade (tag proxy)",
    pct: total > 0 ? Math.round((yesCount / total) * 100) : null,
    yesCount,
    noCount,
    avgPnlWhenYes: avgYes,
    avgPnlWhenNo: avgNo,
    pnlDelta: avgYes !== null && avgNo !== null ? avgYes - avgNo : null,
  };
}

export function splitEntriesByPeriod(
  entries: JournalRow[],
  periodDays = PERIOD_DAYS,
  now = new Date(),
): { current: JournalRow[]; previous: JournalRow[] } {
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - periodDays);
  const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
  const current: JournalRow[] = [];
  const previous: JournalRow[] = [];
  for (const row of entries) {
    const key = dayKeyFromRow(row.entryDate, row.createdAt);
    if (key >= cutoffKey) current.push(row);
    else previous.push(row);
  }
  return { current, previous };
}

function moodEntropy(counts: number[]): number {
  const total = counts.reduce((s, n) => s + n, 0);
  if (total <= 0) return 0;
  let entropy = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function computeEmotionalConsistencyScore(entries: JournalRow[]): number | null {
  const moodCounts = new Map<string, number>();
  let tagged = 0;
  for (const row of entries) {
    if (!row.moodState) continue;
    tagged += 1;
    moodCounts.set(row.moodState, (moodCounts.get(row.moodState) ?? 0) + 1);
  }
  if (tagged < MIN_MOOD_SAMPLE) return null;

  const counts = MOOD_STATES.map((m) => moodCounts.get(m) ?? 0).filter((c) => c > 0);
  const maxEntropy = Math.log2(MOOD_STATES.length);
  const entropy = moodEntropy(counts);
  const stability = maxEntropy > 0 ? 1 - entropy / maxEntropy : 1;
  const coverage = tagged / Math.max(entries.length, 1);
  return Math.round(Math.max(0, Math.min(100, stability * 50 + coverage * 50)));
}

export function computeMoodPerformance(entries: JournalRow[]): MoodPerformanceRow[] {
  const map = new Map<string, number[]>();
  for (const row of entries) {
    if (!row.moodState) continue;
    const pnl = parsePnlAmount(row.r);
    if (pnl === null) continue;
    const arr = map.get(row.moodState) ?? [];
    arr.push(pnl);
    map.set(row.moodState, arr);
  }

  return [...map.entries()]
    .map(([mood, pnls]) => ({
      mood,
      count: pnls.length,
      winRate: winRate(pnls),
      avgPnl: avg(pnls),
      totalPnl: pnls.reduce((s, n) => s + n, 0),
    }))
    .filter((r) => r.count >= MIN_MOOD_SAMPLE)
    .sort((a, b) => (b.avgPnl ?? 0) - (a.avgPnl ?? 0));
}

export function computeExitBehaviorRows(entries: JournalRow[]): ExitBehaviorRow[] {
  const rows: ExitBehaviorRow[] = [];

  for (const [key, label] of Object.entries(EXIT_MISTAKE_TAGS)) {
    const pnls: number[] = [];
    for (const row of entries) {
      const tag = String(row.tag ?? "").trim();
      if (tag !== label) continue;
      const pnl = parsePnlAmount(row.r);
      if (pnl !== null) pnls.push(pnl);
    }
    if (pnls.length > 0) {
      rows.push({
        key,
        label,
        count: pnls.length,
        avgPnl: avg(pnls),
        totalPnl: pnls.reduce((s, n) => s + n, 0),
        source: "mistake_tag",
      });
    }
  }

  const impulsivePnls: number[] = [];
  const plannedPnls: number[] = [];
  for (const row of entries) {
    const pnl = parsePnlAmount(row.r);
    if (pnl === null) continue;
    const tag = String(row.tag ?? "").trim();
    const impulsive = IMPULSIVE_TAGS.has(tag) || row.followedPlan === false;
    if (impulsive) impulsivePnls.push(pnl);
    else if (row.followedPlan === true || tag === "None" || !tag) plannedPnls.push(pnl);
  }

  if (impulsivePnls.length >= MIN_RULE_SAMPLE) {
    rows.push({
      key: "impulsive_style",
      label: "Impulsive style (tag / plan proxy)",
      count: impulsivePnls.length,
      avgPnl: avg(impulsivePnls),
      totalPnl: impulsivePnls.reduce((s, n) => s + n, 0),
      source: "discipline_proxy",
    });
  }
  if (plannedPnls.length >= MIN_RULE_SAMPLE) {
    rows.push({
      key: "planned_style",
      label: "Planned style (followed plan / clean tag)",
      count: plannedPnls.length,
      avgPnl: avg(plannedPnls),
      totalPnl: plannedPnls.reduce((s, n) => s + n, 0),
      source: "discipline_proxy",
    });
  }

  return rows.sort((a, b) => b.count - a.count);
}

function planFollowScore(entries: JournalRow[]): number | null {
  const metric = boolMetric(entries, "plan", "Followed plan", (r) => r.followedPlan);
  return metric.pct;
}

export function computeBehaviorScores(
  current: JournalRow[],
  previous: JournalRow[],
): BehaviorScoreSummary {
  const disciplineCurrent = computeDisciplineScorePercent(current);
  const disciplinePrevious = computeDisciplineScorePercent(previous);
  const planCurrent = planFollowScore(current);
  const planPrevious = planFollowScore(previous);

  const hasTrend = previous.length >= MIN_ENTRIES_FOR_INSIGHTS;

  return {
    disciplineScore: disciplineCurrent,
    planFollowScore: planCurrent,
    emotionalConsistencyScore: computeEmotionalConsistencyScore(current),
    disciplineTrend:
      hasTrend && disciplineCurrent !== null && disciplinePrevious !== null
        ? disciplineCurrent - disciplinePrevious
        : null,
    planFollowTrend: hasTrend && planCurrent !== null && planPrevious !== null ? planCurrent - planPrevious : null,
    currentSample: current.length,
    previousSample: previous.length,
    hasTrend,
  };
}

function pickBestWorstRule(metrics: RuleAdherenceMetric[]): {
  best: RuleAdherenceMetric | null;
  worst: RuleAdherenceMetric | null;
} {
  const eligible = metrics.filter(
    (m) => m.pnlDelta !== null && m.yesCount >= MIN_RULE_SAMPLE && m.noCount >= MIN_RULE_SAMPLE,
  );
  if (eligible.length === 0) return { best: null, worst: null };
  const best = eligible.reduce((a, b) => ((b.pnlDelta ?? 0) > (a.pnlDelta ?? 0) ? b : a));
  const worst = eligible.reduce((a, b) => ((b.pnlDelta ?? 0) < (a.pnlDelta ?? 0) ? b : a));
  return { best, worst };
}

export function computePersonalRuleCorrelations(
  entries: JournalRow[],
  rules: Array<{ id: string; title: string; is_active: boolean }>,
): PersonalRuleCorrelation[] {
  const active = rules.filter((r) => r.is_active);
  return active.map((rule) => {
    let followed = 0;
    let broken = 0;
    let followedSum = 0;
    let brokenSum = 0;
    for (const row of entries) {
      const pnl = parsePnlAmount(row.r);
      if (pnl === null) continue;
      const flag = Boolean(row.ruleChecks?.[rule.id]);
      if (flag) {
        followed += 1;
        followedSum += pnl;
      } else {
        broken += 1;
        brokenSum += pnl;
      }
    }
    const total = followed + broken;
    return {
      ruleId: rule.id,
      title: rule.title,
      followedPct: total > 0 ? Math.round((followed / total) * 100) : null,
      avgWhenFollowed: followed > 0 ? followedSum / followed : null,
      avgWhenBroken: broken > 0 ? brokenSum / broken : null,
      breakCost: broken > 0 ? brokenSum : null,
    };
  });
}

export function generateCoachingInsights(params: {
  scores: BehaviorScoreSummary;
  moodRows: MoodPerformanceRow[];
  ruleMetrics: RuleAdherenceMetric[];
  bestMood: MoodPerformanceRow | null;
  riskiestMood: MoodPerformanceRow | null;
  bestRule: RuleAdherenceMetric | null;
  worstRule: RuleAdherenceMetric | null;
  exitRows: ExitBehaviorRow[];
  reflectionWorked?: string | null;
  reflectionSlipped?: string | null;
  currency: string;
}): CoachingInsight[] {
  const insights: CoachingInsight[] = [];
  const fmt = (n: number | null) =>
    n === null ? "—" : formatSignedPnlAmount(n, params.currency);

  if (params.bestMood && params.riskiestMood && params.bestMood.mood !== params.riskiestMood.mood) {
    insights.push({
      id: "mood-contrast",
      title: "Mindset contrast",
      body: `Winning mindset: ${params.bestMood.mood} averages ${fmt(params.bestMood.avgPnl)} (${params.bestMood.winRate ?? "—"}% win). Riskiest: ${params.riskiestMood.mood} at ${fmt(params.riskiestMood.avgPnl)}.`,
      severity: "info",
      tag: "Mood",
    });
  }

  if (params.bestRule && (params.bestRule.pnlDelta ?? 0) > 0) {
    insights.push({
      id: "best-rule",
      title: "Strongest rule link",
      body: `${params.bestRule.label} associates with ${fmt(params.bestRule.pnlDelta)} better average result when followed (${params.bestRule.pct ?? "—"}% adherence).`,
      severity: "positive",
      tag: "Discipline",
    });
  }

  if (params.worstRule && (params.worstRule.pnlDelta ?? 0) < 0) {
    insights.push({
      id: "worst-rule",
      title: "Most expensive violation",
      body: `When ${params.worstRule.label.toLowerCase()} fails, average result is ${fmt(params.worstRule.avgPnlWhenNo)} vs ${fmt(params.worstRule.avgPnlWhenYes)} when respected.`,
      severity: "warning",
      tag: "Discipline",
    });
  }

  const plan = params.ruleMetrics.find((m) => m.key === "followed_plan");
  const revenge = params.ruleMetrics.find((m) => m.key === "no_revenge");
  if (plan && plan.yesCount >= MIN_RULE_SAMPLE && plan.noCount >= MIN_RULE_SAMPLE) {
    insights.push({
      id: "plan-split",
      title: "Plan split",
      body: `Winning days most often happen when plan is followed (${fmt(plan.avgPnlWhenYes)} avg) vs ${fmt(plan.avgPnlWhenNo)} when not.`,
      severity: plan.pnlDelta !== null && plan.pnlDelta >= 0 ? "positive" : "negative",
      tag: "Plan",
    });
  }

  if (revenge && revenge.noCount >= MIN_RULE_SAMPLE) {
    insights.push({
      id: "revenge-cluster",
      title: "Revenge cost",
      body: `Revenge trades average ${fmt(revenge.avgPnlWhenNo)} across ${revenge.noCount} logged violations.`,
      severity: "negative",
      tag: "Risk",
    });
  }

  const impulsive = params.exitRows.find((r) => r.key === "impulsive_style");
  const planned = params.exitRows.find((r) => r.key === "planned_style");
  if (impulsive && planned) {
    insights.push({
      id: "exit-style",
      title: "Exit / execution style",
      body: `Planned-style entries average ${fmt(planned.avgPnl)} vs ${fmt(impulsive.avgPnl)} for impulsive-style (tags or missed plan).`,
      severity: (planned.avgPnl ?? 0) >= (impulsive.avgPnl ?? 0) ? "positive" : "warning",
      tag: "Execution",
    });
  }

  if (params.reflectionWorked?.trim()) {
    insights.push({
      id: "review-worked",
      title: "Weekly reflection",
      body: params.reflectionWorked.trim(),
      severity: "positive",
      tag: "Review",
    });
  }
  if (params.reflectionSlipped?.trim()) {
    insights.push({
      id: "review-slipped",
      title: "What slipped",
      body: params.reflectionSlipped.trim(),
      severity: "warning",
      tag: "Review",
    });
  }

  if (params.scores.disciplineTrend !== null && params.scores.hasTrend) {
    const dir = params.scores.disciplineTrend >= 0 ? "improved" : "softened";
    insights.push({
      id: "discipline-trend",
      title: "Discipline trend",
      body: `Discipline score ${dir} by ${Math.abs(params.scores.disciplineTrend)} pts vs the prior ${PERIOD_DAYS} days.`,
      severity: params.scores.disciplineTrend >= 0 ? "positive" : "warning",
      tag: "Trend",
    });
  }

  return insights;
}

export function generateBehaviorRecommendations(params: {
  scores: BehaviorScoreSummary;
  bestMood: MoodPerformanceRow | null;
  riskiestMood: MoodPerformanceRow | null;
  worstRule: RuleAdherenceMetric | null;
  ruleMetrics: RuleAdherenceMetric[];
  currency: string;
}): BehaviorRecommendation[] {
  const recs: BehaviorRecommendation[] = [];
  const fmt = (n: number | null) =>
    n === null ? "—" : formatSignedPnlAmount(n, params.currency);

  if (params.worstRule && (params.worstRule.pnlDelta ?? 0) < 0) {
    recs.push({
      id: "protective-rule",
      kind: "protective",
      title: `Protect: ${params.worstRule.label}`,
      body: `Breaking this rule costs about ${fmt(params.worstRule.pnlDelta)} per entry on average. Treat it as a hard stop before the next session.`,
    });
  } else if (params.riskiestMood) {
    recs.push({
      id: "protective-mood",
      kind: "protective",
      title: `Reduce ${params.riskiestMood.mood} exposure`,
      body: `Entries tagged ${params.riskiestMood.mood} average ${fmt(params.riskiestMood.avgPnl)}. Consider pausing or sizing down when this mood appears.`,
    });
  } else {
    recs.push({
      id: "protective-log",
      kind: "protective",
      title: "Log discipline checks",
      body: "Record Followed plan, Respected stop, and No revenge on each entry to unlock protective edge signals.",
    });
  }

  const plan = params.ruleMetrics.find((m) => m.key === "followed_plan");
  if (plan && (plan.pnlDelta ?? 0) > 0) {
    recs.push({
      id: "performance-plan",
      kind: "performance",
      title: "Repeat plan-follow days",
      body: `Plan-follow entries average ${fmt(plan.avgPnlWhenYes)}. Anchor your A+ setups to the same pre-trade checklist.`,
    });
  } else if (params.bestMood) {
    recs.push({
      id: "performance-mood",
      kind: "performance",
      title: "Trade your best mindset",
      body: `Your strongest logged mood is ${params.bestMood.mood} (${fmt(params.bestMood.avgPnl)} avg). Prioritize setups when you reach that state.`,
    });
  } else {
    recs.push({
      id: "performance-sample",
      kind: "performance",
      title: "Build a larger sample",
      body: "Add mood and discipline tags to at least 10 entries to surface your strongest performance conditions.",
    });
  }

  if (params.scores.disciplineTrend !== null && params.scores.disciplineTrend < 0) {
    recs.push({
      id: "consistency-trend",
      kind: "consistency",
      title: "Stabilize discipline",
      body: `Discipline slipped ${Math.abs(params.scores.disciplineTrend)} pts vs the prior ${PERIOD_DAYS} days. Pick one non-negotiable rule for next week.`,
    });
  } else if (params.scores.emotionalConsistencyScore !== null && params.scores.emotionalConsistencyScore < 60) {
    recs.push({
      id: "consistency-mood",
      kind: "consistency",
      title: "Narrow mood variance",
      body: "Mood logging is inconsistent or spread across many states. Use a pre-session routine to reach Calm or Focused before trading.",
    });
  } else {
    recs.push({
      id: "consistency-review",
      kind: "consistency",
      title: "Close the weekly loop",
      body: "Complete your weekly reflection to tie behavior notes to next week's focus and one non-negotiable rule.",
    });
  }

  return recs.slice(0, 3);
}

export type ComputeBehaviorAnalysisParams = {
  entries: JournalRow[];
  currency: string;
  personalRules?: Array<{ id: string; title: string; is_active: boolean }>;
  reflectionWorked?: string | null;
  reflectionSlipped?: string | null;
  periodDays?: number;
};

export function computeBehaviorAnalysis(params: ComputeBehaviorAnalysisParams): BehaviorAnalysisResult {
  const { entries, currency, personalRules = [], reflectionWorked, reflectionSlipped, periodDays = PERIOD_DAYS } = params;
  const { current, previous } = splitEntriesByPeriod(entries, periodDays);
  const scores = computeBehaviorScores(current, previous);

  const moodRows = computeMoodPerformance(entries);
  const bestMood = moodRows[0] ?? null;
  const riskiestMood = moodRows.length > 0 ? moodRows[moodRows.length - 1]! : null;

  const ruleMetrics: RuleAdherenceMetric[] = [
    boolMetric(entries, "followed_plan", "Followed plan", (r) => r.followedPlan),
    boolMetric(entries, "respected_stop", "Respected stop", (r) => r.respectedStop),
    boolMetric(entries, "no_revenge", "No revenge", (r) => r.noRevengeTrade),
    overtradingProxyMetric(entries),
  ];

  const { best: bestRuleCorrelation, worst: worstRuleCorrelation } = pickBestWorstRule(ruleMetrics);
  const exitRows = computeExitBehaviorRows(entries);
  const personalRuleRows = computePersonalRuleCorrelations(entries, personalRules);

  const dataNotes: string[] = [];
  if (ruleMetrics.find((m) => m.key === "no_overtrading")?.yesCount === 0) {
    dataNotes.push("No overtrade rate uses the Overtraded mistake tag — not a journal checkbox.");
  }
  if (exitRows.every((r) => r.source === "discipline_proxy")) {
    dataNotes.push("Exit analysis uses mistake tags (Early exit, Late entry, Moved stop) and plan-follow proxies.");
  }
  if (computeDisciplineScorePercent(entries) === null) {
    dataNotes.push("Log Followed plan, Respected stop, or No revenge to unlock discipline score.");
  }

  const coachingInsights = generateCoachingInsights({
    scores,
    moodRows,
    ruleMetrics,
    bestMood,
    riskiestMood,
    bestRule: bestRuleCorrelation,
    worstRule: worstRuleCorrelation,
    exitRows,
    reflectionWorked,
    reflectionSlipped,
    currency,
  });

  const recommendations = generateBehaviorRecommendations({
    scores,
    bestMood,
    riskiestMood,
    worstRule: worstRuleCorrelation,
    ruleMetrics,
    currency,
  });

  return {
    scores,
    moodRows,
    bestMood,
    riskiestMood,
    ruleMetrics,
    bestRuleCorrelation,
    worstRuleCorrelation,
    exitRows,
    coachingInsights,
    recommendations,
    personalRuleRows,
    dataNotes,
    sufficientData: entries.length >= MIN_ENTRIES_FOR_INSIGHTS,
  };
}
