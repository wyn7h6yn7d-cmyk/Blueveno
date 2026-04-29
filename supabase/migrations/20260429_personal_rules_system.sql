create table if not exists public.personal_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Risk', 'Entry', 'Exit', 'Session', 'Behavior', 'Other')),
  is_active boolean not null default true,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists personal_rules_user_idx on public.personal_rules(user_id, is_active, created_at desc);
create unique index if not exists personal_rules_user_title_unique on public.personal_rules(user_id, lower(title));

alter table public.personal_rules enable row level security;

drop policy if exists "personal_rules_select_own" on public.personal_rules;
create policy "personal_rules_select_own"
  on public.personal_rules
  for select
  using (auth.uid() = user_id);

drop policy if exists "personal_rules_insert_own" on public.personal_rules;
create policy "personal_rules_insert_own"
  on public.personal_rules
  for insert
  with check (auth.uid() = user_id and public.journal_write_allowed(auth.uid()));

drop policy if exists "personal_rules_update_own" on public.personal_rules;
create policy "personal_rules_update_own"
  on public.personal_rules
  for update
  using (auth.uid() = user_id and public.journal_write_allowed(auth.uid()))
  with check (auth.uid() = user_id and public.journal_write_allowed(auth.uid()));

drop policy if exists "personal_rules_delete_own" on public.personal_rules;
create policy "personal_rules_delete_own"
  on public.personal_rules
  for delete
  using (auth.uid() = user_id and public.journal_write_allowed(auth.uid()));

create or replace function public.set_updated_at_personal_rules()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_personal_rules_updated_at on public.personal_rules;
create trigger trg_personal_rules_updated_at
before update on public.personal_rules
for each row execute procedure public.set_updated_at_personal_rules();

alter table public.journal_entries
  add column if not exists rule_checks jsonb not null default '{}'::jsonb;

create or replace function public.seed_default_personal_rules(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.personal_rules (user_id, title, category, is_active)
  values
    (p_user_id, 'Followed my plan', 'Behavior', true),
    (p_user_id, 'Respected my stop', 'Risk', true),
    (p_user_id, 'No revenge trade', 'Behavior', true),
    (p_user_id, 'No overtrading', 'Risk', true),
    (p_user_id, 'Waited for A+ setup', 'Entry', true)
  on conflict (user_id, lower(title)) do nothing;
end;
$$;

grant execute on function public.seed_default_personal_rules(uuid) to authenticated;

do $$
declare
  u record;
begin
  for u in select id from auth.users loop
    perform public.seed_default_personal_rules(u.id);
  end loop;
end;
$$;

with default_rules as (
  select
    pr.user_id,
    max(case when lower(pr.title) = 'followed my plan' then pr.id end) as plan_rule_id,
    max(case when lower(pr.title) = 'respected my stop' then pr.id end) as stop_rule_id,
    max(case when lower(pr.title) = 'no revenge trade' then pr.id end) as revenge_rule_id
  from public.personal_rules pr
  group by pr.user_id
)
update public.journal_entries je
set rule_checks = coalesce(je.rule_checks, '{}'::jsonb)
  || case when dr.plan_rule_id is not null then jsonb_build_object(dr.plan_rule_id::text, coalesce(je.followed_plan, false)) else '{}'::jsonb end
  || case when dr.stop_rule_id is not null then jsonb_build_object(dr.stop_rule_id::text, coalesce(je.respected_stop, false)) else '{}'::jsonb end
  || case when dr.revenge_rule_id is not null then jsonb_build_object(dr.revenge_rule_id::text, coalesce(je.no_revenge_trade, false)) else '{}'::jsonb end
from default_rules dr
where dr.user_id = je.user_id;
