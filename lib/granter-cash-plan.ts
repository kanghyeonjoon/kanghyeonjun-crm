import type {Row} from './granter-analytics.ts';
export function cashBasis(report:Row|undefined){
 const assets=report&&Array.isArray(report.assets)?report.assets as Row[]:[];
 const eligible=assets.filter(a=>a.assetType==='BANK_ACCOUNT'&&a.currencyCode==='KRW'&&a.isLoan===false);
 const complete=eligible.length>0&&eligible.every(a=>typeof a.currentBalance==='number'&&Number.isFinite(a.currentBalance));
 return {cash:complete?eligible.reduce((s,a)=>s+Number(a.currentBalance),0):null,count:eligible.length,excluded:assets.length-eligible.length};
}
export function availableCash(cash:number|null,expenses:string,reserve:string,restricted:string){
 const fields=[expenses,reserve,restricted];
 if(cash===null||!Number.isFinite(cash)||fields.some(v=>!/^\d+$/.test(v.trim())||!Number.isSafeInteger(Number(v))||Number(v)>1e14))return null;
 const [out,buffer,locked]=fields.map(Number);const net=cash-out-buffer-locked;
 return {available:Math.max(0,net),shortfall:Math.max(0,-net),expenses:out,reserve:buffer,restricted:locked};
}
export function collectionState(asset:Row){const h=asset.scrapHistory as Row|undefined;const completed=Date.parse(String(h?.lastCompletedAt||'')),failed=Date.parse(String(h?.lastFailedAt||''));if(asset.isActive===false)return {label:'연결 비활성',tone:'warn'};if(Number.isFinite(failed)&&(!Number.isFinite(completed)||failed>completed))return {label:'최근 수집 실패',tone:'warn'};if(Number.isFinite(completed))return {label:'수집 이력 있음',tone:'good'};return {label:'수집 이력 확인 필요',tone:'neutral'};}
