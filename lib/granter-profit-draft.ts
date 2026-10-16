import type {Row} from './granter-analytics.ts';
import {transactionRow} from './granter-transactions.ts';
export type DraftSource={rows:Row[],categories:Row[]};
const obj=(v:unknown):Row=>v&&typeof v==='object'&&!Array.isArray(v)?v as Row:{};
export function profitScope(r:Row){const t=transactionRow(r);return {key:String(r.ticketType)+':'+t.accountKey,label:r.ticketType==='MANUAL_TRANSACTION_TICKET'?'수기 전표':t.accountLabel};}
const groupNames:Record<string,string>={revenue:'매출',cost:'매출원가',operatingExpense:'판매비와 관리비',otherIncome:'영업외수익',otherExpense:'영업외비용'};
export function profitDraft(source:DraftSource,excludedScopes:string[]=[]){
 const categories=new Map(source.categories.map(c=>[String(c.id),c]));const seen=new Set<string>(),scopes=new Map<string,string>(),excluded=new Set(excludedScopes);let excludedCount=0,duplicates=0;
 const unique=source.rows.filter(r=>{const scope=profitScope(r);scopes.set(scope.key,scope.label);const id=String(r.ticketType)+':'+r.id;if(seen.has(id)){duplicates++;return false;}seen.add(id);if(r.isIncluded!==true||excluded.has(scope.key)){excludedCount++;return false;}return true;});
 const key=(r:Row)=>String(r.ticketType)+':'+r.id;const present=new Map(unique.map(r=>[key(r),r]));const suppressed=new Set<string>();
 for(const r of unique)for(const ref of Array.isArray(r.ticketReferences)?r.ticketReferences as Row[]:[]){if(ref.purpose!=='DEDUPLICATE_CHECK_CARD_USAGE')continue;const target=present.get(String(ref.targetType)+':'+ref.targetId);if(!target)continue;const bank=r.ticketType==='BANK_TRANSACTION_TICKET'?r:target.ticketType==='BANK_TRANSACTION_TICKET'?target:null;const card=r.ticketType==='EXPENSE_TICKET'?r:target.ticketType==='EXPENSE_TICKET'?target:null;if(bank&&card&&bank.amount===card.amount&&bank.transactionType===card.transactionType)suppressed.add(key(bank));}
 const totals={revenue:0,cost:0,operatingExpense:0,otherIncome:0,otherExpense:0};const breakdown=new Map<string,{category:string,group:string,amount:number,count:number}>();const review:Row[]=[];let nonProfit=0,included=0;
 for(const r of unique){if(suppressed.has(key(r))){duplicates++;continue;}const c=categories.get(String(obj(r.expenseCategory).id))||obj(r.expenseCategory);const sub=String(c.subInfo||'').replace(/\s/g,'');let group:keyof typeof totals|null=null;
 if(['매출','매출액'].includes(sub))group='revenue';else if(sub==='매출원가')group='cost';else if(['판매비와관리비','판매비와일반관리비','판매관리비','판관비'].includes(sub))group='operatingExpense';else if(sub==='영업외수익')group='otherIncome';else if(sub==='영업외비용')group='otherExpense';
 if(!group){if(['자산','부채','자본','자산/부채','자산및부채','자산및부채거래','이체'].includes(sub)){nonProfit++;continue;}review.push({...r,reviewReason:sub?`분류 검토: ${sub}`:'미분류',category:String(c.name||'미분류')});continue;}
 if(typeof r.amount!=='number'||!Number.isFinite(r.amount)||!['IN','OUT'].includes(String(r.transactionType))){review.push({...r,reviewReason:'금액·입출금 방향 확인'});continue;}
 const income=group==='revenue'||group==='otherIncome';const n=r.amount*((r.transactionType==='IN')===income?1:-1);totals[group]+=n;included++;const id=group+':'+String(c.id??c.name);const b=breakdown.get(id)||{category:String(c.name||sub),group:groupNames[group],amount:0,count:0};b.amount+=n;b.count++;breakdown.set(id,b);
 }
 const operating=totals.revenue-totals.cost-totals.operatingExpense,pretax=operating+totals.otherIncome-totals.otherExpense;
 return {totals,operating,pretax,margin:totals.revenue>0?operating/totals.revenue*100:null,review,breakdown:[...breakdown.values()],scopes:[...scopes].map(([key,label])=>({key,label})),included,excludedCount,duplicates,nonProfit};
}
