import type { JournalRow } from "@/lib/user-data/types";

export type PersonalRuleRef = { id: string; title: string; is_active: boolean };

export type TradeRuleAdherence = {
  followed: string[];
  broken: string[];
  unchecked: string[];
};

export function buildTradeRuleAdherence(
  row: JournalRow,
  rules: PersonalRuleRef[],
): TradeRuleAdherence {
  const followed: string[] = [];
  const broken: string[] = [];
  const unchecked: string[] = [];

  for (const rule of rules) {
    if (!rule.is_active) continue;
    const flag = row.ruleChecks?.[rule.id];
    if (flag === true) followed.push(rule.title);
    else if (flag === false) broken.push(rule.title);
    else unchecked.push(rule.title);
  }

  return { followed, broken, unchecked };
}
