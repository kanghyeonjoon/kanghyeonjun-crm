import Link from 'next/link';
import {requireMember} from '@/lib/access';
import {solapiHeaders} from '@/lib/solapi';
import {configured} from '@/lib/diagnosis-notifications';
export const dynamic='force-dynamic';
export default async function SolapiStatus(){
 const {role}=await requireMember();
 if(role!=='owner')return <main><h1>관리자만 확인할 수 있습니다.</h1></main>;
 let connected=false;let status="요청 전";
 try{const r=await fetch('https://api.solapi.com/cash/v1/balance',{headers:solapiHeaders(),cache:'no-store',signal:AbortSignal.timeout(8000)});status=String(r.status);const d=await r.json().catch(()=>({}));if(r.ok){connected=typeof d.accountId==='string';}else status+=typeof d.errorCode==='string'?' / '+d.errorCode:'';}catch{status='요청 실패';}
 return <main style={{maxWidth:720,margin:'40px auto',padding:24}}><Link href="/workspace/diagnoses">← 무료진단 신청</Link><h1>솔라피 연결 상태</h1><p>API 인증: {connected?'연결 확인':'연결 확인 필요'}</p><p>API 응답: {status}</p><p>문자 설정: {configured('admin_sms')?'활성':'비활성'}</p><p>알림톡 설정: {configured('applicant_alimtalk')?'활성':'채널·승인 템플릿 준비 필요'}</p><p>발신번호: {process.env.SOLAPI_SENDER}</p><p>관리자 수신번호: {process.env.DIAGNOSIS_ADMIN_PHONE}</p><p>이 화면은 연결만 조회하며 메시지를 발송하지 않습니다.</p></main>;
}
