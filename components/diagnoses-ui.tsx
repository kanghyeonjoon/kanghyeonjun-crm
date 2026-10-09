'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Building2, FileText, ChartNoAxesCombined, ClipboardList } from 'lucide-react';
import { setDiagnosisDeleted } from '@/app/(crm)/workspace/diagnoses/actions';
import { signout } from '@/app/(crm)/login/actions';
import {DiagnosisEditor} from './diagnosis-editor';
import {workflowLabels,shiftDay,kstInput,type Management} from '@/lib/diagnosis-management';
type Row = Management & { deleted_at: string | null; id: string; created_at: string; name: string; email: string; phone: string; source: string; reason: string; gender: string; age: string; channel_url: string; consent_version: string; diagnosis_notifications: {kind: string; status: string}[] };
const states: Record<string, string> = { pending: '발송 대기', sending: '처리 중', accepted: '업체 접수', uncertain: '확인 필요' };
const kinds: Record<string, string> = { applicant_email: '신청자 이메일', admin_email: '관리자 이메일', applicant_alimtalk: '신청자 알림톡', applicant_sms: '신청자 문자', admin_sms: '관리자 문자' };
const date = (v: string) => new Date(v).toLocaleString('ko-KR', {timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false});
export function DiagnosesUI({email, role, rows, total, page, size, query, failed, view, week}: {email: string; role: string; rows: Row[]; total: number; page: number; size: number; query: {q: string; source: string; deleted: string}; failed: boolean; view: string; week:string}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(query);
  const [notice, setNotice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const canEdit = ['owner', 'operator'].includes(role);
  const [collapsed, setCollapsed] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pages = Math.max(1, Math.ceil(total / size));
  useEffect(() => {try {setCollapsed(localStorage.getItem('erp-menu-collapsed') === 'true');} catch {}}, []);
  useEffect(() => {if (selected) dialog.current?.showModal(); else dialog.current?.close();}, [selected]);
  function navigate(p = 1, n = size, filters = query) {
    start(() => router.push('/workspace/diagnoses?' + new URLSearchParams({...filters, page: String(p), size: String(n)}), {scroll: false}));
  }
  async function changeDeleted() {
    if (!selected) return;
    start(async () => {
      try {
        const result = await setDiagnosisDeleted(selected.id, !selected.deleted_at);
        setNotice(result.message);
        if (result.ok) {setSelected(null); setConfirmDelete(false); router.refresh();}
      } catch {setNotice('처리 결과를 확인하지 못했습니다. 새로고침 후 상태를 확인해 주세요.');}
    });
  }
  function notification(row: Row, kind: string) {
    const status = row.diagnosis_notifications.find(n => n.kind === kind)?.status;
    return <span className={`erp-status ${status === 'accepted' ? 'success' : status === 'uncertain' ? 'warning' : ''}`}>{status ? states[status] || status : '기록 없음'}</span>;
  }
  return <div className="erp-admin">
    <aside className={`erp-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="erp-brand"><b className="erp-logo">H</b><div className="erp-nav-label"><strong>강현준 ERP</strong><small>병원 영업 관리</small></div></div>
      <nav aria-label="관리자 메뉴"><div className="erp-group-label">CRM WORKSPACE</div>
        <Link href="/workspace?tab=hospitals" title="병원 관리"><Building2 size={18}/><span className="erp-nav-label">병원 관리</span></Link>
        <Link href="/workspace?tab=proposals" title="제안서"><FileText size={18}/><span className="erp-nav-label">제안서</span></Link>
        <Link href="/workspace?tab=opportunities" title="영업 진행"><ChartNoAxesCombined size={18}/><span className="erp-nav-label">영업 진행</span></Link>
        <Link href="/workspace/columns" title="칼럼 관리"><FileText size={18}/><span className="erp-nav-label">칼럼 관리</span></Link>
        <Link href="/workspace/diagnoses" title="무료진단 신청" aria-current="page"><ClipboardList size={18}/><span className="erp-nav-label">무료진단 신청</span></Link>
      </nav>
      <div className="erp-sidebar-bottom"><span className="erp-nav-label">병원 정보 · 제안서 · 영업</span></div>
      <button className="erp-collapse" aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'} onClick={() => {setCollapsed(!collapsed); try {localStorage.setItem('erp-menu-collapsed', String(!collapsed));} catch {}}}>{collapsed ? '»' : '«'}<span className="erp-nav-label">메뉴 접기</span></button>
    </aside>
    <div className="erp-main"><header className="erp-topbar"><nav aria-label="현재 위치">관리자 <span>/</span> CRM <span>/</span><b>무료진단 신청</b></nav><div className="erp-account"><span>{email}</span><span className="erp-chip">{role === 'owner' || role === 'operator' ? '운영관리자' : '읽기 전용'}</span><form action={signout}><button className="erp-button small">로그아웃</button></form></div>{pending && <div className="erp-progress"><div/></div>}</header>
      <main className="erp-content"><section className="erp-page">
        <div className="erp-page-heading"><div><h1>무료진단 신청</h1><p>신청 내역과 알림 처리 상태 · 한국시간</p></div><div className="erp-page-actions"><button className="erp-button" disabled={pending} onClick={() => start(() => router.refresh())}>↻ 새로고침</button></div></div>
        <div className="erp-page-actions"><Link className="erp-button" href="/workspace/diagnoses" aria-current={view==='list'?'page':undefined}>신청 목록</Link><Link className="erp-button" href="/workspace/diagnoses?view=schedule" aria-current={view==='schedule'?'page':undefined}>주간 일정표</Link></div>
        {view==='list'&&<><div className="erp-page-actions"><button className="erp-button" aria-pressed={!query.deleted} disabled={pending} onClick={() => navigate(1,size,{...query,deleted:''})}>접수된 신청</button><button className="erp-button" aria-pressed={Boolean(query.deleted)} disabled={pending} onClick={() => navigate(1,size,{...query,deleted:'true'})}>삭제된 신청</button></div>
        {notice && <p role="status">{notice}</p>}
        <form className="erp-search" onSubmit={e => {e.preventDefault(); navigate(1, size, draft);}}>
          <div className="erp-search-grid">
            <div className="erp-search-field"><label className="erp-field-label" htmlFor="diagnosis-source">유입 경로</label><div className="erp-field-content"><select id="diagnosis-source" value={draft.source} onChange={e => setDraft({...draft, source: e.target.value})}><option value="">전체 경로</option>{['스레드','유튜브','소개','기타'].map(v => <option key={v}>{v}</option>)}</select></div></div>
            <div className="erp-search-field"><label className="erp-field-label" htmlFor="diagnosis-query">검색어</label><div className="erp-field-content"><input id="diagnosis-query" value={draft.q} onChange={e => setDraft({...draft, q: e.target.value})} placeholder="이름 · 이메일 · 전화번호" maxLength={150}/></div></div>
          </div><div className="erp-search-footer"><span className="muted">접수일 최신순</span><div><button type="button" className="erp-button" disabled={pending} onClick={() => {setDraft({q:'', source:'', deleted:query.deleted}); navigate(1, size, {q:'',source:'',deleted:query.deleted});}}>초기화</button> <button className="erp-button primary" disabled={pending}>조회</button></div></div>
        </form>
        <div className="erp-grid" aria-busy={pending}><div className="erp-grid-toolbar"><b>{query.deleted ? '삭제된 신청' : '조회 결과'} <span className="count">{total.toLocaleString('ko-KR')}</span>건</b><span className="period">{rows.length ? (page - 1) * size + 1 : 0}–{(page - 1) * size + rows.length}</span></div>
          <div className="erp-grid-scroll" role="region" aria-label="신청 내역 표, 좌우로 스크롤 가능" tabIndex={0}><table className="erp-table erp-sticky-actions diagnosis-table"><caption className="diagnosis-sr-only">무료진단 신청 내역</caption><thead><tr>{['No.','신청자','처리 상태','진단 일정','전화번호','이메일','유입 경로','접수일','신청자 이메일','관리자 이메일','관리'].map(v => <th key={v} scope="col">{v}</th>)}</tr></thead><tbody>
            {!failed && rows.map((r, i) => <tr key={r.id}><td className="num">{(page - 1) * size + i + 1}</td><td className="erp-name" title={r.name}>{r.name}</td><td><span className="erp-status">{workflowLabels[r.workflow_status]}</span></td><td>{r.scheduled_start?date(r.scheduled_start):'미정'}</td><td>{r.phone}</td><td title={r.email}>{r.email}</td><td>{r.source}</td><td>{date(r.created_at)}</td><td>{notification(r,'applicant_email')}</td><td>{notification(r,'admin_email')}</td><td><button className="erp-button small" aria-label={`${r.name} 신청 상세 보기`} disabled={pending} onClick={() => {setSelected(r); setConfirmDelete(false); setNotice('');}}>상세 보기</button></td></tr>)}
            {(failed || !rows.length) && <tr><td colSpan={11} className="diagnosis-empty">{failed ? <span role="alert">신청 목록을 가져오지 못했습니다. 새로고침해 주세요.</span> : query.q || query.source ? '검색 조건에 맞는 신청이 없습니다.' : '접수된 신청이 없습니다.'}</td></tr>}
          </tbody></table></div>
          <div className="erp-pagination"><span>총 {total.toLocaleString('ko-KR')}건</span><label>페이지당 <select aria-label="페이지당 행 수" value={size} disabled={pending} onChange={e => navigate(1, Number(e.target.value))}>{[20,50,100].map(n => <option key={n} value={n}>{n}개</option>)}</select></label><div className="pages"><button disabled={pending || page === 1} onClick={() => navigate(1)}>처음</button><button disabled={pending || page === 1} onClick={() => navigate(page - 1)}>이전</button><span>{page} / {pages}</span><button disabled={pending || page === pages} onClick={() => navigate(page + 1)}>다음</button><button disabled={pending || page === pages} onClick={() => navigate(pages)}>마지막</button></div></div>
        </div></>}
        {view==='schedule'&&<section className="diagnosis-schedule" aria-label="주간 진단 일정표">
          <div className="diagnosis-week-nav"><div><h2>{week} ~ {shiftDay(week,6)}</h2><p>월요일–일요일 · 한국시간 · {total}건</p></div><div className="erp-page-actions"><Link className="erp-button" href={'?view=schedule&week='+shiftDay(week,-7)}>← 이전 주</Link><Link className="erp-button" href="?view=schedule">이번 주</Link><Link className="erp-button" href={'?view=schedule&week='+shiftDay(week,7)}>다음 주 →</Link></div></div>
          <form className="diagnosis-week-nav" action="/workspace/diagnoses"><input type="hidden" name="view" value="schedule"/><label>날짜로 이동 <input type="date" name="week" defaultValue={week} required/></label><button className="erp-button">이동</button><Link className="erp-button primary" href="/workspace/diagnoses">신청 목록에서 일정 등록</Link></form>
          {notice&&<p role="status">{notice}</p>}
          {failed?<p role="alert">일정 전체를 불러오지 못했습니다. 새로고침해 주세요.</p>:<div className="diagnosis-week">{Array.from({length:7},(_,i)=>{const day=shiftDay(week,i);const events=rows.filter(r=>r.scheduled_start&&r.scheduled_end&&kstInput(r.scheduled_start).slice(0,10)<=day&&kstInput(new Date(new Date(r.scheduled_end).getTime()-1).toISOString()).slice(0,10)>=day);return <section key={day} className="diagnosis-day"><h3>{['월','화','수','목','금','토','일'][i]} <span>{day.slice(5)}</span></h3>{!events.length?<p className="muted">등록된 일정 없음</p>:events.map(r=><button key={r.id} className="diagnosis-event" onClick={()=>{setSelected(r);setConfirmDelete(false);setNotice('');}}><span>{kstInput(r.scheduled_start).slice(0,10)!==day?'전날부터':kstInput(r.scheduled_start).slice(11)} – {kstInput(r.scheduled_end).slice(0,10)!==day?'다음 날':kstInput(r.scheduled_end).slice(11)}</span><strong>{r.name}</strong><span>{r.meeting_method}</span><small>{workflowLabels[r.workflow_status]}</small></button>)}</section>})}</div>}
        </section>}
        <div className="erp-bottom-note">신청 접수는 상담 확정이 아닙니다. 알림 ‘업체 접수’는 수신 완료를 의미하지 않습니다. 알림톡은 템플릿 준비 전 발송되지 않습니다.</div>
      </section></main>
    </div>
    <dialog ref={dialog} className="erp-dialog" aria-label="무료진단 신청 상세" onCancel={e => {if (pending) e.preventDefault(); else setSelected(null);}} onClose={() => setSelected(null)}>{selected && <><div className="erp-dialog-heading"><div><p>무료진단 신청 · {date(selected.created_at)}</p><h2>{selected.name}</h2></div><button className="erp-button" disabled={pending} onClick={() => setSelected(null)}>닫기</button></div><div className="erp-dialog-body">{!selected.deleted_at&&<DiagnosisEditor key={selected.id+':'+selected.management_version} row={selected} canEdit={canEdit} onSaved={message=>{setNotice(message);setSelected(null);router.refresh();}}/>}<dl>{Object.entries({이메일:selected.email,전화번호:selected.phone,'유입 경로':selected.source,'신청 이유':selected.reason,성별:selected.gender,연령대:selected.age,유튜브:selected.channel_url,'동의문 버전':selected.consent_version}).map(([k,v]) => <div key={k}><dt>{k}</dt><dd>{k === '유튜브' && /^https?:\/\//i.test(v) ? <a className="erp-link" href={v} target="_blank" rel="noopener noreferrer">{v} ↗</a> : v}</dd></div>)}{selected.diagnosis_notifications.map(n => <div key={n.kind}><dt>{kinds[n.kind] || n.kind}</dt><dd>{states[n.status] || n.status}{n.kind === 'applicant_alimtalk' && n.status === 'pending' ? ' (템플릿 준비 전 미발송)' : ''}</dd></div>)}</dl>{canEdit && <div className="stack">{selected.deleted_at ? <><p>삭제된 신청입니다. 복원하면 접수 목록에 다시 표시됩니다.</p><button className="erp-button primary" disabled={pending} onClick={changeDeleted}>신청 복원</button></> : confirmDelete ? <><p role="alert">{selected.name}님의 신청을 삭제하시겠습니까? 삭제된 신청 목록에서 복원할 수 있습니다. 이미 발송된 알림은 취소되지 않습니다.</p><div><button className="erp-button danger" disabled={pending} onClick={changeDeleted}>{pending ? '처리 중…' : '삭제 확인'}</button> <button className="erp-button" disabled={pending} onClick={() => setConfirmDelete(false)}>취소</button></div></> : <button className="erp-button danger" disabled={pending} onClick={() => setConfirmDelete(true)}>신청 삭제</button>}{notice && <p role="status">{notice}</p>}</div>}</div></>}</dialog>
  </div>;
}
