-- Limit each user to at most 5 trading accounts.

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
    ) < 5
  );
