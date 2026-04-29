alter table public.weekly_reflections
  add column if not exists account_id uuid references public.trading_accounts(id) on delete cascade,
  add column if not exists next_week_rule text,
  add column if not exists confidence_score smallint,
  add column if not exists weekly_note text;

update public.weekly_reflections wr
set account_id = up.active_trading_account_id
from public.user_profiles up
where wr.user_id = up.user_id
  and wr.account_id is null
  and up.active_trading_account_id is not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'weekly_reflections_confidence_score_check'
      and conrelid = 'public.weekly_reflections'::regclass
  ) then
    alter table public.weekly_reflections
      add constraint weekly_reflections_confidence_score_check
      check (confidence_score is null or confidence_score between 1 and 5);
  end if;
end
$$;

create unique index if not exists weekly_reflections_user_account_week_uq
  on public.weekly_reflections(user_id, account_id, week_start)
  where account_id is not null;

drop policy if exists "weekly_reflections_select_own" on public.weekly_reflections;
create policy "weekly_reflections_select_own"
  on public.weekly_reflections
  for select
  using (
    auth.uid() = user_id
    and (
      account_id is null
      or exists (
        select 1
        from public.trading_accounts ta
        where ta.id = account_id
          and ta.user_id = auth.uid()
      )
    )
  );

drop policy if exists "weekly_reflections_insert_own" on public.weekly_reflections;
create policy "weekly_reflections_insert_own"
  on public.weekly_reflections
  for insert
  with check (
    auth.uid() = user_id
    and account_id is not null
    and exists (
      select 1
      from public.trading_accounts ta
      where ta.id = account_id
        and ta.user_id = auth.uid()
    )
    and public.journal_write_allowed(auth.uid())
  );

drop policy if exists "weekly_reflections_update_own" on public.weekly_reflections;
create policy "weekly_reflections_update_own"
  on public.weekly_reflections
  for update
  using (
    auth.uid() = user_id
    and account_id is not null
    and exists (
      select 1
      from public.trading_accounts ta
      where ta.id = account_id
        and ta.user_id = auth.uid()
    )
    and public.journal_write_allowed(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and account_id is not null
    and exists (
      select 1
      from public.trading_accounts ta
      where ta.id = account_id
        and ta.user_id = auth.uid()
    )
    and public.journal_write_allowed(auth.uid())
  );

drop policy if exists "weekly_reflections_delete_own" on public.weekly_reflections;
create policy "weekly_reflections_delete_own"
  on public.weekly_reflections
  for delete
  using (
    auth.uid() = user_id
    and account_id is not null
    and exists (
      select 1
      from public.trading_accounts ta
      where ta.id = account_id
        and ta.user_id = auth.uid()
    )
    and public.journal_write_allowed(auth.uid())
  );
