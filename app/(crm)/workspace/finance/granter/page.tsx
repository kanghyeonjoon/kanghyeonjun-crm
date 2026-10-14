import Link from 'next/link';
import {requireMember} from '@/lib/access';
import {monthBounds} from '@/lib/finance';
import {granterRead,normalizeProfile,normalizeAssets,normalizeTickets,granterMessage,granterAmount} from '@/lib/granter';
export const dynamic='force-dynamic';
export const maxDuration=60;
export default async function Granter({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
 const {user,role}=await requireMember();
 // A single production API key belongs to this operator's own business, not every future CRM owner.
 if(role!=='owner'||user.email?.toLowerCase()!=='dkwk302@naver.com')return <main className="erp-page"><h1>그랜터 연동</h1><p>연결 소유자만 접근할 수 있습니다.</p><Link href="/workspace/finance">재무 관리로 돌아가기</Link></main>;
 const p=await searchParams;const {month,start,end}=monthBounds(p.month);const last=new Date(new Date(end+'T00:00:00Z').getTime()-86400000).toISOString().slice(0,10);
 let company='';let error='';let assetError='';let ticketError='';let checked='';let assets:ReturnType<typeof normalizeAssets>=[];let tickets:ReturnType<typeof normalizeTickets>=[];
 try{
 const profile=normalizeProfile(await granterRead('workspace-profile'));company=profile.companyName;
 const result=await Promise.allSettled([granterRead('assets',{assetType:'BANK_ACCOUNT'}),granterRead('assets',{assetType:'SECURITIES_ACCOUNT'}),granterRead('tickets',{ticketType:'BANK_TRANSACTION_TICKET',startDate:start,endDate:last})]);
 try{for(const r of result.slice(0,2)){if(r.status==='rejected')throw r.reason;assets.push(...normalizeAssets(r.value,profile.workspaceId));}}catch(e){assets=[];assetError=granterMessage(e);}
 try{const r=result[2];if(r.status==='rejected')throw r.reason;tickets=normalizeTickets(r.value,profile.workspaceId);}catch(e){ticketError=granterMessage(e);}
 checked=new Date().toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
 }catch(e){error=granterMessage(e);}
 const total=tickets.length;const n=Number(p.page)||1;const pages=Math.max(1,Math.ceil(total/50));const page=Math.max(1,Math.min(pages,Number.isFinite(n)?Math.floor(n):1));
 const link=(i:number)=>'?'+new URLSearchParams({month,page:String(i)});
 return <main className="granter-page"><div className="erp-page-heading"><div><Link href="/workspace/finance">← 재무 관리</Link><h1>그랜터 연동</h1><p>{company||'연결 상태 확인'} · 소유자 전용 · 조회 전용</p></div><a href={'?month='+month} className="erp-button primary">다시 조회</a></div>
 <p className="erp-bottom-note">그랜터에서 수집한 자료를 조회합니다. ERP 수기 장부에 자동 합산하거나 저장하지 않습니다. 카드 결제·계좌이체가 포함된 출금을 회계상 비용으로 단정하지 않습니다.</p>
 {checked&&<p>ERP 조회 시각: {checked} (한국시간) · 금융기관 수집 시각과 다를 수 있습니다.</p>}
 {error?<p className="error" role="alert">{error}</p>:<><section className="erp-grid"><div className="erp-grid-toolbar"><h2>계좌·증권 자산</h2><span>잔액은 현재 그랜터에 저장된 값</span></div><div className="erp-grid-scroll" role="region" aria-label="계좌별 잔액 표" tabIndex={0}><table className="erp-table" style={{minWidth:850}}><thead><tr>{['기관','별칭','계좌','유형','잔액','마지막 수집 성공','상태'].map(v=><th key={v}>{v}</th>)}</tr></thead><tbody>{assets.map(a=><tr key={`${a.type}:${a.id}`}><td>{a.bank}</td><td>{a.name}</td><td>{a.number||'—'}</td><td>{a.type==='SECURITIES_ACCOUNT'?'증권':a.accountType==='LOAN'?'대출':a.accountType||'계좌'}</td><td>{a.type==='SECURITIES_ACCOUNT'?'증권 평가금액 별도 확인':granterAmount(a.balance,a.currency)}</td><td>{a.completed||'제공 없음'}</td><td>{!a.active?'비활성':a.failed&&(!a.completed||a.failed>a.completed)?'최근 수집 실패':'연결됨'}{a.hidden?' · 숨김 자산':''}</td></tr>)}{(!assets.length||assetError)&&<tr><td colSpan={7}>{assetError||'연결된 은행·증권 계좌가 없습니다.'}</td></tr>}</tbody></table></div></section>
 <section className="erp-grid"><div className="erp-grid-toolbar"><h2>계좌 거래내역</h2><span>출처: 그랜터 · {total.toLocaleString()}건</span></div><form className="finance-filters"><label>조회 월<input type="month" name="month" defaultValue={month} min="2000-01" max="2100-12" required/></label><button className="erp-button primary">조회</button></form><div className="erp-grid-scroll" role="region" aria-label="그랜터 계좌 거래 내역" tabIndex={0}><table className="erp-table" style={{minWidth:850}}><thead><tr>{['거래일시','기관·계좌','구분','내용','금액','분류'].map(v=><th key={v}>{v}</th>)}</tr></thead><tbody>{tickets.slice((page-1)*50,page*50).map(t=><tr key={t.id}><td>{t.date.replace('T',' ')}</td><td>{t.bank} {t.account}</td><td>{t.direction==='IN'?'입금':t.direction==='OUT'?'출금':'확인 필요'}</td><td>{t.name}</td><td>{granterAmount(t.amount,t.currency)}</td><td>{t.category||'미분류'}</td></tr>)}{(!total||ticketError)&&<tr><td colSpan={6}>{ticketError||`${month}에 조회된 계좌 거래가 없습니다.`}</td></tr>}</tbody></table></div><div className="erp-pagination"><span>{page} / {pages} · 50건씩 표시</span><div>{page>1&&<Link className="erp-button" href={link(page-1)}>이전</Link>}{page<pages&&<Link className="erp-button" href={link(page+1)}>다음</Link>}</div></div></section></>}
 <p className="erp-bottom-note">그랜터에서 금융기관 인증이 만료되면 재연결이 필요합니다. 이 화면에서는 금융기관 재수집, 이체, 증빙 발행 또는 원본 수정 요청을 실행하지 않습니다.</p></main>;
}
