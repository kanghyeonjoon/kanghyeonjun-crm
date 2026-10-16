alter table public.diagnosis_submissions
 add column workflow_status text not null default 'new' check (workflow_status in ('new','contacting','completed','on_hold')),
 add column consultation_note text not null default '' check (char_length(consultation_note)<=5000),
 add column scheduled_start timestamptz,
 add column scheduled_end timestamptz,
 add column meeting_method text not null default '' check (char_length(meeting_method)<=200),
 add column management_version integer not null default 0,
 add constraint diagnosis_schedule_valid check (
 (scheduled_start is null and scheduled_end is null and meeting_method='') or
 (scheduled_start is not null and scheduled_end is not null and isfinite(scheduled_start) and isfinite(scheduled_end) and scheduled_end>scheduled_start and scheduled_end<=scheduled_start+interval '24 hours' and length(trim(meeting_method))>0)),
 add constraint diagnosis_schedule_no_overlap exclude using gist (tstzrange(scheduled_start,scheduled_end,'[)') with &&) where (deleted_at is null and scheduled_start is not null);
grant update(workflow_status,consultation_note,scheduled_start,scheduled_end,meeting_method) on public.diagnosis_submissions to authenticated;
create function crm_private.bump_diagnosis_version() returns trigger language plpgsql set search_path='' as $$
begin new.management_version:=old.management_version+1; return new; end $$;
revoke all on function crm_private.bump_diagnosis_version() from public;
create trigger diagnosis_management_version before update on public.diagnosis_submissions for each row execute function crm_private.bump_diagnosis_version();
