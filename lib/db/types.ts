/**
 * Domain types — align future Prisma/Drizzle models with these shapes.
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
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
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodEnd: Date | null;
}
