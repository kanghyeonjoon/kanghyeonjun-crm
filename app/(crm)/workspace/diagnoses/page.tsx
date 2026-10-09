import { requireMember } from '@/lib/access';
import { DiagnosesUI } from '@/components/diagnoses-ui';
import {weekStart,shiftDay,parseKst} from '@/lib/diagnosis-management';
export const dynamic = 'force-dynamic';
export default async function Diagnoses({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { client, user, role } = await requireMember();
  const p = await searchParams;
  const q = (p.q || '').trim().slice(0, 150).replace(/[,%_()\\]/g, '');
  const source = ['스레드', '유튜브', '소개', '기타'].includes(p.source || '') ? p.source! : '';
  const deleted = p.deleted === 'true' ? 'true' : '';
  const size = [20, 50, 100].includes(Number(p.size)) ? Number(p.size) : 20;
  const view=p.view==='schedule'?'schedule':'list';
  const week=weekStart(p.week);
  function filtered(head = false) {
    let req = client.from('diagnosis_submissions').select('workflow_status,consultation_note,scheduled_start,scheduled_end,meeting_method,management_version,deleted_at,id,created_at,name,email,phone,source,reason,gender,age,channel_url,consent_version,diagnosis_notifications(kind,status)', { count: 'exact', head });
    req = deleted ? req.not('deleted_at', 'is', null) : req.is('deleted_at', null);
    if (q) req = req.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    if (source) req = req.eq('source', source);
    return req;
  }
  if(view==='schedule'){
    const result=await client.from('diagnosis_submissions').select('workflow_status,consultation_note,scheduled_start,scheduled_end,meeting_method,management_version,deleted_at,id,created_at,name,email,phone,source,reason,gender,age,channel_url,consent_version,diagnosis_notifications(kind,status)',{count:'exact'}).is('deleted_at',null).lt('scheduled_start',parseKst(shiftDay(week,7)+'T00:00')!).gt('scheduled_end',parseKst(week+'T00:00')!).order('scheduled_start').limit(1000);
    return <DiagnosesUI key={`schedule:${week}`} email={user.email||''} role={role} rows={result.data??[]} total={result.count??0} page={1} size={1000} query={{q:'',source:'',deleted:''}} failed={Boolean(result.error)||(result.count??0)>1000} view={view} week={week}/>;
  }
  const matched = await filtered(true);
  const total = matched.count ?? 0;
  const requested = Number(p.page);
  const page = Math.max(1, Math.min(Math.ceil(total / size) || 1, Number.isFinite(requested) ? Math.floor(requested) : 1));
  const result = await filtered().order('created_at', { ascending: false }).order('id').range((page - 1) * size, page * size - 1);
  return <DiagnosesUI key={`${q}:${source}:${page}:${size}:${deleted}`} email={user.email || ''} role={role} rows={result.data ?? []} total={total} page={page} size={size} query={{ q, source, deleted }} failed={Boolean(matched.error || result.error)} view={view} week={week} />;
}
