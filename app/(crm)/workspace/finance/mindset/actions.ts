'use server';
import {requireMember} from '@/lib/access';
import {z} from 'zod';
import {readFinance} from '../granter/actions';
const fields='beliefs,letter,version,updated_at,goal_amount,goal_date,card_amount,card_month,card_paid';
type Doc={beliefs:string[],letter:string,version:number,updated_at:string,goal_amount:number,goal_date:string,card_amount:number,card_month:string,card_paid:boolean};
const schema=z.object({beliefs:z.array(z.string().trim().min(1).max(1000)).min(1).max(50),letter:z.string().trim().min(1).max(20000),version:z.number().int().positive(),goal_amount:z.number().int().min(1).max(1e12),goal_date:z.iso.date(),card_amount:z.number().int().min(0).max(1e12),card_month:z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/),card_paid:z.boolean()});
export async function readMindset(){
 const {client,user,role}=await requireMember();
 if(role!=='owner')return {ok:false as const,message:'소유자만 볼 수 있습니다.'};
 const {data,error}=await client.from('finance_mindset').select(fields).eq('owner_id',user.id).maybeSingle();
 if(error||!data)return {ok:false as const,message:'내용을 불러오지 못했습니다. 다시 시도해 주세요.'};
 return {ok:true as const,data:data as Doc};
}
export async function saveMindset(input:unknown){
 const {client,user,role}=await requireMember();
 if(role!=='owner')return {ok:false as const,message:'소유자만 수정할 수 있습니다.'};
 const parsed=schema.safeParse(input);if(!parsed.success)return {ok:false as const,message:'목표 금액·날짜와 카드대금을 확인해 주세요. 문장은 1~50개, 각 1,000자 이내로 작성해 주세요. 편지는 20,000자 이내이며 빈 내용은 저장할 수 없습니다.'};
 const {version,...values}=parsed.data;
 const {data,error}=await client.from('finance_mindset').update(values).eq('owner_id',user.id).eq('version',version).select(fields).maybeSingle();
 if(error||!data)return {ok:false as const,message:'저장하지 못했습니다. 다른 화면에서 수정되었을 수 있습니다. 작성 내용을 복사해 보관한 뒤 새로고침해 주세요.'};
 return {ok:true as const,data:data as Doc};
}

export async function readGoalBalance(){
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});
 const r=await readFinance({view:'daily',month:today.slice(0,7),connection:'primary'});
 const report=r.data as {effectiveEndDate?:string,total?:{currentBalance?:number}}|undefined;
 const balance=report?.total?.currentBalance;
 if(!r.ok||report?.effectiveEndDate!==today||typeof balance!=='number'||!Number.isFinite(balance))return {balance:null,today,message:'오늘 기준 잔액을 확인하지 못했습니다. 다시 조회해 주세요.'};
 return {balance,today,message:''};
}
