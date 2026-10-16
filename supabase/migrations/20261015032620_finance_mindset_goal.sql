begin;
alter table public.finance_mindset
 add column goal_amount bigint not null default 400000000 check(goal_amount between 1 and 1000000000000),
 add column goal_date date not null default '2028-12-31',
 add column card_amount bigint not null default 0 check(card_amount between 0 and 1000000000000),
 add column card_month text not null default '2026-11' check(card_month ~ '^20[0-9]{2}-(0[1-9]|1[0-2])$'),
 add column card_paid boolean not null default false;
grant update(goal_amount,goal_date,card_amount,card_month,card_paid) on public.finance_mindset to authenticated;
notify pgrst,'reload schema';
commit;
