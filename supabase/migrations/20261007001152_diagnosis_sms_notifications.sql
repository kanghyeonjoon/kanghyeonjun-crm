alter table public.diagnosis_notifications drop constraint diagnosis_notifications_kind_check;
alter table public.diagnosis_notifications add constraint diagnosis_notifications_kind_check check(kind in ('applicant_email','admin_email','applicant_alimtalk','applicant_sms','admin_sms'));
create or replace function public.submit_diagnosis(p_id uuid,p_data jsonb,p_ip_hash text) returns jsonb
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
 insert into public.diagnosis_notifications(submission_id,kind) values(p_id,'applicant_email'),(p_id,'admin_email'),(p_id,'applicant_alimtalk'),(p_id,'applicant_sms'),(p_id,'admin_sms');
 return jsonb_build_object('created',true);
end $$;
