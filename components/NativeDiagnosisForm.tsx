'use client';
import {useRef,useState} from 'react';
import {consentVersion} from '@/lib/diagnosis';
export default function NativeDiagnosisForm(){
 const [step,setStep]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const requestId=useRef('');
 const form=useRef<HTMLFormElement>(null);
 const groups=['연락받을 정보','채널과 신청 이유','개인정보 확인'];
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');
  if(!form.current?.reportValidity())return;
  if(step<2){setStep(step+1);return;}
  setBusy(true);
  if(!requestId.current)requestId.current=crypto.randomUUID();
  const values=Object.fromEntries(new FormData(form.current));
  try{
   const r=await fetch('/api/diagnosis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,requestId:requestId.current,consent:values.consent==='on'})});
   if(!r.ok){const data=await r.json();throw Error(data.error||'접수 중 문제가 발생했습니다.');}
   try{sessionStorage.setItem('mongpd-native-received','yes');sessionStorage.removeItem('meta_lead_fired_at');}catch{}
   window.location.assign('/thanks?src=native');
  }catch(e){setError(e instanceof Error?e.message:'잠시 후 다시 시도해 주세요.');setBusy(false);}
 }
 function field(label:string,name:string,type='text',placeholder='',required=true){return <label className="block space-y-2 font-bold">{label}{required?' *':''}<input name={name} type={type} placeholder={placeholder} required={required} maxLength={name==='channelUrl'?1000:254} className="w-full rounded-xl border border-slate-300 bg-white p-3 font-normal" /></label>}
 return <form ref={form} onSubmit={submit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="무료진단 신청서">
  <p className="text-sm text-slate-500">{step+1} / 3 · {groups[step]}</p>
  <progress value={step+1} max={3} className="h-2 w-full" aria-label="신청 진행률" />
  <fieldset hidden={step!==0} className="space-y-5">
   <legend className="mb-4 text-xl font-bold">연락받을 정보</legend>
   <label className="block font-bold">몽PD 채널을 어떻게 알게 되셨나요? *<select name="source" required={step===0} className="mt-2 w-full rounded-xl border border-slate-300 p-3" defaultValue=""><option value="" disabled>선택해 주세요</option>{['스레드','유튜브','소개','기타'].map(v=><option key={v}>{v}</option>)}</select></label>
   {field('성함','name','text','홍길동',step===0)}{field('이메일','email','email','example@email.com',step===0)}{field('전화번호','phone','tel','010-0000-0000',step===0)}
  </fieldset>
  <fieldset hidden={step!==1} className="space-y-5">
   <legend className="mb-4 text-xl font-bold">채널과 신청 이유</legend>
   <label className="block font-bold">유튜브 무료 진단 컨설팅을 신청하신 가장 큰 이유는 무엇인가요? *<textarea name="reason" required={step===1} minLength={5} maxLength={4000} rows={5} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
   {field('유튜브 주소 (채널이 없으면 없음으로 입력)','channelUrl','text','https://www.youtube.com/@...',step===1)}
   <div className="grid grid-cols-2 gap-4">{[['성별','gender',['여자','남자']],['연령대','age',['20대','30대','40대','50대','60대 이상']]].map(([title,name,opts])=><label key={String(name)} className="font-bold">{title} *<select name={String(name)} required={step===1} defaultValue="" className="mt-2 w-full rounded-xl border border-slate-300 p-3"><option value="" disabled>선택</option>{(opts as string[]).map(v=><option key={v}>{v}</option>)}</select></label>)}</div>
  </fieldset>
  <fieldset hidden={step!==2} className="space-y-4">
   <legend className="mb-4 text-xl font-bold">개인정보 수집·이용 동의</legend>
   <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm leading-7">
    <p>수집 주체: 비즈니스 아나토미(몽PD)</p><p>목적: 무료진단 신청 검토, 신청자 선정, 상담 일정 및 접수 안내</p>
    <p>항목: 유입 경로, 성함, 이메일, 전화번호, 신청 이유, 성별, 연령대, 유튜브 주소</p>
    <p>보유 기간: 상담 종료 또는 신청일로부터 1년 중 먼저 도래하는 시점까지. 동의 철회 시 지체 없이 파기합니다. 법령상 보존 의무가 있는 경우 해당 기간까지 보관합니다.</p>
    <p>접수·일정 안내를 위해 이메일 및 알림톡을 사용할 수 있습니다. 마케팅 수신 동의는 포함하지 않습니다.</p>
    <p>동의를 거부할 수 있으며, 거부 시 신청 접수가 어렵습니다. 문의·철회: ekrk5614@gmail.com</p>
    <a className="underline" href="/privacy" target="_blank" rel="noopener">개인정보처리방침 보기</a><p>동의문 버전: {consentVersion}</p>
   </div>
   <label className="flex items-center gap-3 font-bold"><input type="checkbox" name="consent" required={step===2} className="h-5 w-5" />개인정보 수집·이용에 동의합니다.</label>
   <p className="text-sm text-slate-500">선착순이 아닌 신청 내용 검토 후 선정합니다. 신청 완료가 일정 확정을 의미하지 않습니다.</p>
  </fieldset>
  <div aria-hidden="true" className="hidden"><input name="website" tabIndex={-1} autoComplete="off" /></div>
  {error&&<p role="alert" className="text-red-700">{error}</p>}
  <div className="flex gap-3">{step>0&&<button type="button" disabled={busy} onClick={()=>{setError('');setStep(step-1)}} className="rounded-xl border px-5 py-3">이전</button>}<button disabled={busy} type="submit" className="flex-1 rounded-xl bg-blue-700 p-3 font-bold text-white disabled:opacity-50">{busy?'접수 중…':step===2?'무료진단 신청하기':'다음'}</button></div>
 </form>
}
