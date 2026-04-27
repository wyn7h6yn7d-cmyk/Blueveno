-- Backfill pre-account journal rows so existing data remains visible.
-- 1) Ensure each user with accounts has an active_trading_account_id
-- 2) Attach legacy journal_entries rows (account_id is null) to that active account

with first_account as (
  select distinct on (ta.user_id)
    ta.user_id,
    ta.id as account_id
  from public.trading_accounts ta
  order by ta.user_id, ta.created_at asc
)
update public.user_profiles up
set active_trading_account_id = fa.account_id,
    updated_at = now()
from first_account fa
where up.user_id = fa.user_id
  and up.active_trading_account_id is null;

update public.journal_entries je
set account_id = up.active_trading_account_id
from public.user_profiles up
where je.user_id = up.user_id
  and je.account_id is null
  and up.active_trading_account_id is not null;
