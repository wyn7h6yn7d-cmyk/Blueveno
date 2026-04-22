alter table public.journal_entries
  add column if not exists mood_state text check (mood_state in ('Calm', 'Focused', 'Hesitant', 'Tilted')),
  add column if not exists followed_plan boolean not null default false,
  add column if not exists respected_stop boolean not null default false,
  add column if not exists no_revenge_trade boolean not null default false;

create table if not exists public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  what_worked text,
  what_slipped text,
  next_week_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_reflections_user_week_idx
  on public.weekly_reflections(user_id, week_start desc);

alter table public.weekly_reflections enable row level security;

drop policy if exists "weekly_reflections_select_own" on public.weekly_reflections;
create policy "weekly_reflections_select_own"
  on public.weekly_reflections
  for select
  using (auth.uid() = user_id);

drop policy if exists "weekly_reflections_insert_own" on public.weekly_reflections;
create policy "weekly_reflections_insert_own"
  on public.weekly_reflections
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "weekly_reflections_update_own" on public.weekly_reflections;
create policy "weekly_reflections_update_own"
  on public.weekly_reflections
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "weekly_reflections_delete_own" on public.weekly_reflections;
create policy "weekly_reflections_delete_own"
  on public.weekly_reflections
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at_weekly_reflections()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_weekly_reflections_updated_at on public.weekly_reflections;
create trigger trg_weekly_reflections_updated_at
before update on public.weekly_reflections
for each row
execute procedure public.set_updated_at_weekly_reflections();
