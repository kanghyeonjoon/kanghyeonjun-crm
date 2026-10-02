import Link from 'next/link';
import {requireMember} from '@/lib/access';
export const dynamic='force-dynamic';
const states:Record<string,string>={pending:'발송 대기',sending:'발송 처리 중',accepted:'업체 접수',uncertain:'결과 확인 필요'};
export default async function Diagnoses(){
 const {client}=await requireMember();
 const {data,error}=await client.from('diagnosis_submissions').select('*,diagnosis_notifications(kind,status)').order('created_at',{ascending:false}).limit(100);
 return <main style={{maxWidth:1100,margin:'0 auto',padding:24}}><Link href="/workspace">← CRM</Link><h1>무료진단 신청</h1><p>최근 100건 · 신청 접수와 상담 확정은 구분합니다.</p>{error?<p role="alert">신청 목록을 가져오지 못했습니다.</p>:!data?.length?<p>접수된 신청이 없습니다.</p>:data.map(r=><details key={r.id} style={{background:'white',padding:18,marginBottom:12,border:'1px solid #ddd',borderRadius:10}}><summary>{r.name} · {r.email} · {new Date(r.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</summary><dl>{Object.entries({전화번호:r.phone,유입:r.source,신청이유:r.reason,성별:r.gender,연령대:r.age,유튜브:r.channel_url,동의문:r.consent_version}).map(([k,v])=><div key={k} style={{padding:'8px 0'}}><dt><b>{k}</b></dt><dd style={{whiteSpace:'pre-wrap'}}>{String(v)}</dd></div>)}</dl><p>{r.diagnosis_notifications.map((n:{kind:string,status:string})=>`${({applicant_email:'신청자 이메일',admin_email:'관리자 이메일',applicant_alimtalk:'신청자 알림톡'} as Record<string,string>)[n.kind]}: ${states[n.status]||n.status}`).join(' / ')}</p></details>)}</main>
}
