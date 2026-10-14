import {operations,type Field} from './granter-catalog.ts';
export function validateFields(fields:Field[],input:unknown):Record<string,unknown>{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('입력값을 확인해 주세요.');
 const src=input as Record<string,unknown>,out:Record<string,unknown>={};
 if(Object.keys(src).some(k=>!fields.some(f=>f.key===k)))throw new Error('허용되지 않은 입력 항목입니다.');
 for(const f of fields){let v=src[f.key];if(v===undefined||v===''){if(f.required&&!['note','memo','description','standards'].includes(f.key))throw new Error(f.label+'을(를) 입력해 주세요.');if(f.required)out[f.key]='';continue;}
 if(f.kind==='object'){v=validateFields(f.children,v);}
 else if(f.kind==='array'){
  if(!Array.isArray(v)||v.length>100||(f.required&&!v.length))throw new Error(f.label+' 항목 수를 확인해 주세요.');
  v=v.map(x=>f.children.length?validateFields(f.children,x):f.key.toLowerCase().includes('id')?positiveId(x):String(x));
 }else if(f.kind==='number'){
  if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>1e14||(f.integer&&!Number.isSafeInteger(v)))throw new Error(f.label+'의 숫자 형식을 확인해 주세요.');
  if(/Id$/.test(f.key)&&(!Number.isSafeInteger(v)||v<1))throw new Error('대상 번호가 올바르지 않습니다.');
 }else if(f.kind==='boolean'){if(typeof v!=='boolean')throw new Error('선택값이 올바르지 않습니다.');}
 else {if(typeof v!=='string'||v.length>32600)throw new Error(f.label+'을(를) 확인해 주세요.');
 if(f.options?.length&&!f.options.includes(v))throw new Error(f.label+'의 선택값을 확인해 주세요.');
 if(f.kind==='date'&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))throw new Error('실제 날짜를 입력해 주세요.');
 if(f.kind==='datetime'&&(!/^\d{4}-\d{2}-\d{2}(T|$)/.test(v)||!Number.isFinite(Date.parse(v))))throw new Error('거래 일시를 확인해 주세요.');
 if(/email/i.test(f.key)&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw new Error('이메일을 확인해 주세요.');}
 out[f.key]=v;
 }return out;
}
function positiveId(v:unknown){const n=typeof v==='number'?v:Number(v);if(!Number.isSafeInteger(n)||n<1)throw new Error('대상 번호를 확인해 주세요.');return n;}
export function validateOperation(id:string,input:unknown){
 const op=operations.find(o=>o.id===id);if(!op)throw new Error('지원하지 않는 업무입니다.');const p=validateFields(op.fields,input);
 if(op.endpoint==='salary-histories-create'&&!p.employeeId&&!p.employeeName&&!p.employeeEmail)throw new Error('직원 번호·이름·이메일 중 하나가 필요합니다.');
 if(op.endpoint==='ticket-references'&&op.method==='POST'){const t=p.targets as {id:number,type:string}[];if(t.length!==2||(t[0].id===t[1].id&&t[0].type===t[1].type))throw new Error('서로 다른 증빙·거래 2개를 선택해 주세요.');p.isUpdateReferredTicket=false;}
 if(op.endpoint==='workflows'&&p.refundAccount){const a=p.refundAccount as Record<string,unknown>;if(!a.accountHolder||!a.accountNumber||!a.organizationName)throw new Error('환불 계좌 정보를 모두 입력해 주세요.');}
 if(op.endpoint.startsWith('tax-invoices/')||op.endpoint==='cash-receipts/issue'||(op.endpoint==='cash-receipts/cancel-issue'&&p.isPartialCancel)){
  const taxKey=op.endpoint.startsWith('tax')?'taxAmount':'vat';
  for(const k of ['totalAmount','supplyValue',taxKey,...(taxKey==='vat'?['serviceFee']:[])])if(!Number.isSafeInteger(p[k]))throw new Error('발행 금액은 원 단위 정수로 입력해 주세요.');
  if(Number(p.supplyValue)+Number(p[taxKey])+Number(p.serviceFee||0)!==p.totalAmount)throw new Error('공급가액·세액·봉사료 합계가 총금액과 일치해야 합니다.');
  if(op.endpoint.startsWith('tax')){
   const items=p.tradeItems as Record<string,number>[];if(!items?.length)throw new Error('발행 품목을 입력해 주세요.');
   if(items.reduce((s,x)=>s+x.supplyValue,0)!==p.supplyValue||items.reduce((s,x)=>s+x.taxAmount,0)!==p.taxAmount)throw new Error('품목 금액 합계와 전체 공급가액·세액이 일치해야 합니다.');
   const payment=['cash','check','bankBill','accountReceivable'];if(payment.some(k=>p[k]!==undefined)&&payment.reduce((s,k)=>s+Number(p[k]||0),0)!==p.totalAmount)throw new Error('결제수단 금액 합계가 총금액과 일치해야 합니다.');
   if(op.endpoint.endsWith('/cancel-issue')&&(Number(p.totalAmount)>=0||Number(p.supplyValue)>=0||Number(p.taxAmount)>0))throw new Error('취소발행은 음수 금액으로 입력해 주세요.');
  }
 }
 if(p.issueScheduleType==='RECURRING')throw new Error('반복 발행은 그랜터에서 일정을 검토한 뒤 설정해 주세요. 이 화면에서는 단건 발행만 지원합니다.');
 if(op.endpoint==='bank-transactions'&&(p.bankTransactions as Record<string,number>[]).some(x=>x.amount<=0))throw new Error('거래 금액은 양수로 입력해 주세요.');
 if(op.method==='DELETE'){const a=(p.ticketIds||p.ticketReferenceIds) as number[];if(new Set(a).size!==a.length)throw new Error('중복 대상 번호를 제거해 주세요.');}
 return {op,payload:p};
}
export function csvCell(v:unknown){const s=v==null?'':String(v);return '"'+(/^[\s]*[=+@\-\t\r]/.test(s)?"'"+s:s).replaceAll('"','""')+'"';}
export function sanitizeProvider(v:unknown,key='',depth=0):unknown{
 if(depth>10)return undefined;
 if(/password|secret|token|certificate|identityNumber|resident|latitude|longitude|clockInLocation|clockOutLocation/i.test(key))return undefined;
 if(Array.isArray(v))return v.map(x=>sanitizeProvider(x,'',depth+1));
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,sanitizeProvider(x,k,depth+1)]).filter(([,x])=>x!==undefined));
 if(typeof v==='string'&&/^(number|accountNumber|cardNumber|bankAccount|assetNumber)$/.test(key))return '••••'+v.replace(/\s/g,'').slice(-4);
 return v;
}
