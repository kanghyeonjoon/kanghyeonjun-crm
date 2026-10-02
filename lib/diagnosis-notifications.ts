import {createHmac,randomBytes} from 'node:crypto';
import {diagnosisStore} from './diagnosis-store';
import {receiptSubject,receiptText} from './diagnosis';
export type DeliveryKind='applicant_email'|'admin_email'|'applicant_alimtalk';
export function configured(kind:DeliveryKind){
 if(process.env.DIAGNOSIS_NOTIFICATIONS_ENABLED!=='true')return false;
 return kind==='applicant_alimtalk'
  ? process.env.DIAGNOSIS_ALIMTALK_ENABLED==='true'&&['SOLAPI_API_KEY','SOLAPI_API_SECRET','SOLAPI_PFID','SOLAPI_TEMPLATE_ID','SOLAPI_SENDER'].every(k=>!!process.env[k])
  : ['RESEND_API_KEY','MAIL_FROM','DIAGNOSIS_ADMIN_EMAIL'].every(k=>!!process.env[k]);
}
// A claimed send is never retried automatically: a timeout may mean the provider accepted it.
export async function deliverDiagnosis(id:string){
 const db=diagnosisStore();
 const {data:lead,error}=await db.from('diagnosis_submissions').select('*').eq('id',id).single();
 if(error||!lead)throw Error('lead_unavailable');
 for(const kind of ['applicant_email','admin_email','applicant_alimtalk'] as DeliveryKind[]){
  if(!configured(kind))continue;
  const {data:job,error:claimError}=await db.from('diagnosis_notifications').update({status:'sending',updated_at:new Date().toISOString()}).eq('submission_id',id).eq('kind',kind).eq('status','pending').select('id').maybeSingle();
  if(claimError||!job)continue;
  let providerId:string|null=null;
  try{
   let response:Response;
   if(kind==='applicant_alimtalk'){
    const date=new Date().toISOString(),salt=randomBytes(16).toString('hex');
    const signature=createHmac('sha256',process.env.SOLAPI_API_SECRET!).update(date+salt).digest('hex');
    response=await fetch('https://api.solapi.com/messages/v4/send',{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:`HMAC-SHA256 apiKey=${process.env.SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,'Content-Type':'application/json'},body:JSON.stringify({message:{to:lead.phone,from:process.env.SOLAPI_SENDER,kakaoOptions:{pfId:process.env.SOLAPI_PFID,templateId:process.env.SOLAPI_TEMPLATE_ID,disableSms:true,variables:{'#{이름}':lead.name}}}})});
   }else{
    const isApplicant=kind==='applicant_email';
    response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`diagnosis/${id}/${kind}`},body:JSON.stringify({from:process.env.MAIL_FROM,to:[isApplicant?lead.email:process.env.DIAGNOSIS_ADMIN_EMAIL],subject:isApplicant?receiptSubject:'[몽PD] 새로운 무료진단 신청',text:isApplicant?receiptText(lead.name):`새 무료진단 신청이 접수되었습니다.\n신청자: ${lead.name}\n접수번호: ${id}\n\n신청 내용은 https://crm.mongpd.com/workspace/diagnoses 에서 확인해 주세요.`,reply_to:process.env.DIAGNOSIS_ADMIN_EMAIL})});
   }
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(`provider_http_${response.status}`);
   if(kind==='applicant_alimtalk'&&result.statusCode&&!String(result.statusCode).startsWith('2'))throw Error('provider_rejected');
   providerId=result.id||result.messageId||null;
   const {error:saveError}=await db.from('diagnosis_notifications').update({status:'accepted',provider_id:providerId,updated_at:new Date().toISOString()}).eq('id',job.id);
   if(saveError)throw Error('delivery_status_write_failed');
  }catch{
   await db.from('diagnosis_notifications').update({status:'uncertain',updated_at:new Date().toISOString()}).eq('id',job.id);
   console.error('[diagnosis] notification outcome requires review',{kind});
  }
 }
}
