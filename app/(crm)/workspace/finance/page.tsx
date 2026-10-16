import Link from 'next/link';
import {requireMember} from '@/lib/access';
import {monthBounds} from '@/lib/finance';
import {FinanceUI} from '@/components/finance-ui';
export const dynamic='force-dynamic';
export default async function Finance({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const {client,user,role}=await requireMember();
 if(role!=='owner')return <main className="erp-page"><h1>재무 관리</h1><p>소유자 전용 장부입니다.</p><Link href="/workspace">CRM으로 돌아가기</Link></main>;
 const p=await searchParams;const {month,start,end}=monthBounds(p.month);const archived=p.archived==='true';
 const direction=['income','expense'].includes(p.direction||'')?p.direction!:'';
 function query(head=false){let q=client.from('finance_entries').select('id,occurred_on,direction,amount,category,counterparty,account_label,note,archived,version',{count:'exact',head}).gte('occurred_on',start).lt('occurred_on',end).eq('archived',archived);if(direction)q=q.eq('direction',direction);return q;}
 const [count,summary]=await Promise.all([query(true),client.rpc('finance_month_summary',{month_start:start})]);
 const total=count.count??0;const requested=Number(p.page)||1;const page=Math.max(1,Math.min(Math.ceil(total/25)||1,Number.isFinite(requested)?Math.floor(requested):1));
 const rows=await query().order('occurred_on',{ascending:false}).order('id').range((page-1)*25,page*25-1);
 return <FinanceUI key={`${month}:${direction}:${archived}:${page}`} email={user.email||''} rows={rows.data??[]} total={total} page={page} month={month} direction={direction} archived={archived} summary={summary.data} failed={Boolean(count.error||summary.error||rows.error)}/>;
}
