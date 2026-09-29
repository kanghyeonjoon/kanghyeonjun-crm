begin;
alter function public.crm_enroll() set schema crm_private;
create function public.crm_enroll() returns boolean language sql security invoker set search_path='' as $$ select crm_private.crm_enroll() $$;
revoke all on function public.crm_enroll() from public, anon;
grant execute on function public.crm_enroll() to authenticated;
revoke all on function crm_private.crm_enroll() from public, anon;
grant execute on function crm_private.crm_enroll() to authenticated;
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
 end if;
end $$;
notify pgrst,'reload schema';
commit;
