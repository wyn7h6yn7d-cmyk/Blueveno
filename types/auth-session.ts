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
  };
};
