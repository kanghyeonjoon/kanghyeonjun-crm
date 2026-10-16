import {z} from 'zod';
export const financeCategories=['관리비','제작비','광고비','외주비','인건비','임차료','구독료','세금·수수료','기타'] as const;
export const financeSchema=z.object({
 id:z.uuid(),
 occurred_on:z.string().regex(/^20\d{2}-\d{2}-\d{2}$|^2100-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v;},'올바른 날짜를 입력해 주세요.'),
 direction:z.enum(['income','expense']),
 amount:z.string().regex(/^[1-9]\d{0,12}$/).transform(Number).refine(v=>v<=1_000_000_000_000),
 category:z.enum(financeCategories),counterparty:z.string().trim().max(150),account_label:z.string().trim().max(100),note:z.string().trim().max(2000),
});
export type FinanceEntry={id:string;occurred_on:string;direction:'income'|'expense';amount:number;category:string;counterparty:string;account_label:string;note:string;archived:boolean;version:number};
export function currentMonth(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit'}).format(new Date());}
export function monthBounds(value?:string){const month=/^(20\d{2}|2100)-(0[1-9]|1[0-2])$/.test(value||'')?value!:currentMonth();const [y,m]=month.split('-').map(Number);return {month,start:month+'-01',end:`${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,'0')}-01`};}
export function money(value:string|number|bigint){return BigInt(value).toLocaleString('ko-KR')+'원';}
