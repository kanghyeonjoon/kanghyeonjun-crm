export type ForecastItem={id:string,title:string,direction:'income'|'expense',amount:number,expected_on:string,status:'planned'|'completed'|'cancelled',version:number};
export function forecast(balance:number|null,rows:ForecastItem[],start:string,end:string,card:number,cardMonth:string,cardPaid:boolean){
 const active=rows.filter(r=>r.status==='planned'&&r.expected_on>=start&&r.expected_on<=end);
 const income=active.filter(r=>r.direction==='income').reduce((s,r)=>s+r.amount,0),expenses=active.filter(r=>r.direction==='expense').reduce((s,r)=>s+r.amount,0);
 // Undated unpaid bills are reserved conservatively through the chosen horizon.
 const bill=!cardPaid&&cardMonth<=end.slice(0,7)?card:0;
 const known=balance!==null&&Number.isFinite(balance);let running=known?balance!-bill:null;
 const days=[...new Set(active.map(r=>r.expected_on))].sort().map(date=>{const items=active.filter(r=>r.expected_on===date);const incoming=items.filter(r=>r.direction==='income').reduce((s,r)=>s+r.amount,0),outgoing=items.filter(r=>r.direction==='expense').reduce((s,r)=>s+r.amount,0);if(running!==null)running+=incoming-outgoing;return {date,incoming,outgoing,balance:running};});
 const overdue=rows.filter(r=>r.status==='planned'&&r.expected_on<start).length;
 return {income,expenses,bill,projected:known?balance!+income-expenses-bill:null,days,overdue};
}
