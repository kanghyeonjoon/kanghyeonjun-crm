begin;
create schema if not exists crm_private;
revoke all on schema crm_private from public, anon, authenticated;
create table public.crm_members (
 user_id uuid primary key references auth.users(id),
 role text not null default 'operator' check(role in ('owner','operator','viewer')),
 active boolean not null default true
);
create table crm_private.invites(email text primary key, role text not null check(role in ('owner','operator','viewer')));
alter table crm_private.invites enable row level security;
create function public.crm_enroll() returns boolean language plpgsql security definer set search_path='' as $$
begin
 insert into public.crm_members(user_id,role)
 select u.id,i.role from auth.users u join crm_private.invites i on i.email=lower(u.email)
 where u.id=auth.uid() and u.email_confirmed_at is not null
 on conflict(user_id) do nothing;
 return exists(select 1 from public.crm_members where user_id=auth.uid() and active);
end $$;
create function crm_private.can_access(write_access boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.crm_members where user_id=auth.uid() and active and (not write_access or role in ('owner','operator')));
$$;
grant usage on schema crm_private to authenticated;
revoke all on function crm_private.can_access(boolean) from public;
grant execute on function crm_private.can_access(boolean) to authenticated;
revoke all on function public.crm_enroll() from public;
grant execute on function public.crm_enroll() to authenticated;
create table public.hospitals (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 1 and 150),
 branch text not null default '' check(length(branch)<=100), address text not null default '' check(length(address)<=500),
 contact text not null default '' check(length(contact)<=300), official_url text not null default '' check(official_url='' or official_url ~ '^https?://'),
 management_state text not null default 'needs_review' check(management_state in ('eligible','needs_review','hold','excluded')),
 notes text not null default '' check(length(notes)<=5000), version integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.proposals (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals(id),
 title text not null check(length(trim(title)) between 1 and 200), url text not null default '' check(url='' or url ~ '^https?://'),
 status text not null default 'draft' check(status in ('draft','review_pending','reviewed','superseded')),
 notes text not null default '' check(length(notes)<=5000), version integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index proposals_hospital on public.proposals(hospital_id);
create table public.opportunities (
 id uuid primary key default gen_random_uuid(), hospital_id uuid not null references public.hospitals(id),
 stage text not null default 'research' check(stage in ('research','preparing','contacted','meeting','won','lost','hold')),
 next_action text not null default '' check(length(next_action)<=1000), due_date date,
 version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index opportunities_hospital on public.opportunities(hospital_id);
create table public.crm_audit (
 id bigint generated always as identity primary key, actor uuid, entity text not null, entity_id uuid not null,
 action text not null, occurred_at timestamptz not null default now()
);
create function crm_private.record_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='UPDATE' then
  if new.id<>old.id then raise exception 'identity immutable'; end if;
  new.version=old.version+1; new.created_at=old.created_at; new.updated_at=now();
 end if;
 insert into public.crm_audit(actor,entity,entity_id,action) values(auth.uid(),TG_TABLE_NAME,new.id,TG_OP);
 return new;
end $$;
revoke all on function crm_private.record_change() from public;
alter table public.crm_members enable row level security;
create policy member_self on public.crm_members for select to authenticated using(user_id=auth.uid());
revoke all on public.crm_members from anon, authenticated;
grant select on public.crm_members to authenticated;
alter table public.crm_audit enable row level security;
create policy audit_read on public.crm_audit for select to authenticated using(crm_private.can_access());
revoke all on public.crm_audit from anon, authenticated;
grant select on public.crm_audit to authenticated;
do $$ declare t text; begin
 foreach t in array array['hospitals','proposals','opportunities'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant select,insert,update on public.%I to authenticated',t);
 execute format('create policy read_member on public.%I for select to authenticated using(crm_private.can_access())',t);
 execute format('create policy insert_editor on public.%I for insert to authenticated with check(crm_private.can_access(true))',t);
 execute format('create policy update_editor on public.%I for update to authenticated using(crm_private.can_access(true)) with check(crm_private.can_access(true))',t);
 execute format('create trigger audit_change before insert or update on public.%I for each row execute function crm_private.record_change()',t);
 end loop;
end $$;
create function public.crm_health() returns text language sql security invoker set search_path='' as $$ select 'crm_v1'::text $$;
revoke all on function public.crm_health() from public;
grant execute on function public.crm_health() to anon, authenticated;
notify pgrst,'reload schema';
commit;
