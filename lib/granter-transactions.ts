import type {Row} from './granter-analytics.ts';
const object=(v:unknown):Row=>v&&typeof v==='object'&&!Array.isArray(v)?v as Row:{};
export type Transaction=Row&{contactName:string,accountKey:string,accountLabel:string,categoryName:string,linkedCount:number|null};
export function transactionRow(r:Row):Transaction{
 const bank=object(r.bankTransaction),card=object(r.cardUsage),asset=object(bank.bankAccount||card.card||object(r.purchaseUsage).card);
 const contact=typeof r.contact==='string'?r.contact:String(object(r.contact).companyName||object(r.contact).name||'');
 return {...r,contactName:contact,accountKey:String(asset.id??r.assetId??'unknown'),accountLabel:[asset.organizationName,asset.nickname||asset.name,asset.number].filter(Boolean).join(' · ')||'계좌 정보 없음',categoryName:String(object(r.expenseCategory).name||'미분류'),linkedCount:Array.isArray(r.ticketReferences)?r.ticketReferences.length:null};
}
export function filterTransactions(rows:Transaction[],search:string,direction:string,account:string,reviewOnly:boolean){const term=search.trim().toLocaleLowerCase();return rows.filter(r=>(direction==='ALL'||r.transactionType===direction)&&(account==='ALL'||r.accountKey===account)&&(!reviewOnly||r.categoryName==='미분류')&&(!term||[r.content,r.contactName,r.accountLabel,r.categoryName,r.amount].join(' ').toLocaleLowerCase().includes(term)));}
export function transactionTotals(rows:Transaction[]){let income=0,expense=0,excluded=0,unknown=0;for(const r of rows){if(r.isIncluded===false){excluded++;continue;}if(typeof r.amount!=='number'||!Number.isFinite(r.amount)){unknown++;continue;}if(r.transactionType==='IN')income+=r.amount;else if(r.transactionType==='OUT')expense+=r.amount;else unknown++;}return {income,expense,net:income-expense,excluded,unknown};}
