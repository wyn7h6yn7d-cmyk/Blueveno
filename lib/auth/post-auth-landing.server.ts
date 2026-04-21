import "server-only";

import type { AuthSession } from "@/types/auth-session";
import { loadAccessForUser } from "@/lib/access/load-access";

/** Where to send a user who already has a Supabase session (avoids login ↔ app redirect loops). */
export async function resolvePostAuthLanding(
  session: AuthSession,
): Promise<"app" | "account_disabled" | "profile_error"> {
  const access = await loadAccessForUser(session.user.id, session.user.email ?? null);
  if (!access) return "profile_error";
  if (access.profile.account_disabled) return "account_disabled";
  return "app";
}
