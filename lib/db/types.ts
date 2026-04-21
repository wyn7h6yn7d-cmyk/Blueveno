/**
 * Placeholder domain models — align future Prisma schema with these shapes.
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  onboardingCompletedAt: Date | null;
  stripeCustomerId: string | null;
  createdAt: Date;
}

export interface TradingAccount {
  id: string;
  userId: string;
  label: string;
  kind: "live" | "sim" | "prop";
  firmId?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  accountId: string;
  openedAt: Date;
  closedAt: Date | null;
  pnlR: number | null;
  setupTags: string[];
  notes: string | null;
  tradingViewUrl: string | null;
}

export interface AnalyticsSnapshot {
  id: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  netR: number;
  tradeCount: number;
  metadata: Record<string, unknown>;
}

export interface Playbook {
  id: string;
  userId: string;
  title: string;
  body: string;
  updatedAt: Date;
}

export interface ReviewSession {
  id: string;
  userId: string;
  journalEntryId: string | null;
  summary: string | null;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  planSlug: "free" | "pro" | "enterprise";
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodEnd: Date | null;
}
