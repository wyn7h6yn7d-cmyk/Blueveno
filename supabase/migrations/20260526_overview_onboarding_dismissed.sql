-- Persist "Getting started" dismissal on Overview for each user.

alter table public.user_profiles
  add column if not exists overview_onboarding_dismissed_at timestamptz;
