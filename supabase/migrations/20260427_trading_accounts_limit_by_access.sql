-- Enforce account limits by access state:
-- - admin / premium: up to 5 accounts
-- - trial active / trial expired: up to 1 account

create or replace function public.trading_accounts_max_allowed(p_uid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when up.user_id is null then 1
      when up.is_admin
        or lower(coalesce(up.email, '')) = 'kennethalto95@gmail.com'
        or up.manual_premium
        or up.premium_active
      then 5
      else 1
    end
  from public.user_profiles up
  where up.user_id = p_uid
  union all
  select 1
  limit 1;
$$;

drop policy if exists "trading_accounts_insert_own" on public.trading_accounts;
create policy "trading_accounts_insert_own"
  on public.trading_accounts
  for insert
  with check (
    auth.uid() = user_id
    and public.journal_write_allowed(auth.uid())
    and (
      select count(*)
      from public.trading_accounts ta
      where ta.user_id = auth.uid()
    ) < public.trading_accounts_max_allowed(auth.uid())
  );

