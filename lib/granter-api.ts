import 'server-only';
import {GranterError} from './granter';
import {operations} from './granter-catalog';
export type Connection={id:string,label:string,key:string,workspaceId?:number};
export function connections():Connection[]{
 const list:Connection[]=[{id:'primary',label:'내 회사',key:process.env.GRANTER_API_KEY||''}];
 // Optional additional companies are explicitly configured by the server operator, never accepted from a browser.
 try{const configs=JSON.parse(process.env.GRANTER_CONNECTIONS||'[]');if(Array.isArray(configs))for(const c of configs){if(/^[a-z0-9-]{1,30}$/.test(c.id)&&c.id!=='primary'&&typeof c.label==='string'&&/^GRANTER_API_KEY_[A-Z0-9_]+$/.test(c.envName)&&Number.isSafeInteger(c.workspaceId))list.push({id:c.id,label:c.label,key:process.env[c.envName]||'',workspaceId:c.workspaceId});}}catch{/* Fail closed to the default single connection. */}
 return list.slice(0,10);
}
const readMethods:Record<string,string>={'workspace-profile':'GET','user-profiles':'GET','assets':'POST','tickets':'POST','tickets/detail':'POST','ticket-references':'GET','organizations':'GET','balances':'POST','daily-financial-report':'POST','exchange-rates':'POST','ticket-tags':'GET','ticket-tag-groups':'GET','tags':'GET','tag-details':'GET','categories':'GET','subscription':'GET','people':'GET','teams':'GET','contacts':'GET','workflows':'GET','salary-histories':'POST','inventory-products':'GET','inventories':'GET','attendances':'POST','leave-balances':'POST','leave-histories':'POST','holidays':'POST'};
async function call(connection:Connection,endpoint:string,method:string,body:Record<string,unknown>,idempotency?:string){
 if(!connection.key.trim())throw new GranterError('missing_key');
 const url=new URL('https://app.granter.biz/api/public-docs/'+endpoint);if(method==='GET')for(const [k,v] of Object.entries(body)){if(v!==undefined)url.searchParams.set(k,String(v));}
 try{const r=await fetch(url,{method,headers:{Authorization:'Basic '+Buffer.from(connection.key.trim()+':').toString('base64'),'Content-Type':'application/json',...(idempotency?{'Idempotency-Key':idempotency}:{})},body:method==='GET'?undefined:JSON.stringify(body),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000)});if(!r.ok)throw new GranterError('provider_error',r.status);if(r.status===204)return {accepted:true};return await r.json() as unknown;}catch(e){if(e instanceof GranterError)throw e;throw new GranterError('connection_error');}
}
export function readProvider(c:Connection,endpoint:string,body:Record<string,unknown>={}){const method=readMethods[endpoint];if(!method)throw new GranterError('invalid_endpoint');return call(c,endpoint,method,body);}
export function writeProvider(c:Connection,id:string,body:Record<string,unknown>,requestId:string){const op=operations.find(o=>o.id===id);if(!op)throw new GranterError('invalid_endpoint');return call(c,op.endpoint,op.method,body,requestId);}
