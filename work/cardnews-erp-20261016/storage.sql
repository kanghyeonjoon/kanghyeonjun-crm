begin;
create table public.cardnews_assets (
 id uuid primary key default gen_random_uuid(),
 result_id text not null check(result_id='card-4907aaca'),
 name text not null check(name ~ '^[-a-zA-Z0-9_가-힣. ]{1,120}$' and name not like '%..%'),
 kind text not null check(kind in ('image','zip')),
 position integer not null,
 sha256 text not null check(sha256 ~ '^[a-f0-9]{64}$'),
 bytes bigint not null check(bytes>0 and bytes<=33554432),
 storage_path text not null,
 created_at timestamptz not null default now(),
 unique(result_id,kind,position),
 check((kind='image' and position between 1 and 8 and name like '%.png') or (kind='zip' and position=0 and name like '%.zip')),
 check(storage_path=result_id||'/'||sha256||case when kind='image' then '.png' else '.zip' end)
);
alter table public.cardnews_assets enable row level security;
revoke all on public.cardnews_assets from anon,authenticated;
grant select,insert on public.cardnews_assets to authenticated;
create policy cardnews_read on public.cardnews_assets for select to authenticated using(crm_private.can_access());
create policy cardnews_insert on public.cardnews_assets for insert to authenticated with check(crm_private.can_access(true));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('crm-cardnews','crm-cardnews',false,33554432,array['image/png','application/zip']);
create policy cardnews_file_read on storage.objects for select to authenticated using(bucket_id='crm-cardnews' and crm_private.can_access());
create policy cardnews_file_insert on storage.objects for insert to authenticated with check(bucket_id='crm-cardnews' and crm_private.can_access(true) and name ~ '^card-4907aaca/[a-f0-9]{64}\.(png|zip)$');
notify pgrst,'reload schema';
commit;
