import {NextResponse} from 'next/server';
import {requireMember} from '@/lib/access';
import {solapiHeaders} from '@/lib/solapi';
import {configured} from '@/lib/diagnosis-notifications';
export const dynamic='force-dynamic';
export async function GET(){
 const {role}=await requireMember();
 if(role!=='owner')return NextResponse.json({error:'관리자만 확인할 수 있습니다.'},{status:403});
 try{
  const r=await fetch('https://api.solapi.com/cash/v1/balance',{headers:solapiHeaders(),cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!r.ok)return NextResponse.json({connected:false,providerStatus:r.status},{status:502});
  const data=await r.json();
  if(typeof data.balance!=='number')throw Error('invalid_response');
  return NextResponse.json({connected:true,smsEnabled:configured('admin_sms'),alimtalkEnabled:configured('applicant_alimtalk'),sender:process.env.SOLAPI_SENDER,adminPhone:process.env.DIAGNOSIS_ADMIN_PHONE},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({connected:false,error:'솔라피 인증 또는 연결을 확인해 주세요.'},{status:503});}
}
