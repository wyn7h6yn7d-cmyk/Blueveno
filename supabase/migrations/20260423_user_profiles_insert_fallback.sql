-- Fallback when ensure_user_profile RPC is missing or fails: allow creating own row with no privilege flags.
-- Trial window is bounded to reduce abuse.

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
