begin;
create table public.finance_forecast_items(
 id uuid primary key, owner_id uuid not null default auth.uid() references auth.users(id),
 title text not null check(length(btrim(title)) between 1 and 120),
 direction text not null check(direction in ('income','expense')),
 amount bigint not null check(amount between 1 and 1000000000000),
 expected_on date not null check(expected_on between '2020-01-01' and '2100-12-31'),
 status text not null default 'planned' check(status in ('planned','completed','cancelled')),
 version integer not null default 1, created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
alter table public.finance_forecast_items enable row level security;
revoke all on public.finance_forecast_items from public,anon,authenticated;
grant select on public.finance_forecast_items to authenticated;
grant insert(id,title,direction,amount,expected_on,status) on public.finance_forecast_items to authenticated;
grant update(title,direction,amount,expected_on,status) on public.finance_forecast_items to authenticated;
create policy forecast_owner_read on public.finance_forecast_items for select to authenticated using(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create policy forecast_owner_insert on public.finance_forecast_items for insert to authenticated with check(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create policy forecast_owner_update on public.finance_forecast_items for update to authenticated using(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner')) with check(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create function crm_private.forecast_updated() returns trigger language plpgsql security invoker set search_path='' as $$begin new.version=old.version+1;new.updated_at=now();return new;end;$$;
revoke all on function crm_private.forecast_updated() from public,anon,authenticated;
create trigger forecast_updated before update on public.finance_forecast_items for each row execute function crm_private.forecast_updated();
create index forecast_owner_date on public.finance_forecast_items(owner_id,expected_on,id);
create table public.clobe_connections(owner_id uuid primary key references auth.users(id),credential text not null,company_id text not null,company_name text not null,expires_at timestamptz not null,refresh_lock timestamptz,updated_at timestamptz not null default now());
create table public.clobe_oauth_states(state_hash text primary key,owner_id uuid not null references auth.users(id),payload text not null,expires_at timestamptz not null,consumed boolean not null default false);
alter table public.clobe_connections enable row level security;
alter table public.clobe_oauth_states enable row level security;
revoke all on public.clobe_connections,public.clobe_oauth_states from public,anon,authenticated;
grant all on public.clobe_connections,public.clobe_oauth_states to service_role;
notify pgrst,'reload schema';
commit;
