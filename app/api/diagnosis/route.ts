import {NextRequest,NextResponse,after} from 'next/server';
import {createHash} from 'node:crypto';
import {diagnosisSchema,consentVersion} from '@/lib/diagnosis';
import {diagnosisStore} from '@/lib/diagnosis-store';
import {deliverDiagnosis} from '@/lib/diagnosis-notifications';
export const maxDuration=60;
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 if(!origin||origin!==req.nextUrl.origin)return NextResponse.json({error:'잘못된 요청입니다.'},{status:403});
 if(!req.headers.get('content-type')?.startsWith('application/json'))return NextResponse.json({error:'잘못된 요청 형식입니다.'},{status:415});
 if(Number(req.headers.get('content-length')||0)>20000)return NextResponse.json({error:'입력 내용이 너무 깁니다.'},{status:413});
 let raw:string;try{raw=await req.text()}catch{return NextResponse.json({error:'잘못된 요청입니다.'},{status:400});}
 if(Buffer.byteLength(raw)>20000)return NextResponse.json({error:'입력 내용이 너무 깁니다.'},{status:413});
 let parsed;try{parsed=diagnosisSchema.safeParse(JSON.parse(raw));}catch{return NextResponse.json({error:'입력을 확인해 주세요.'},{status:400});}
 if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message||'입력을 확인해 주세요.'},{status:400});
 const {requestId,website,...lead}=parsed.data;void website;
 const ip=req.headers.get('x-vercel-forwarded-for')||req.headers.get('x-forwarded-for')||'local';
 const ipHash=createHash('sha256').update(ip+process.env.SUPABASE_SECRET_KEY+process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex');
 try{
  const db=diagnosisStore();
  const {data,error}=await db.rpc('submit_diagnosis',{p_id:requestId,p_data:{...lead,consent_version:consentVersion},p_ip_hash:ipHash});
  if(error){if(error.message.includes('rate_limited'))return NextResponse.json({error:'신청이 이미 접수되었거나 요청이 많습니다. 잠시 후 다시 시도해 주세요.'},{status:429});if(error.message.includes('idempotency_conflict'))return NextResponse.json({error:'이미 접수된 신청입니다. 새 신청은 페이지를 새로 열어 작성해 주세요.'},{status:409});throw Error('storage_failed');}
  if(data.created)after(()=>deliverDiagnosis(requestId).catch(()=>console.error('[diagnosis] notification processing deferred')));
  return NextResponse.json({ok:true,id:requestId},{status:data.created?201:200});
 }catch{return NextResponse.json({error:'현재 접수를 완료할 수 없습니다. 잠시 후 다시 시도하거나 카카오톡으로 문의해 주세요.'},{status:503});}
}
