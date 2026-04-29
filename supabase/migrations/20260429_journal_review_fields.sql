alter table public.journal_entries
  add column if not exists session_tag text,
  add column if not exists market_condition text,
  add column if not exists lesson_learned text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'journal_entries_session_tag_check'
      and conrelid = 'public.journal_entries'::regclass
  ) then
    alter table public.journal_entries
      add constraint journal_entries_session_tag_check
      check (
        session_tag is null
        or session_tag in ('London', 'New York', 'London/New York overlap', 'Asia', 'Other')
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'journal_entries_market_condition_check'
      and conrelid = 'public.journal_entries'::regclass
  ) then
    alter table public.journal_entries
      add constraint journal_entries_market_condition_check
      check (
        market_condition is null
        or market_condition in ('Trending', 'Range', 'Choppy', 'High volatility', 'Low volatility', 'News-driven', 'Other')
      );
  end if;
end
$$;
