create table public.diagnosis_submissions (
 id uuid primary key, source text not null, name text not null, email text not null, phone text not null,
 reason text not null, gender text not null, age text not null, channel_url text not null,
 consent boolean not null check(consent), consent_version text not null,
 payload_hash text not null, ip_hash text not null, created_at timestamptz not null default now()
);
create index diagnosis_submissions_created on public.diagnosis_submissions(created_at desc);
create index diagnosis_submissions_ip_time on public.diagnosis_submissions(ip_hash,created_at);
create table public.diagnosis_notifications (
 id uuid primary key default gen_random_uuid(), submission_id uuid not null references public.diagnosis_submissions(id),
 kind text not null check(kind in ('applicant_email','admin_email','applicant_alimtalk')),
 status text not null default 'pending' check(status in ('pending','sending','accepted','uncertain')),
 provider_id text, updated_at timestamptz not null default now(),unique(submission_id,kind)
);
alter table public.diagnosis_submissions enable row level security;
alter table public.diagnosis_notifications enable row level security;
revoke all on public.diagnosis_submissions,public.diagnosis_notifications from anon,authenticated;
grant select on public.diagnosis_submissions,public.diagnosis_notifications to authenticated;
grant all on public.diagnosis_submissions,public.diagnosis_notifications to service_role;
create policy diagnosis_member_read on public.diagnosis_submissions for select to authenticated using ((select crm_private.can_access()));
create policy diagnosis_notifications_read on public.diagnosis_notifications for select to authenticated using ((select crm_private.can_access()));
create function public.submit_diagnosis(p_id uuid,p_data jsonb,p_ip_hash text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare old_hash text; new_hash text; recent integer;
begin
 new_hash:=md5(p_data::text);
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select payload_hash into old_hash from public.diagnosis_submissions where id=p_id;
 if found then
  if old_hash<>new_hash then raise exception 'idempotency_conflict';end if;
  return jsonb_build_object('created',false);
 end if;
 perform pg_advisory_xact_lock(hashtextextended(p_ip_hash,0));
 select count(*) into recent from public.diagnosis_submissions where ip_hash=p_ip_hash and created_at>now()-interval '1 hour';
 if recent>=5 then raise exception 'rate_limited';end if;
 insert into public.diagnosis_submissions(id,source,name,email,phone,reason,gender,age,channel_url,consent,consent_version,payload_hash,ip_hash)
 values(p_id,p_data->>'source',p_data->>'name',p_data->>'email',p_data->>'phone',p_data->>'reason',p_data->>'gender',p_data->>'age',p_data->>'channelUrl',(p_data->>'consent')::boolean,p_data->>'consent_version',new_hash,p_ip_hash);
 insert into public.diagnosis_notifications(submission_id,kind) values(p_id,'applicant_email'),(p_id,'admin_email'),(p_id,'applicant_alimtalk');
 return jsonb_build_object('created',true);
end $$;
revoke all on function public.submit_diagnosis(uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_diagnosis(uuid,jsonb,text) to service_role;
