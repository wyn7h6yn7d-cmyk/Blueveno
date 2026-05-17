/** Align legacy behavior columns with personal rule checklist toggles before save. */
export function syncLegacyBehaviorFromRuleChecks(
  personalRules: Array<{ id: string; title: string }>,
  ruleChecks: Record<string, boolean>,
  toggles: {
    followedPlan: boolean;
    respectedStop: boolean;
    noRevengeTrade: boolean;
  },
): { followedPlan: boolean; respectedStop: boolean; noRevengeTrade: boolean } {
  const next = { ...toggles };
  for (const rule of personalRules) {
    const checked = Boolean(ruleChecks[rule.id]);
    const title = rule.title.toLowerCase();
    if (title === "followed my plan") next.followedPlan = checked;
    if (title === "respected my stop") next.respectedStop = checked;
    if (title === "no revenge trade") next.noRevengeTrade = checked;
  }
  return next;
}
