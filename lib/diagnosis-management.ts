import {z} from 'zod';
export const workflowLabels = {new:'신규',contacting:'연락 중',completed:'완료',on_hold:'보류'} as const;
export type Management = {workflow_status:keyof typeof workflowLabels;consultation_note:string;scheduled_start:string|null;scheduled_end:string|null;meeting_method:string;management_version:number};
export const managementSchema=z.object({id:z.uuid(),version:z.number().int().min(0),status:z.enum(['new','contacting','completed','on_hold']),note:z.string().trim().max(5000),start:z.string(),end:z.string(),method:z.string().trim().max(200)});
export function kstInput(value:string|null){return value ? new Date(new Date(value).getTime()+9*3600000).toISOString().slice(0,16) : '';}
export function parseKst(value:string){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return null;
 const d=new Date(value+':00+09:00');
 return Number.isFinite(d.getTime()) && kstInput(d.toISOString())===value ? d.toISOString() : null;
}
export function weekStart(value?:string){
 const today=kstInput(new Date().toISOString()).slice(0,10);
 const day=value && parseKst(value+'T00:00') ? value : today;
 const d=new Date(day+'T00:00:00+09:00');
 const weekday=new Date(day+'T00:00:00Z').getUTCDay();
 d.setUTCDate(d.getUTCDate()-((weekday+6)%7));
 return kstInput(d.toISOString()).slice(0,10);
}
export function shiftDay(day:string,amount:number){return new Date(new Date(day+'T12:00:00Z').getTime()+amount*86400000).toISOString().slice(0,10);}
