-- Trading accounts + active account binding for workspace filtering.

create table if not exists public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  account_type text not null,
  currency text not null default 'EUR',
  broker_platform text,
  starting_balance numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trading_accounts_account_type_check
    check (account_type in ('Live', 'Demo', 'Prop', 'Challenge', 'Funded', 'Other'))
);

create index if not exists trading_accounts_user_id_idx
  on public.trading_accounts(user_id, created_at desc);

alter table public.trading_accounts enable row level security;

drop policy if exists "trading_accounts_select_own" on public.trading_accounts;
create policy "trading_accounts_select_own"
  on public.trading_accounts
  for select
  using (auth.uid() = user_id);

drop policy if exists "trading_accounts_insert_own" on public.trading_accounts;
create policy "trading_accounts_insert_own"
  on public.trading_accounts
  for insert
  with check (
    auth.uid() = user_id
    and public.journal_write_allowed(auth.uid())
  );

drop policy if exists "trading_accounts_update_own" on public.trading_accounts;
create policy "trading_accounts_update_own"
  on public.trading_accounts
  for update
  using (
    auth.uid() = user_id
    and public.journal_write_allowed(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and public.journal_write_allowed(auth.uid())
  );

drop policy if exists "trading_accounts_delete_own" on public.trading_accounts;
create policy "trading_accounts_delete_own"
  on public.trading_accounts
  for delete
  using (
    auth.uid() = user_id
    and public.journal_write_allowed(auth.uid())
  );

create or replace function public.set_updated_at_trading_accounts()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_trading_accounts_updated_at on public.trading_accounts;
create trigger trg_trading_accounts_updated_at
before update on public.trading_accounts
for each row execute procedure public.set_updated_at_trading_accounts();

-- Bind active account on user profile.
alter table public.user_profiles
  add column if not exists active_trading_account_id uuid references public.trading_accounts(id) on delete set null;

-- Bind each journal row to a trading account.
alter table public.journal_entries
  add column if not exists account_id uuid references public.trading_accounts(id) on delete restrict;

create index if not exists journal_entries_user_id_account_id_created_at_idx
  on public.journal_entries(user_id, account_id, created_at desc);
