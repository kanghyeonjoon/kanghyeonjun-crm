import 'server-only';
import {GranterError} from './granter';
import {operations} from './granter-catalog';
export type Connection={id:string,label:string,key:string,workspaceId?:number};
export function connections():Connection[]{
 return [];
}

const readMethods:Record<string,string>={'workspace-profile':'GET','user-profiles':'GET','assets':'POST','tickets':'POST','tickets/detail':'POST','ticket-references':'GET','organizations':'GET','balances':'POST','daily-financial-report':'POST','exchange-rates':'POST','ticket-tags':'GET','ticket-tag-groups':'GET','tags':'GET','tag-details':'GET','categories':'GET','subscription':'GET','people':'GET','teams':'GET','contacts':'GET','workflows':'GET','salary-histories':'POST','inventory-products':'GET','inventories':'GET','attendances':'POST','leave-balances':'POST','leave-histories':'POST','holidays':'POST'};
async function call(connection:Connection,endpoint:string,method:string,body:Record<string,unknown>,idempotency?:string):Promise<unknown>{
 throw new Error('그랜터 연결이 해제되었습니다. 클로브AI를 이용해 주세요.');
}

export function readProvider(c:Connection,endpoint:string,body:Record<string,unknown>={}){const method=readMethods[endpoint];if(!method)throw new GranterError('invalid_endpoint');return call(c,endpoint,method,body);}
export function writeProvider(c:Connection,id:string,body:Record<string,unknown>,requestId:string){const op=operations.find(o=>o.id===id);if(!op)throw new GranterError('invalid_endpoint');return call(c,op.endpoint,op.method,body,requestId);}
