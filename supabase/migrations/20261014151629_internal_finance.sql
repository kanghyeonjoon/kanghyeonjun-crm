begin;
create table public.finance_entries (
 id uuid primary key,
 owner_id uuid not null default auth.uid() references auth.users(id),
 occurred_on date not null check(occurred_on between '2000-01-01' and '2100-12-31'),
 direction text not null check(direction in ('income','expense')),
 amount bigint not null check(amount between 1 and 1000000000000),
 category text not null check(category in ('관리비','제작비','광고비','외주비','인건비','임차료','구독료','세금·수수료','기타')),
 counterparty text not null default '' check(length(counterparty)<=150),
 account_label text not null default '' check(length(account_label)<=100),
 note text not null default '' check(length(note)<=2000),
 archived boolean not null default false,
 version integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.finance_entries enable row level security;
revoke all on public.finance_entries from public,anon,authenticated;
grant select on public.finance_entries to authenticated;
grant insert(id,occurred_on,direction,amount,category,counterparty,account_label,note) on public.finance_entries to authenticated;
grant update(occurred_on,direction,amount,category,counterparty,account_label,note,archived) on public.finance_entries to authenticated;
create policy finance_owner_read on public.finance_entries for select to authenticated using(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create policy finance_owner_insert on public.finance_entries for insert to authenticated with check(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create policy finance_owner_update on public.finance_entries for update to authenticated using(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner')) with check(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create index finance_owner_date on public.finance_entries(owner_id,occurred_on desc,id);
create trigger finance_audit before insert or update on public.finance_entries for each row execute function crm_private.record_change();
create function public.finance_month_summary(month_start date) returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object(
 'income',coalesce(sum(amount) filter(where direction='income'),0)::text,
 'expense',coalesce(sum(amount) filter(where direction='expense'),0)::text,
 'count',count(*)::text
 ) from public.finance_entries where not archived and occurred_on>=date_trunc('month',month_start)::date and occurred_on<(date_trunc('month',month_start)+interval '1 month')::date;
$$;
revoke all on function public.finance_month_summary(date) from public,anon;
grant execute on function public.finance_month_summary(date) to authenticated;
notify pgrst,'reload schema';
commit;
