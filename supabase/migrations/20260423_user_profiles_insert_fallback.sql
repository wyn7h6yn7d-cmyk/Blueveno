-- Fallback when ensure_user_profile RPC is missing or fails: allow creating own row with no privilege flags.
-- Trial window is bounded to reduce abuse.
--
-- PREREQUISITE: public.user_profiles must already exist. If you see "relation does not exist", run FIRST
-- (in order, in SQL editor): 20260421_create_journal_entries.sql, then 20260422_user_profiles_access.sql
-- (full contents), then re-run this file.

do $guard$
begin
  if to_regclass('public.user_profiles') is null then
    raise exception
      'public.user_profiles does not exist. Run the full script supabase/migrations/20260422_user_profiles_access.sql first (after journal migrations if needed), then run this file again.';
  end if;
end
$guard$;

drop policy if exists "user_profiles_insert_own" on public.user_profiles;
create policy "user_profiles_insert_own"
  on public.user_profiles
  for insert
  with check (
    auth.uid() = user_id
    and coalesce(is_admin, false) = false
    and coalesce(manual_premium, false) = false
    and coalesce(premium_active, false) = false
    and coalesce(account_disabled, false) = false
    and trial_ends_at <= now() + interval '8 days'
    and trial_ends_at >= now() - interval '1 minute'
  );
