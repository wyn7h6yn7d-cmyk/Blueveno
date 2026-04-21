-- User profiles: trial, premium flags, admin — source of truth for entitlements (with server-side enforcement).
-- Stripe-ready: premium_active + stripe_* filled by webhooks later; manual_premium for admin grants.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null default '',
  is_admin boolean not null default false,
  trial_ends_at timestamptz not null,
  manual_premium boolean not null default false,
  premium_active boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  account_disabled boolean not null default false,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_email_lower_idx on public.user_profiles (lower(email));

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

create or replace function public.set_updated_at_user_profiles()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute procedure public.set_updated_at_user_profiles();

-- Backfill existing auth users
insert into public.user_profiles (user_id, email, trial_ends_at)
select
  u.id,
  lower(coalesce(u.email, '')),
  coalesce(u.created_at, now()) + interval '7 days'
from auth.users u
on conflict (user_id) do nothing;

update public.user_profiles
set
  is_admin = true,
  manual_premium = true,
  premium_active = true,
  trial_ends_at = greatest(trial_ends_at, now() + interval '36500 days')
where lower(email) = 'kennethalto95@gmail.com';

-- New signups
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email, trial_ends_at)
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.created_at, now()) + interval '7 days'
  )
  on conflict (user_id) do update set
    email = excluded.email,
    updated_at = now();

  if lower(coalesce(new.email, '')) = 'kennethalto95@gmail.com' then
    update public.user_profiles
    set
      is_admin = true,
      manual_premium = true,
      premium_active = true,
      trial_ends_at = greatest(trial_ends_at, now() + interval '36500 days'),
      updated_at = now()
    where user_id = new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute procedure public.handle_new_user_profile();

-- Writes to journal_entries require entitlement (trial, premium, or admin)
create or replace function public.journal_write_allowed(p_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select
        (not up.account_disabled)
        and (
          up.is_admin
          or up.manual_premium
          or up.premium_active
          or up.trial_ends_at > now()
        )
      from public.user_profiles up
      where up.user_id = p_uid
    ),
    false
  );
$$;

drop policy if exists "journal_entries_insert_own" on public.journal_entries;
create policy "journal_entries_insert_own"
  on public.journal_entries
  for insert
  with check (
    auth.uid() = user_id
    and public.journal_write_allowed(auth.uid())
  );

drop policy if exists "journal_entries_update_own" on public.journal_entries;
create policy "journal_entries_update_own"
  on public.journal_entries
  for update
  using (auth.uid() = user_id and public.journal_write_allowed(auth.uid()))
  with check (auth.uid() = user_id and public.journal_write_allowed(auth.uid()));

drop policy if exists "journal_entries_delete_own" on public.journal_entries;
create policy "journal_entries_delete_own"
  on public.journal_entries
  for delete
  using (auth.uid() = user_id and public.journal_write_allowed(auth.uid()));

-- Idempotent profile row + fixed admin sync + activity ping
create or replace function public.ensure_user_profile()
returns public.user_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  u record;
  profile_row public.user_profiles;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  select id, email, created_at into u from auth.users where id = uid;
  if not found then
    raise exception 'user not found';
  end if;

  insert into public.user_profiles (user_id, email, trial_ends_at)
  values (
    uid,
    lower(coalesce(u.email, '')),
    coalesce(u.created_at, now()) + interval '7 days'
  )
  on conflict (user_id) do update set
    email = excluded.email,
    updated_at = now();

  if lower(coalesce(u.email, '')) = 'kennethalto95@gmail.com' then
    update public.user_profiles
    set
      is_admin = true,
      manual_premium = true,
      premium_active = true,
      trial_ends_at = greatest(trial_ends_at, now() + interval '36500 days'),
      updated_at = now()
    where user_id = uid;
  end if;

  update public.user_profiles
  set last_active_at = now(), updated_at = now()
  where user_id = uid;

  select * into profile_row from public.user_profiles where user_id = uid;
  return profile_row;
end;
$$;

grant execute on function public.ensure_user_profile() to authenticated;
