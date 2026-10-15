begin;
create table public.finance_mindset (
 owner_id uuid primary key references auth.users(id),
 beliefs text[] not null check(cardinality(beliefs) between 1 and 50 and array_position(beliefs,null) is null and octet_length(beliefs::text)<=200000),
 letter text not null check(length(btrim(letter)) between 1 and 20000),
 version integer not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.finance_mindset enable row level security;
revoke all on public.finance_mindset from public,anon,authenticated;
grant select on public.finance_mindset to authenticated;
grant update(beliefs,letter) on public.finance_mindset to authenticated;
create policy mindset_owner_read on public.finance_mindset for select to authenticated using(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create policy mindset_owner_update on public.finance_mindset for update to authenticated using(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner')) with check(owner_id=(select auth.uid()) and exists(select 1 from public.crm_members where user_id=(select auth.uid()) and active and role='owner'));
create function crm_private.mindset_updated() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from unnest(new.beliefs) as b where length(btrim(b))=0 or length(b)>1000) then raise exception 'Invalid belief length'; end if;
 new.version=old.version+1;new.updated_at=now();return new;
end;$$;
revoke all on function crm_private.mindset_updated() from public,anon,authenticated;
create trigger mindset_updated before update on public.finance_mindset for each row execute function crm_private.mindset_updated();
notify pgrst,'reload schema';
commit;
