export const workspaceGroups = [
 {id:'marketing',label:'마케팅',items:[{id:'columns',label:'칼럼 관리',href:'/workspace/columns'},{id:'shorts',label:'쇼츠 제작 ↗',href:'http://127.0.0.1:4177/',external:true},{id:'cardnews',label:'카드뉴스',href:'/workspace/cardnews'}]},
 {id:'crm',label:'CRM',items:[{id:'hospitals',label:'병원 관리',href:'/workspace?tab=hospitals'},{id:'proposals',label:'제안서',href:'/workspace?tab=proposals'},{id:'opportunities',label:'영업 진행',href:'/workspace?tab=opportunities'},{id:'diagnoses',label:'무료진단 신청',href:'/workspace/diagnoses'}]},
 {id:'finance',label:'재무 관리',items:[{id:'overview',label:'대시보드',href:'/workspace/finance/clobe'},{id:'plans',label:'예정 수입·지출',href:'/workspace/finance/clobe?tab=plans'},{id:'assets',label:'연동 계좌',href:'/workspace/finance/clobe?tab=assets'},{id:'mindset',label:'돈무의식',href:'/workspace/finance/clobe?tab=mindset'},{id:'ledger',label:'수기 장부',href:'/workspace/finance'}]},
] as const;
export function activeWorkspaceItem(path:string,tab:string|null){
 if(path==='/workspace')return ['proposals','opportunities'].includes(tab||'')?tab!:'hospitals';
 if(path.startsWith('/workspace/finance/clobe'))return ['plans','assets','mindset'].includes(tab||'')?tab!:'overview';
 if(path.startsWith('/workspace/finance'))return 'ledger';
 if(path.startsWith('/workspace/columns'))return 'columns';
 if(path.startsWith('/workspace/cardnews'))return 'cardnews';
 if(path.startsWith('/workspace/diagnoses')||path.startsWith('/workspace/integrations/solapi'))return 'diagnoses';
 return '';
}
