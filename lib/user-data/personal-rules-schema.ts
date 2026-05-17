/** True when PostgREST cannot see public.personal_rules (table not migrated yet). */
export function isMissingPersonalRulesTableError(
  message: string | undefined,
  code?: string | undefined,
): boolean {
  const m = (message ?? "").toLowerCase();
  const c = (code ?? "").toUpperCase();
  if (c === "PGRST205") return true;
  return (
    m.includes("personal_rules") &&
    (m.includes("could not find the table") || m.includes("does not exist")) &&
    !m.includes("column")
  );
}

export const PERSONAL_RULES_SETUP_MESSAGE =
  "Personal rules are not set up on this database yet. In Supabase → SQL Editor, run the migration file supabase/migrations/20260429_personal_rules_system.sql, then reload this page.";
