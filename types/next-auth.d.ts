import type { PlanTier } from "@/lib/billing/types";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      /** Set from JWT after DB/Stripe sync — see lib/billing/resolve.ts */
      planTier?: PlanTier;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    planTier?: string;
  }
}
