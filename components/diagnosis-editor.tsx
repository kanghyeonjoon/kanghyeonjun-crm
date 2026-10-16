'use client';
import {useState,useTransition} from 'react';
import {saveDiagnosisManagement} from '@/app/(crm)/workspace/diagnoses/actions';
import {kstInput,workflowLabels,type Management} from '@/lib/diagnosis-management';
export function DiagnosisEditor({row,canEdit,onSaved}:{row:Management&{id:string};canEdit:boolean;onSaved:(message:string)=>void}){
 const [status,setStatus]=useState(row.workflow_status);
 const [note,setNote]=useState(row.consultation_note);
 const [start,setStart]=useState(kstInput(row.scheduled_start));
 const [end,setEnd]=useState(kstInput(row.scheduled_end));
 const [method,setMethod]=useState(row.meeting_method);
 const [notice,setNotice]=useState('');
 const [pending,transition]=useTransition();
 return <form className="diagnosis-editor" onSubmit={e=>{e.preventDefault();transition(async()=>{try{const result=await saveDiagnosisManagement({id:row.id,version:row.management_version,status,note,start,end,method});setNotice(result.message);if(result.ok)onSaved(result.message);}catch{setNotice('저장 결과를 확인하지 못했습니다. 닫고 새로고침하여 확인해 주세요.');}});}}>
 <h3>처리 상태 · 상담 메모</h3><fieldset disabled={!canEdit||pending}>
 <label>처리 상태<select value={status} onChange={e=>setStatus(e.target.value as typeof status)}>{Object.entries(workflowLabels).map(([v,label])=><option key={v} value={v}>{label}</option>)}</select></label>
 <label>상담 메모<textarea rows={4} maxLength={5000} value={note} onChange={e=>setNote(e.target.value)} placeholder="연락한 내용이나 다음에 확인할 내용을 적어 주세요."/></label>
 <h3>진단 일정</h3><p className="muted">신청자와 협의한 시간을 등록해 주세요. 모든 시간은 한국시간입니다.</p>
 <div className="diagnosis-time-fields"><label>시작 일시<input type="datetime-local" value={start} required={Boolean(end)} onChange={e=>setStart(e.target.value)}/></label><label>종료 일시<input type="datetime-local" value={end} required={Boolean(start)} onChange={e=>setEnd(e.target.value)}/></label></div>
 <label>진행 방법<input value={method} required={Boolean(start||end)} maxLength={200} onChange={e=>setMethod(e.target.value)} placeholder="전화 · 온라인 미팅 · 방문 장소 등"/></label>
 {canEdit&&<div className="erp-page-actions"><button type="button" className="erp-button" onClick={()=>{setStart('');setEnd('');setMethod('');}}>일정 비우기</button><button className="erp-button primary" disabled={pending}>{pending?'저장 중…':'저장'}</button></div>}
 </fieldset><p className="muted">저장하면 일정표에 반영됩니다. 신청자에게 알림은 발송하지 않습니다.</p>{notice&&<p role="status">{notice}</p>}
 </form>;
}
