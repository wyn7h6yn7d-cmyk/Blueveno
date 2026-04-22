import { ADMIN_FULL_ACCESS_EMAIL } from "@/lib/billing/workspace-access";
import type { AccessContext, AccessState, UserProfileRow } from "@/lib/access/types";
import { normalizeDisplayCurrency } from "@/lib/format-pnl";

function parseTrialEnd(iso: string): Date {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

/**
 * Derive product access from persisted profile + session email.
 * Fixed admin email always wins (defense in depth alongside DB sync).
 */
export function resolveAccess(profile: UserProfileRow, sessionEmail: string | null): AccessContext {
  const email = (sessionEmail ?? "").toLowerCase().trim();
  const fixedAdmin = email === ADMIN_FULL_ACCESS_EMAIL.toLowerCase();

  // Primary product owner account is permanently full-access (admin + premium).
  const admin = fixedAdmin || profile.is_admin;
  const premium = fixedAdmin || profile.manual_premium || profile.premium_active;
  const trialEnd = parseTrialEnd(profile.trial_ends_at);
  const trialActive = !premium && trialEnd.getTime() > Date.now();

  let state: AccessState;
  if (admin) {
    state = "admin";
  } else if (premium) {
    state = "premium_active";
  } else if (trialActive) {
    state = "trial_active";
  } else {
    state = "trial_expired";
  }

  const canWriteJournal = admin || premium || trialActive;
  const isReadOnlyTrial = state === "trial_expired";

  return {
    state,
    canWriteJournal,
    isReadOnlyTrial,
    isAdmin: admin,
    trialEndsAt: profile.trial_ends_at,
    profile,
  };
}

export function toClientAccess(ctx: AccessContext, displayCurrency?: string | null) {
  return {
    state: ctx.state,
    canWriteJournal: ctx.canWriteJournal,
    isReadOnlyTrial: ctx.isReadOnlyTrial,
    isAdmin: ctx.isAdmin,
    trialEndsAt: ctx.trialEndsAt,
    displayCurrency: normalizeDisplayCurrency(displayCurrency),
  };
}
