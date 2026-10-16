create table public.granter_operations (
 id uuid primary key,
 owner_id uuid not null references auth.users(id),
 connection text not null,
 workspace_id bigint not null,
 operation text not null,
 fingerprint text not null,
 state text not null default 'dispatching' check(state in ('dispatching','accepted','rejected','uncertain')),
 result_id text,
 created_at timestamptz not null default now(),
 completed_at timestamptz,
 unique(owner_id,connection,operation,fingerprint)
);
alter table public.granter_operations enable row level security;
revoke all on public.granter_operations from public,anon,authenticated;
grant select,insert,update on public.granter_operations to service_role;
create index granter_operations_owner_created on public.granter_operations(owner_id,created_at desc);
comment on table public.granter_operations is 'Server-only irreversible dispatch reservations. No raw financial payloads or secrets. Uncertain requests never automatically replay.';
