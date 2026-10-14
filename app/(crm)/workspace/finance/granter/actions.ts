'use server';
import {requireMember} from '@/lib/access';
import {connections,readProvider,writeProvider} from '@/lib/granter-api';
import {normalizeProfile,granterMessage,GranterError} from '@/lib/granter';
import {monthBounds} from '@/lib/finance';
import {ticketTypes,assetTypes,views} from '@/lib/granter-catalog';
import {sanitizeProvider,validateOperation} from '@/lib/granter-validation';
import {diagnosisStore} from '@/lib/diagnosis-store';
import {createHmac,createHash,randomUUID,timingSafeEqual} from 'node:crypto';
import {z} from 'zod';
export type Query={view:string,month:string,connection:string,ticketType?:string,assetType?:string,referenceId?:string,referenceType?:string,offset?:number,lastSeenId?:number};
async function access(id:string){const {user,role}=await requireMember();if(role!=='owner'||user.email?.toLowerCase()!=='dkwk302@naver.com')throw new Error('연결 소유자만 접근할 수 있습니다.');const connection=connections().find(c=>c.id===id);if(!connection)throw new Error('연결 회사를 확인해 주세요.');return {user,connection};}
async function profileFor(c:ReturnType<typeof connections>[number]){const p=normalizeProfile(await readProvider(c,'workspace-profile'));if(c.workspaceId!==undefined&&c.workspaceId!==p.workspaceId)throw new GranterError('workspace_mismatch');return p;}
export async function readFinance(q:Query):Promise<{ok:boolean,data?:unknown,message?:string,company?:string,checked?:string,limited?:boolean}>{
 const {user,connection}=await access(q.connection);
 try{
 if(!views.some(v=>v[0]===q.view)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(q.month))throw new Error('invalid');
 const profile=await profileFor(connection);const {start,end}=monthBounds(q.month);const last=new Date(Date.parse(end+'T00:00:00Z')-86400000).toISOString().slice(0,10);const range={startDate:start,endDate:last};let data:unknown;let limited=false;
 const endpoint:Record<string,string>={organizations:'organizations',exchange:'exchange-rates',workflows:'workflows',salary:'salary-histories',attendance:'attendances',leave:'leave-balances','leave-history':'leave-histories',inventory:'inventories',products:'inventory-products',holidays:'holidays',contacts:'contacts',categories:'categories',tags:'tags','tag-details':'tag-details','ticket-tags':'ticket-tags',people:'people',teams:'teams',subscription:'subscription'};
 if(q.view==='overview'||q.view==='forecast'){
 const results=await Promise.allSettled([readProvider(connection,'daily-financial-report',range),readProvider(connection,'tickets',{...range,ticketType:'BANK_TRANSACTION_TICKET'})]);
 data={report:results[0].status==='fulfilled'?results[0].value:null,tickets:results[1].status==='fulfilled'?results[1].value:[],errors:results.filter(r=>r.status==='rejected').map(r=>granterMessage((r as PromiseRejectedResult).reason))};
 }else if(q.view==='companies'){
 const rows=[];for(const c of connections()){try{const p=await profileFor(c);const r=await readProvider(c,'daily-financial-report',range) as Record<string,unknown>;rows.push({company:p.companyName,connection:c.id,total:r.total,effectiveEndDate:r.effectiveEndDate});}catch(e){rows.push({company:c.label,error:granterMessage(e)});}}data=rows;
 }else if(q.view==='profile')data={company:profile,users:await readProvider(connection,'user-profiles')};
 else if(q.view==='tickets'||['audit','budget','counterparties','commerce'].includes(q.view)){
 const type=q.view==='commerce'?(q.ticketType==='ECOMMERCE_SALES_DETAIL_TICKET'?q.ticketType:'ECOMMERCE_SETTLEMENT_DETAIL_TICKET'):q.ticketType||'BANK_TRANSACTION_TICKET';if(!(type in ticketTypes))throw new Error('invalid');data=await readProvider(connection,'tickets',{...range,ticketType:type});
 }else if(q.view==='assets'){if(!q.assetType||!(q.assetType in assetTypes))throw new Error('invalid');data=await readProvider(connection,'assets',{assetType:q.assetType});}
 else if(q.view==='references'){if(!q.referenceId||!Number.isSafeInteger(Number(q.referenceId))||Number(q.referenceId)<1)return {ok:true,data:[],message:'거래 내역의 번호와 종류를 선택해 연결 증빙을 조회하세요.',company:profile.companyName};if(!q.referenceType||!(q.referenceType in ticketTypes)&&q.referenceType!=='WORKFLOW')throw new Error('invalid');data=await readProvider(connection,'ticket-references',{referenceableId:Number(q.referenceId),referenceableType:q.referenceType});}
 else if(q.view==='daily')data=await readProvider(connection,'daily-financial-report',range);
 else if(q.view==='balances'){const r=await readProvider(connection,'balances',range) as {bankAccount:Record<string,unknown>,balances:Record<string,unknown>[]}[];if(!Array.isArray(r))throw new GranterError('invalid_response');data=r.flatMap(a=>a.balances.map(b=>({...b,account:a.bankAccount.nickname||a.bankAccount.name,currency:(a.bankAccount.bankAccount as Record<string,unknown>)?.currencyCode,loan:(a.bankAccount.bankAccount as Record<string,unknown>)?.accountType==='LOAN'})));}
 else if(q.view==='history'){const r=await diagnosisStore().from('granter_operations').select('id,operation,state,result_id,created_at,completed_at').eq('owner_id',user.id).eq('connection',connection.id).order('created_at',{ascending:false}).limit(100);if(r.error)throw new Error('history');data=r.data;limited=true;}
 else if(q.view==='issuance'||q.view==='manual')data=[];
 else{
 const ep=endpoint[q.view];if(!ep)throw new Error('invalid');let body:Record<string,unknown>={};
 if(['salary','attendance','leave-history','holidays'].includes(q.view))body=range;
 if(['leave','exchange'].includes(q.view)){const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});body={baseDate:last>today?today:last};}
 if(q.view==='contacts')limited=true;
 if(q.view==='workflows'){body={limit:100,offset:Math.max(0,Math.min(100000,Math.floor(Number(q.offset)||0)))};limited=true;}
 if(['inventory','products'].includes(q.view)){body={limit:100,...(q.lastSeenId&&Number.isSafeInteger(q.lastSeenId)?{lastSeenId:q.lastSeenId}:{})};limited=true;}
 data=await readProvider(connection,ep,body);
 }
 // Reject mixed root workspace records. Provider auth determines all nested resources.
 const records=Array.isArray(data)?data:[data];if(records.some(r=>r&&typeof r==='object'&&'workspaceId'in r&&(r as {workspaceId:number}).workspaceId!==profile.workspaceId))throw new GranterError('workspace_mismatch');
 return {ok:true,data:sanitizeProvider(data),company:profile.companyName,checked:new Date().toISOString(),limited};
 }catch(e){return {ok:false,message:granterMessage(e)};}
}
function hash(p:unknown){return createHash('sha256').update(JSON.stringify(p)).digest('hex');}
function sign(s:string){const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('서버 저장 설정을 확인해 주세요.');return createHmac('sha256',key).update(s).digest('hex');}
export async function prepareFinance(connectionId:string,operation:string,input:unknown){
 const {user,connection}=await access(connectionId);
 try{const {op,payload}=validateOperation(operation,input);const profile=await profileFor(connection);const claim={id:randomUUID(),user:user.id,connection:connection.id,workspace:profile.workspaceId,operation:op.id,fingerprint:hash(payload),expires:Date.now()+600000};const body=Buffer.from(JSON.stringify(claim)).toString('base64url');return {ok:true,payload,proof:body+'.'+sign(body),company:profile.companyName,message:'아래 내용을 확인한 뒤 실행해 주세요.'};}catch(e){return {ok:false,message:e instanceof GranterError?granterMessage(e):e instanceof Error?e.message:'입력값을 확인해 주세요.'};}
}
export async function executeFinance(connectionId:string,operation:string,input:unknown,proof:string,confirmed:boolean){
 const {user,connection}=await access(connectionId);let requestId='';
 try{
 if(!confirmed||typeof proof!=='string'||proof.length>3000)throw new Error('내용 확인이 필요합니다.');
 const [body,signature]=proof.split('.');if(!signature||!/^[a-f0-9]{64}$/.test(signature)||!timingSafeEqual(Buffer.from(sign(body)),Buffer.from(signature)))throw new Error('검토 정보가 유효하지 않습니다.');
 const c=JSON.parse(Buffer.from(body,'base64url').toString());const {payload,op}=validateOperation(operation,input);
 if(c.user!==user.id||c.connection!==connection.id||c.operation!==op.id||c.fingerprint!==hash(payload)||c.expires<Date.now()||!z.uuid().safeParse(c.id).success)throw new Error('내용이 변경되었거나 검토 시간이 지났습니다. 다시 검토해 주세요.');
 const p=await profileFor(connection);if(p.workspaceId!==c.workspace)throw new Error('연결 회사가 달라 실행을 중단했습니다.');
 const store=diagnosisStore();const reserved=await store.from('granter_operations').insert({id:c.id,owner_id:user.id,connection:connection.id,workspace_id:p.workspaceId,operation:op.id,fingerprint:c.fingerprint});
 if(reserved.error)return {ok:false,message:reserved.error.code==='23505'?'동일한 요청 이력이 있습니다. 중복 실행하지 않았습니다. 작업 이력과 그랜터 원본을 확인하세요.':'작업 이력을 저장하지 못해 실행하지 않았습니다.'};requestId=c.id;
 const result=await writeProvider(connection,op.id,payload,c.id) as Record<string,unknown>;
 const failed=result?.ok===false||result?.success===false||Number(result?.failedCount)>0||(typeof result?.resultCode==='number'&&result.resultCode<0)||['FAILED','ERROR','REJECTED'].includes(String(result?.status));
 const resultId=result?.id??result?.approvalNumber??result?.requestId??'';
 const updated=await store.from('granter_operations').update({state:failed?'uncertain':'accepted',result_id:String(resultId).slice(0,255),completed_at:new Date().toISOString()}).eq('id',c.id).eq('owner_id',user.id);
 return {ok:!failed&&!updated.error,message:failed?'일부 또는 전체 처리를 확인하지 못했습니다. 자동 재실행하지 않습니다. 그랜터에서 결과를 확인하세요.':updated.error?'그랜터가 요청을 수락했으나 이력 갱신에 실패했습니다. 다시 실행하지 말고 그랜터에서 확인하세요.':'그랜터가 요청을 수락했습니다. 조회 화면에서 반영 결과를 확인하세요. 발행은 국세청 처리 완료와 구분됩니다.',requestId};
 }catch(e){if(requestId){await diagnosisStore().from('granter_operations').update({state:e instanceof GranterError&&e.status&&e.status>=400&&e.status<500?'rejected':'uncertain',completed_at:new Date().toISOString()}).eq('id',requestId).eq('owner_id',user.id);return {ok:false,message:'처리를 완료했다고 확인할 수 없습니다. 자동 재시도하지 않습니다. 작업 이력과 그랜터를 확인하세요.',requestId};}return {ok:false,message:e instanceof GranterError?granterMessage(e):e instanceof Error?e.message:'실행하지 못했습니다.'};}
}

export async function readTicketDetail(connectionId:string,ticketId:number,ticketType:string){
 const {connection}=await access(connectionId);
 try{
 if(!Number.isSafeInteger(ticketId)||ticketId<1||!Object.hasOwn(ticketTypes,ticketType))throw new GranterError('invalid_response');
 const profile=await profileFor(connection);
 const data=await readProvider(connection,'tickets/detail',{ticketId,ticketType}) as Record<string,unknown>;
 if(!data||data.id!==ticketId||data.ticketType!==ticketType||data.workspaceId!==profile.workspaceId)throw new GranterError('workspace_mismatch');
 return {ok:true,data:sanitizeProvider(data)};
 }catch(e){return {ok:false,message:granterMessage(e)};}
}
