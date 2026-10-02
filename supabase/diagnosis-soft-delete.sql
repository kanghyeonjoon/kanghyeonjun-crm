alter table public.diagnosis_submissions add column deleted_at timestamptz;
grant update (deleted_at) on public.diagnosis_submissions to authenticated;
create policy diagnosis_editor_archive on public.diagnosis_submissions
for update to authenticated
using ((select crm_private.can_access(true)))
with check ((select crm_private.can_access(true)));
create index diagnosis_active_created on public.diagnosis_submissions(created_at desc) where deleted_at is null;
