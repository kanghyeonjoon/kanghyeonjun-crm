import type {forecast} from '@/lib/finance-forecast';
type Props={balance:number|null,calc:ReturnType<typeof forecast>|null,start:string,end:string};
const won=(n:number)=>n.toLocaleString('ko-KR')+'원';
export default function CashForecastChart({balance,calc,start,end}:Props){
 if(balance===null||!calc||calc.projected===null)return <div className="cf-chart-empty">계좌 잔액과 계획을 조회하면 예상 흐름이 표시됩니다.</div>;
 const opening=balance-calc.bill;
 const points=[{date:start,value:opening},...calc.days.map(d=>({date:d.date,value:d.balance!})),{date:end,value:calc.projected}];
 const values=points.map(p=>p.value),low=Math.min(...values),high=Math.max(...values),pad=Math.max((high-low)*.2,Math.abs(high)*.08,10000),min=low-pad,max=high+pad;
 const t=(d:string)=>Date.parse(d+'T00:00:00Z'),duration=Math.max(1,t(end)-t(start));
 const x=(d:string)=>80+Math.min(1,Math.max(0,(t(d)-t(start))/duration))*550;
 const y=(v:number)=>25+(max-v)/(max-min)*150;
 let path=`M ${x(start)} ${y(opening)}`;for(const p of points.slice(1))path+=` H ${x(p.date)} V ${y(p.value)}`;
 return <div className="cf-chart"><div className="cf-chart-total"><strong>{won(calc.projected)}</strong><span>{end} 예상 잔액</span></div><svg viewBox="0 0 660 215" role="img" aria-label={`${start}부터 ${end}까지 등록 계획 기준 예상 잔액. 시작 ${won(opening)}, 종료 ${won(calc.projected)}`}>
 {[0,.5,1].map(f=>{const v=max-(max-min)*f,Y=25+150*f;return <g key={f}><line x1="80" x2="630" y1={Y} y2={Y} stroke="#e9edf4" strokeDasharray="4 5"/><text x="67" y={Y+4} textAnchor="end" fill="#7d8797" fontSize="11">{(v/10000).toLocaleString('ko-KR',{maximumFractionDigits:0})}만</text></g>})}
 <path d={`${path} L 630 175 L 80 175 Z`} fill="#1447e6" opacity=".05"/><path d={path} fill="none" stroke="#1447e6" strokeWidth="2.5" strokeLinejoin="round"/>
 {points.map((p,i)=><circle key={i} cx={x(p.date)} cy={y(p.value)} r="3.5" fill="#fff" stroke="#1447e6" strokeWidth="2"><title>{p.date}: {won(p.value)}</title></circle>)}
 <text x="80" y="205" fill="#7d8797" fontSize="11">{start.slice(5).replace('-','.')}</text><text x="630" y="205" textAnchor="end" fill="#7d8797" fontSize="11">{end.slice(5).replace('-','.')}</text></svg>
 {calc.days.length===0&&<p className="cf-chart-caption">등록된 입출금 계획이 없어 같은 잔액으로 표시됩니다.</p>}</div>;
}
