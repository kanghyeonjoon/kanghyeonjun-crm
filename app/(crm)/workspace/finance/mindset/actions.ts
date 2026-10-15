'use server';
import {requireMember} from '@/lib/access';
import {z} from 'zod';
const schema=z.object({beliefs:z.array(z.string().trim().min(1).max(1000)).min(1).max(50),letter:z.string().trim().min(1).max(20000),version:z.number().int().positive()});
export async function readMindset(){
 const {client,user,role}=await requireMember();
 if(role!=='owner')return {ok:false as const,message:'소유자만 볼 수 있습니다.'};
 const {data,error}=await client.from('finance_mindset').select('beliefs,letter,version,updated_at').eq('owner_id',user.id).maybeSingle();
 if(error||!data)return {ok:false as const,message:'내용을 불러오지 못했습니다. 다시 시도해 주세요.'};
 return {ok:true as const,data:data as {beliefs:string[],letter:string,version:number,updated_at:string}};
}
export async function saveMindset(input:unknown){
 const {client,user,role}=await requireMember();
 if(role!=='owner')return {ok:false as const,message:'소유자만 수정할 수 있습니다.'};
 const parsed=schema.safeParse(input);if(!parsed.success)return {ok:false as const,message:'문장은 1~50개, 각 1,000자 이내로 작성해 주세요. 편지는 20,000자 이내이며 빈 내용은 저장할 수 없습니다.'};
 const {beliefs,letter,version}=parsed.data;
 const {data,error}=await client.from('finance_mindset').update({beliefs,letter}).eq('owner_id',user.id).eq('version',version).select('beliefs,letter,version,updated_at').maybeSingle();
 if(error||!data)return {ok:false as const,message:'저장하지 못했습니다. 다른 화면에서 수정되었을 수 있습니다. 작성 내용을 복사해 보관한 뒤 새로고침해 주세요.'};
 return {ok:true as const,data:data as {beliefs:string[],letter:string,version:number,updated_at:string}};
}
