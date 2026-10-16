create table public.columns (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(trim(title)) between 1 and 160),
 summary text not null default '' check(length(summary)<=500),
 body text not null check(length(trim(body)) between 1 and 50000),
 category text not null check(category in ('병원 마케팅','유튜브 운영')),
 image_url text not null default '' check(image_url='' or image_url ~ '^https://'),
 status text not null default 'draft' check(status in ('draft','published','archived')),
 version integer not null default 1,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 published_at timestamptz,
 check(status<>'published' or published_at is not null)
);
alter table public.columns enable row level security;
revoke all on public.columns from anon,authenticated;
grant select on public.columns to anon,authenticated;
grant insert,update on public.columns to authenticated;
create policy columns_public_read on public.columns for select to anon,authenticated using(status='published');
create policy columns_member_read on public.columns for select to authenticated using((select crm_private.can_access()));
create policy columns_editor_insert on public.columns for insert to authenticated with check((select crm_private.can_access(true)));
create policy columns_editor_update on public.columns for update to authenticated using((select crm_private.can_access(true))) with check((select crm_private.can_access(true)));
create function crm_private.touch_column() returns trigger language plpgsql set search_path='' as $$
begin new.version=old.version+1;new.updated_at=now();return new;end $$;
create trigger columns_touch before update on public.columns for each row execute function crm_private.touch_column();
create index columns_public_date on public.columns(published_at desc,id) where status='published';
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('column-images','column-images',true,3145728,array['image/jpeg','image/png','image/webp']);
create policy column_images_insert on storage.objects for insert to authenticated with check(bucket_id='column-images' and (select crm_private.can_access(true)));
