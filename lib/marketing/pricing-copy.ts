/**
 * Marketing + product copy for pricing (EUR). Keep in sync with billing UI / Stripe when live.
 */
export const PRICING_EUR = {
  trialDays: 7,
  monthly: 8.99,
  /** Billed once per year — savings vs 12× monthly at list price (see yearlySavingsPercentApprox) */
  yearly: 89.99,
  currency: "EUR",
} as const;

export function formatEur(n: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export const effectiveMonthlyFromYearlyEur = (): number =>
  Math.round((PRICING_EUR.yearly / 12) * 100) / 100;

/** Approx. savings vs paying monthly for 12 months */
export const yearlySavingsPercentApprox = (): number => {
  const monthlyYearCost = PRICING_EUR.monthly * 12;
  const saved = monthlyYearCost - PRICING_EUR.yearly;
  return Math.round((saved / monthlyYearCost) * 100);
};

export type ComparisonRow = {
  feature: string;
  trial: "yes" | "no" | "limited" | "text";
  trialNote?: string;
  premium: "yes" | "no" | "limited" | "text";
  premiumNote?: string;
  expired: "yes" | "no" | "limited" | "text";
  expiredNote?: string;
};

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    feature: "Length",
    trial: "text",
    trialNote: `${PRICING_EUR.trialDays} days from signup`,
    premium: "text",
    premiumNote: "As long as you subscribe",
    expired: "text",
    expiredNote: "—",
  },
  {
    feature: "Log new trading days",
    trial: "yes",
    premium: "yes",
    expired: "no",
    expiredNote: "Read-only",
  },
  {
    feature: "Notes & linked chart per day",
    trial: "yes",
    premium: "yes",
    expired: "no",
  },
  {
    feature: "Daily P&L & calendar",
    trial: "yes",
    premium: "yes",
    expired: "yes",
    expiredNote: "View existing data",
  },
  {
    feature: "Weekly totals on calendar",
    trial: "yes",
    premium: "yes",
    expired: "yes",
    expiredNote: "View existing data",
  },
  {
    feature: "Stats & overview",
    trial: "yes",
    premium: "yes",
    expired: "yes",
    expiredNote: "View existing data",
  },
];
