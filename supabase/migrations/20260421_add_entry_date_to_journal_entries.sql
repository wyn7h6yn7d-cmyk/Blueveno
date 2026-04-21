alter table if exists public.journal_entries
  add column if not exists entry_date date;

create index if not exists journal_entries_user_id_entry_date_idx
  on public.journal_entries(user_id, entry_date desc nulls last);
