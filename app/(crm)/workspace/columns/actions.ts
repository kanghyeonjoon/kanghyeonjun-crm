'use server';
import {requireMember} from '@/lib/access';
import {columnSchema} from '@/lib/columns';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
export async function saveColumn(form:FormData) {
 const {client,role}=await requireMember();
 if(!['owner','operator'].includes(role))return {ok:false,message:'작성 권한이 없습니다.'};
 const parsed=columnSchema.safeParse(Object.fromEntries(form));
 if(!parsed.success)return {ok:false,message:parsed.error.issues[0].message};
 const id=String(form.get('id')||''); const version=Number(form.get('version'));
 if(id && (!z.uuid().safeParse(id).success || !Number.isInteger(version) || version<1))return {ok:false,message:'수정 대상이 올바르지 않습니다.'};
 const values={...parsed.data,published_at:parsed.data.status==='published'?new Date().toISOString():null};
 if(id && parsed.data.status==='published') {
  const {data,error}=await client.from('columns').select('published_at').eq('id',id).single();
  if(error)return {ok:false,message:'글을 불러오지 못했습니다.'};
  values.published_at=data.published_at||values.published_at;
 }
 const query=id ? client.from('columns').update(values).eq('id',id).eq('version',version) : client.from('columns').insert(values);
 const {data,error}=await query.select('id').maybeSingle();
 if(error)return {ok:false,message:'저장하지 못했습니다. 잠시 후 다시 시도해 주세요.'};
 if(!data)return {ok:false,message:'다른 창에서 수정된 글입니다. 목록을 새로고침한 뒤 다시 열어 주세요.'};
 revalidatePath('/workspace/columns');revalidatePath('/columns');revalidatePath(`/columns/${data.id}`);
 return {ok:true,message:'저장했습니다.'};
}
