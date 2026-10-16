'use client';
import {useEffect,useState} from 'react';
import {Monitor,ChevronDown,Clock3} from 'lucide-react';
import {readFleetStatus} from '@/app/(crm)/workspace/fleet/actions';
const date=(s:string|null)=>s?new Date(s).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}):'기록 없음';
export default function FleetStatus(){
 const [data,setData]=useState<Awaited<ReturnType<typeof readFleetStatus>>|null>(null),[failed,setFailed]=useState(false),[open,setOpen]=useState(false);
 useEffect(()=>{let active=true;readFleetStatus().then(d=>{if(active)setData(d);}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[]);
 return <section className="fleet-status" aria-label="맥미니 작업 현황"><button className="fleet-heading" aria-expanded={open} onClick={()=>setOpen(!open)}><span><Monitor size={17}/><strong>맥미니 작업 현황</strong><span className="fleet-mode">마지막 수집 기록</span></span><span className="fleet-heading-right">{failed?'조회 실패':data?`${date(data.checkedAt)} KST`:'기록 조회 중'}<ChevronDown size={16} className={open?'fleet-open':''}/></span></button><div className="fleet-cards">{data?data.nodes.map(n=><article key={n.id}><div><strong>{n.name}</strong><span className="fleet-unknown">현재 상태 미확인</span></div><p>{n.queue===null?'원격 수집 미연결':<>마지막 기록 · 대기 <b>{n.queue}</b> / 실행 <b>{n.running}</b></>}</p><small><Clock3 size={12}/>{date(n.observedAt)}{n.observedAt?' KST':''}</small></article>):<p className="fleet-loading">{failed?'장비 기록을 불러오지 못했습니다. 페이지를 새로고침해 주세요.':'맥미니 기록을 확인하고 있습니다.'}</p>}</div>{open&&<div className="fleet-details"><p>실시간 모니터링이 아닌 마지막 점검 기록입니다. 웹 새로고침으로 맥미니를 직접 점검하지 않으며, 기기의 현재 실행·연결 상태는 확인되지 않았습니다.</p>{data?.nodes.map(n=><div key={n.id}><strong>{n.name}</strong><span>{n.note}</span>{n.completed!==null&&<small>관측 시각 직전 1시간 · 완료 응답 {n.completed} / 실패 응답 {n.failed} — 실제 산출물 완료와 다릅니다.</small>}</div>)}</div>}</section>;
}
