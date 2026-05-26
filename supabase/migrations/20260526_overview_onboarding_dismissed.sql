-- Persist "Getting started" dismissal on Overview for each user.

alter table public.user_profiles
  add column if not exists overview_onboarding_dismissed_at timestamptz;

create or replace function public.dismiss_overview_onboarding()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  dismissed_at timestamptz := now();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  update public.user_profiles
  set
    overview_onboarding_dismissed_at = dismissed_at,
    updated_at = dismissed_at
  where user_id = uid;

  return dismissed_at;
end;
$$;

grant execute on function public.dismiss_overview_onboarding() to authenticated;
