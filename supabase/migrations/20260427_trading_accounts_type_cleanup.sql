-- Remove legacy "Prop" account type and normalize existing rows.

update public.trading_accounts
set account_type = 'Other'
where account_type = 'Prop';

alter table public.trading_accounts
drop constraint if exists trading_accounts_account_type_check;

alter table public.trading_accounts
add constraint trading_accounts_account_type_check
check (account_type in ('Live', 'Demo', 'Challenge', 'Funded', 'Other'));
