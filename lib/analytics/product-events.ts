/** Product analytics event names (Vercel Web Analytics custom events). */
export const PRODUCT_ANALYTICS_EVENTS = {
  signupCompleted: "signup_completed",
  firstTradingAccountCreated: "first_trading_account_created",
  journalEntryCreated: "journal_entry_created",
  journalEntryEdited: "journal_entry_edited",
  calendarOpened: "calendar_opened",
  statsOpened: "stats_opened",
  weeklyReviewSaved: "weekly_review_saved",
  exportCsvClicked: "export_csv_clicked",
  premiumRequestClicked: "premium_request_clicked",
  readOnlyBlocked: "read_only_blocked",
} as const;

export type ProductAnalyticsEvent =
  (typeof PRODUCT_ANALYTICS_EVENTS)[keyof typeof PRODUCT_ANALYTICS_EVENTS];

/** Allowed property keys — never include P&L, notes, symbols, or account names. */
export type ProductAnalyticsProps = {
  /** Where the action happened (page or UI surface). */
  surface?: string;
  /** Read-only block context (generic slug, not user content). */
  context?: string;
  /** CSV export target. */
  export_type?: "journal" | "calendar_summary" | "stats_summary";
  /** Signup path when no session is issued immediately. */
  signup_flow?: "session" | "email_confirmation";
  /** Premium CTA placement. */
  source?: string;
};

const SENSITIVE_KEY = /email|password|note|pnl|symbol|chart|balance|amount|name|token|url/i;

export function sanitizeProductAnalyticsProps(
  props?: ProductAnalyticsProps,
): Record<string, string | number | boolean> | undefined {
  if (!props) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (SENSITIVE_KEY.test(key)) continue;
    if (typeof value === "string" && value.length > 48) continue;
    out[key] = value;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}
