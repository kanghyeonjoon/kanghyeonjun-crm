'use server';
import { requireMember } from '@/lib/access';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {managementSchema,parseKst} from '@/lib/diagnosis-management';
export async function setDiagnosisDeleted(id: string, deleted: boolean) {
  if (!z.uuid().safeParse(id).success || typeof deleted !== 'boolean') return {ok:false, message:'잘못된 요청입니다.'};
  const {client, role} = await requireMember();
  if (!['owner','operator'].includes(role)) return {ok:false, message:'삭제·복원 권한이 없습니다.'};
  let req = client.from('diagnosis_submissions').update({deleted_at:deleted ? new Date().toISOString() : null}).eq('id',id);
  req = deleted ? req.is('deleted_at',null) : req.not('deleted_at','is',null);
  const {data,error} = await req.select('id');
  if (error) return {ok:false, message:error.code==='23P01' ? '기존 예약과 시간이 겹쳐 복원할 수 없습니다. 해당 일정을 먼저 조정해 주세요.' : '처리하지 못했습니다. 새로고침 후 다시 시도해 주세요.'};
  if (!data?.length) return {ok:false, message:'이미 처리되었거나 접근할 수 없는 신청입니다. 새로고침해 주세요.'};
  revalidatePath('/workspace/diagnoses');
  return {ok:true, message:deleted ? '삭제된 신청으로 이동했습니다.' : '신청을 복원했습니다.'};
}

export async function saveDiagnosisManagement(input:unknown){
 const parsed=managementSchema.safeParse(input);
 if(!parsed.success)return {ok:false,message:'입력 내용을 확인해 주세요. 메모는 5,000자까지 입력할 수 있습니다.'};
 const d=parsed.data;
 const scheduled_start=d.start ? parseKst(d.start) : null;
 const scheduled_end=d.end ? parseKst(d.end) : null;
 if((d.start||d.end) && (!scheduled_start||!scheduled_end||!d.method||scheduled_end<=scheduled_start||new Date(scheduled_end).getTime()-new Date(scheduled_start).getTime()>86400000))return {ok:false,message:'한국시간 기준 시작·종료 시간과 진행 방법을 입력해 주세요. 종료는 시작 이후 24시간 이내여야 합니다.'};
 const {client,role}=await requireMember();
 if(!['owner','operator'].includes(role))return {ok:false,message:'수정 권한이 없습니다.'};
 const {data,error}=await client.from('diagnosis_submissions').update({workflow_status:d.status,consultation_note:d.note,scheduled_start,scheduled_end,meeting_method:scheduled_start?d.method:''}).eq('id',d.id).eq('management_version',d.version).is('deleted_at',null).select('id');
 if(error)return {ok:false,message:error.code==='23P01'?'다른 진단 일정과 시간이 겹칩니다. 시간을 조정해 주세요.':'저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'};
 if(!data?.length)return {ok:false,message:'다른 곳에서 수정되었거나 삭제된 신청입니다. 닫고 새로고침한 뒤 다시 확인해 주세요.'};
 revalidatePath('/workspace/diagnoses');
 return {ok:true,message:'상태·메모·일정을 저장했습니다.'};
}
