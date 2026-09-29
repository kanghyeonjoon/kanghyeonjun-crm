import { requireMember } from '@/lib/access';
import { WorkspaceUI } from '@/components/workspace-ui';
import { management, proposalStates, stages, type Entity } from '@/lib/validation';
export const dynamic = 'force-dynamic';
export default async function Workspace({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) {
 const {client,user,role}=await requireMember(); const p=await searchParams;
 const tab:Entity=p.tab==='proposals'?'proposals':p.tab==='opportunities'?'opportunities':'hospitals';
 const statuses=tab==='hospitals'?management:tab==='proposals'?proposalStates:stages;
 const q=(p.q??'').trim().slice(0,150); const state=p.state && Object.hasOwn(statuses,p.state)?p.state:'';
 const validDate=(v:string|undefined)=>v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v))?v:'';
 const from=validDate(p.from),to=validDate(p.to); const size=Math.max(0,Math.min(100,Math.floor(Number(p.size))||0));
 const statusField=tab==='hospitals'?'management_state':tab==='proposals'?'status':'stage';
 function filtered(head=false){
  let req=client.from(tab).select('*',{count:'exact',head});
  if(q) req=req.ilike(tab==='hospitals'?'name':tab==='proposals'?'title':'next_action',`%${q.replace(/[\\%_]/g,'')}%`);
  if(state) req=req.eq(statusField,state);
  if(from) req=req.gte('updated_at',`${from}T00:00:00+09:00`);
  if(to) req=req.lte('updated_at',`${to}T23:59:59.999999+09:00`);
  return req;
 }
 const [counts,matched,hospitalList]=await Promise.all([
  Promise.all((['hospitals','proposals','opportunities'] as Entity[]).map(t=>client.from(t).select('id',{count:'exact',head:true}))),
  filtered(true),client.from('hospitals').select('id,name').order('name').order('id').limit(1000)
 ]);
 const count=matched.count??0;const page=Math.max(1,Math.min(Math.ceil(count/Math.max(size,1))||1,Math.floor(Number(p.page)||1)));
 const data=size?await filtered().order('updated_at',{ascending:false}).order('id').range((page-1)*size,page*size-1):{data:[],error:null};
 return <WorkspaceUI key={`${tab}:${q}:${state}:${from}:${to}`} tab={tab} email={user.email??''} role={role} rows={data.data??[]} hospitals={hospitalList.data??[]} total={count} totals={counts.map(c=>c.count??0)} page={page} size={size} query={{q,state,from,to}} failed={Boolean(matched.error||data.error||hospitalList.error||counts.some(c=>c.error))}/>;
}
