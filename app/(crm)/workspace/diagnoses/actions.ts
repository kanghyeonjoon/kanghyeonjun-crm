'use server';
import { requireMember } from '@/lib/access';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
export async function setDiagnosisDeleted(id: string, deleted: boolean) {
  if (!z.uuid().safeParse(id).success || typeof deleted !== 'boolean') return {ok:false, message:'잘못된 요청입니다.'};
  const {client, role} = await requireMember();
  if (!['owner','operator'].includes(role)) return {ok:false, message:'삭제·복원 권한이 없습니다.'};
  let req = client.from('diagnosis_submissions').update({deleted_at:deleted ? new Date().toISOString() : null}).eq('id',id);
  req = deleted ? req.is('deleted_at',null) : req.not('deleted_at','is',null);
  const {data,error} = await req.select('id');
  if (error) return {ok:false, message:'처리하지 못했습니다. 새로고침 후 다시 시도해 주세요.'};
  if (!data?.length) return {ok:false, message:'이미 처리되었거나 접근할 수 없는 신청입니다. 새로고침해 주세요.'};
  revalidatePath('/workspace/diagnoses');
  return {ok:true, message:deleted ? '삭제된 신청으로 이동했습니다.' : '신청을 복원했습니다.'};
}
