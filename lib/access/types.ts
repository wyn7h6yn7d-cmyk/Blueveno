/** High-level access state for UI + server checks (derived from user_profiles + fixed admin email). */
export type AccessState = "admin" | "trial_active" | "premium_active" | "trial_expired";

export type UserProfileRow = {
  user_id: string;
  email: string;
  is_admin: boolean;
  trial_ends_at: string;
  manual_premium: boolean;
  premium_active: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  account_disabled: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AccessContext = {
  state: AccessState;
  /** Journal insert/update/delete — enforced in Postgres via RLS + mirrored in UI */
  canWriteJournal: boolean;
  /** Read-only trial: can still use the app, view data, open TradingView links */
  isReadOnlyTrial: boolean;
  isAdmin: boolean;
  trialEndsAt: string | null;
  profile: UserProfileRow;
};

/** Serializable subset for client components */
export type AccessContextClient = {
  state: AccessState;
  canWriteJournal: boolean;
  isReadOnlyTrial: boolean;
  isAdmin: boolean;
  trialEndsAt: string | null;
};
