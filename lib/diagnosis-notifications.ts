import {sendSolapi} from './solapi';
import {diagnosisStore} from './diagnosis-store';
import {receiptSubject,receiptText} from './diagnosis';
export type DeliveryKind='applicant_email'|'admin_email'|'applicant_alimtalk'|'applicant_sms'|'admin_sms';
export function configured(kind:DeliveryKind):boolean{
 if(process.env.VERCEL_ENV && process.env.VERCEL_ENV!=='production')return false;
 if(process.env.DIAGNOSIS_NOTIFICATIONS_ENABLED!=='true')return false;
 const keys=['SOLAPI_API_KEY','SOLAPI_API_SECRET','SOLAPI_SENDER'].every(k=>!!process.env[k]?.trim());
 if(kind==='applicant_alimtalk')return keys&&process.env.DIAGNOSIS_ALIMTALK_ENABLED==='true'&&!!process.env.SOLAPI_PFID&&!!process.env.SOLAPI_TEMPLATE_ID;
 if(kind==='applicant_sms')return keys&&process.env.DIAGNOSIS_SMS_ENABLED==='true'&&!configured('applicant_alimtalk');
 if(kind==='admin_sms')return keys&&process.env.DIAGNOSIS_SMS_ENABLED==='true'&&/^01[016789]\d{7,8}$/.test(process.env.DIAGNOSIS_ADMIN_PHONE||'');
 return ['RESEND_API_KEY','MAIL_FROM','DIAGNOSIS_ADMIN_EMAIL'].every(k=>!!process.env[k]);
}
// A claimed send is never retried automatically: a timeout may mean the provider accepted it.
export async function deliverDiagnosis(id:string){
 const db=diagnosisStore();
 const {data:lead,error}=await db.from('diagnosis_submissions').select('*').eq('id',id).single();
 if(error||!lead)throw Error('lead_unavailable');
 if(lead.deleted_at)return;
 for(const kind of ['applicant_email','admin_email','applicant_alimtalk','applicant_sms','admin_sms'] as DeliveryKind[]){
  if(!configured(kind))continue;
  const {data:job,error:claimError}=await db.from('diagnosis_notifications').update({status:'sending',updated_at:new Date().toISOString()}).eq('submission_id',id).eq('kind',kind).eq('status','pending').select('id').maybeSingle();
  if(claimError||!job)continue;
  let providerId:string|null=null;
  try{
   if(kind==='applicant_alimtalk'||kind==='applicant_sms'||kind==='admin_sms'){
    const message:Record<string,unknown>={to:kind==='admin_sms'?process.env.DIAGNOSIS_ADMIN_PHONE:lead.phone,from:process.env.SOLAPI_SENDER};
    if(kind==='applicant_alimtalk')message.kakaoOptions={pfId:process.env.SOLAPI_PFID,templateId:process.env.SOLAPI_TEMPLATE_ID,disableSms:false,variables:{'#{이름}':lead.name}};
    else {message.type='LMS';message.subject='몽PD 무료진단';message.text=kind==='applicant_sms'?receiptText(lead.name):`[몽PD] 새로운 무료진단 신청이 접수되었습니다.\n신청자: ${lead.name}\n접수번호: ${id}\n확인: https://crm.mongpd.com/workspace/diagnoses`;}
    providerId=await sendSolapi(message);
   }else{
    const isApplicant=kind==='applicant_email';
    const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(12000),headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`diagnosis/${id}/${kind}`},body:JSON.stringify({from:process.env.MAIL_FROM,to:[isApplicant?lead.email:process.env.DIAGNOSIS_ADMIN_EMAIL],subject:isApplicant?receiptSubject:'[몽PD] 새로운 무료진단 신청',text:isApplicant?receiptText(lead.name):`새 무료진단 신청이 접수되었습니다.\n신청자: ${lead.name}\n접수번호: ${id}\n\n신청 내용은 https://crm.mongpd.com/workspace/diagnoses 에서 확인해 주세요.`,reply_to:process.env.DIAGNOSIS_ADMIN_EMAIL})});
    const result=await response.json().catch(()=>({}));
    if(!response.ok||!result.id)throw Error('provider_rejected');
    providerId=result.id;
   }
   const {error:saveError}=await db.from('diagnosis_notifications').update({status:'accepted',provider_id:providerId,updated_at:new Date().toISOString()}).eq('id',job.id);
   if(saveError)throw Error('delivery_status_write_failed');
  }catch{
   await db.from('diagnosis_notifications').update({status:'uncertain',updated_at:new Date().toISOString()}).eq('id',job.id);
   console.error('[diagnosis] notification outcome requires review',{kind});
  }
 }
}
