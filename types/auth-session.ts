import type { PlanTier } from "@/lib/billing/types";

/**
 * App session shape (Supabase Auth + billing metadata).
 * Replaces the former NextAuth `Session` type.
 */
export type AuthSession = {
  expires: string;
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    planTier?: PlanTier;
    /** ISO 4217 code from Supabase `user_metadata.display_currency` */
    displayCurrency?: string | null;
    /** IANA timezone from `user_metadata.timezone` (e.g. America/New_York) */
    timezone?: string | null;
  };
};
