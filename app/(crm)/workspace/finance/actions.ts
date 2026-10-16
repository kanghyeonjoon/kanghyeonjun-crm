'use server';
import {requireMember} from '@/lib/access';
import {financeSchema} from '@/lib/finance';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
export async function saveFinance(form:FormData){
 const {client,role}=await requireMember();
 if(role!=='owner')return {ok:false,message:'소유자만 재무 장부를 관리할 수 있습니다.'};
 const parsed=financeSchema.safeParse(Object.fromEntries(form));
 const version=Number(form.get('version'));
 if(!parsed.success||!Number.isSafeInteger(version)||version<0)return {ok:false,message:'날짜·금액과 필수 입력값을 확인해 주세요. 금액은 1원 이상 정수로 입력합니다.'};
 const {id,...values}=parsed.data;
 const result=version===0?await client.from('finance_entries').insert({id,...values}).select('id').single():await client.from('finance_entries').update(values).eq('id',id).eq('version',version).select('id').maybeSingle();
 if(result.error||!result.data)return {ok:false,message:result.error?.code==='23505'?'이미 등록된 요청입니다. 목록을 새로고침해 확인해 주세요.':'저장하지 못했습니다. 다른 화면에서 변경되었을 수 있으니 새로고침 후 다시 확인해 주세요.'};
 revalidatePath('/workspace/finance');return {ok:true,message:'거래를 저장했습니다.'};
}
export async function archiveFinance(id:string,version:number,archived:boolean){
 const {client,role}=await requireMember();
 if(role!=='owner'||!z.uuid().safeParse(id).success||!Number.isSafeInteger(version)||version<1||typeof archived!=='boolean')return {ok:false,message:'요청 권한 또는 입력값을 확인해 주세요.'};
 const {data,error}=await client.from('finance_entries').update({archived}).eq('id',id).eq('version',version).select('id').maybeSingle();
 if(error||!data)return {ok:false,message:'변경하지 못했습니다. 새로고침 후 다시 확인해 주세요.'};
 revalidatePath('/workspace/finance');return {ok:true,message:archived?'거래를 보관했습니다. 월 합계에서 제외됩니다.':'거래를 복원했습니다.'};
}
