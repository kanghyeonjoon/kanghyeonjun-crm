import { requireMember } from '@/lib/access';
import { DiagnosesUI } from '@/components/diagnoses-ui';
export const dynamic = 'force-dynamic';
export default async function Diagnoses({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { client, user, role } = await requireMember();
  const p = await searchParams;
  const q = (p.q || '').trim().slice(0, 150).replace(/[,%_()\\]/g, '');
  const source = ['스레드', '유튜브', '소개', '기타'].includes(p.source || '') ? p.source! : '';
  const size = [20, 50, 100].includes(Number(p.size)) ? Number(p.size) : 20;
  function filtered(head = false) {
    let req = client.from('diagnosis_submissions').select('id,created_at,name,email,phone,source,reason,gender,age,channel_url,consent_version,diagnosis_notifications(kind,status)', { count: 'exact', head });
    if (q) req = req.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`);
    if (source) req = req.eq('source', source);
    return req;
  }
  const matched = await filtered(true);
  const total = matched.count ?? 0;
  const requested = Number(p.page);
  const page = Math.max(1, Math.min(Math.ceil(total / size) || 1, Number.isFinite(requested) ? Math.floor(requested) : 1));
  const result = await filtered().order('created_at', { ascending: false }).order('id').range((page - 1) * size, page * size - 1);
  return <DiagnosesUI key={`${q}:${source}:${page}:${size}`} email={user.email || ''} role={role} rows={result.data ?? []} total={total} page={page} size={size} query={{ q, source }} failed={Boolean(matched.error || result.error)} />;
}
