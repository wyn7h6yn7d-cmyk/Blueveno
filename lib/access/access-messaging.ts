import type { AccessContextClient } from "@/lib/access/types";

export const BLUEVENO_SUPPORT_EMAIL = "kennethalto95@gmail.com";

export const PREMIUM_REQUEST_MAILTO = `mailto:${BLUEVENO_SUPPORT_EMAIL}?subject=${encodeURIComponent("Blueveno Premium Access Request")}`;

export const PLAN_ACCESS_HREF = "/app/settings/billing";

/** Premium value props — keep aligned with Plan & access and upgrade surfaces */
export const PREMIUM_VALUE_POINTS = [
  "Ongoing journaling after trial",
  "Up to 5 trading accounts",
  "Full calendar history",
  "Stats and behavior review",
  "Linked chart on every entry",
] as const;

export function getTrialDaysRemaining(trialEndsAt: string | null, nowMs = Date.now()): number | null {
  if (!trialEndsAt || Number.isNaN(Date.parse(trialEndsAt))) return null;
  const diffMs = Date.parse(trialEndsAt) - nowMs;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatTrialEndDate(trialEndsAt: string | null): string | null {
  if (!trialEndsAt || Number.isNaN(Date.parse(trialEndsAt))) return null;
  return new Date(trialEndsAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Calm label for banners — e.g. "4 days left in trial" */
export function formatTrialDaysLabel(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return "Trial ends today";
  if (days === 1) return "1 day left in your trial";
  return `${days} days left in your trial`;
}

export function shouldShowUpgradeMessaging(
  access: Pick<AccessContextClient, "state" | "isAdmin">,
): boolean {
  if (access.isAdmin || access.state === "admin" || access.state === "premium_active") return false;
  return access.state === "trial_active" || access.state === "trial_expired";
}

export function isReadOnlyWorkspace(
  access: Pick<AccessContextClient, "state" | "canWriteJournal" | "isAdmin">,
): boolean {
  if (access.isAdmin || access.state === "admin" || access.state === "premium_active") return false;
  return access.state === "trial_expired" || !access.canWriteJournal;
}

export function readOnlyBlockedMessage(context?: string): string {
  const base =
    "Your workspace is read-only. Saved entries, calendar history, and chart links stay available.";
  if (!context) return base;
  return `${base} Premium restores ${context}.`;
}
