-- Admin internal notes + manual premium audit metadata.
-- Safe/idempotent additive migration.

alter table public.user_profiles
  add column if not exists display_name text,
  add column if not exists internal_note text,
  add column if not exists premium_granted_reason text,
  add column if not exists premium_granted_at timestamptz,
  add column if not exists premium_granted_by uuid references auth.users (id);

-- Backfill display names from auth metadata when available.
update public.user_profiles up
set display_name = nullif(
  coalesce(
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'name',
    au.raw_app_meta_data ->> 'name',
    ''
  ),
  ''
)
from auth.users au
where au.id = up.user_id
  and (up.display_name is null or btrim(up.display_name) = '');
