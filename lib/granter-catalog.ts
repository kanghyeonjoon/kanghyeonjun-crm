import forms from './granter-forms.json' with {type:'json'};
export type Field={key:string,label:string,kind:string,required:boolean,integer:boolean,options:string[],children:Field[]};
export type Operation={id:string,endpoint:string,method:string,title:string,group:string,fields:Field[]};
export const operations=forms as Operation[];
export const ticketTypes={BANK_TRANSACTION_TICKET:'계좌',EXPENSE_TICKET:'카드',TAX_INVOICE_TICKET:'세금계산서',CASH_RECEIPT_TICKET:'현금영수증',MANUAL_TRANSACTION_TICKET:'수기 전표',MERCHANT_CARD_TRANSACTION_TICKET:'POS 카드매출',MERCHANT_CARD_SETTLEMENT_DETAIL_TICKET:'POS 정산',ECOMMERCE_SALES_DETAIL_TICKET:'이커머스 매출',ECOMMERCE_SETTLEMENT_DETAIL_TICKET:'이커머스 정산',PG_TRANSACTION_TICKET:'PG 거래',PG_SETTLEMENT_DETAIL_TICKET:'PG 정산',SOCIAL_INSURANCE_PREMIUM_TICKET:'사회보험료'};
export const assetTypes={BANK_ACCOUNT:'은행 계좌',CARD:'카드',SECURITIES_ACCOUNT:'증권',HOME_TAX_ACCOUNT:'홈택스',PG:'PG사',ECOMMERCE:'오픈마켓',SOCIAL_INSURANCE_ACCOUNT:'사회보험',MERCHANT_GROUP:'가맹점',CUSTOM:'사용자 자산',MANUAL:'수기 자산'};
export const views=[['overview','대시보드','재무'],['tickets','거래 내역','재무'],['references','증빙 연결','재무'],['assets','연동 자산','재무'],['organizations','기관 연결','재무'],['balances','잔액 추이','재무'],['daily','자금일보','재무'],['exchange','환율','재무'],['issuance','증빙 발행','업무'],['manual','수기 입력','업무'],['workflows','전자결재','운영'],['salary','급여','운영'],['attendance','근무','운영'],['leave','잔여 연차','운영'],['leave-history','연차 변경','운영'],['inventory','재고','운영'],['products','품목','운영'],['holidays','공휴일','운영'],['contacts','거래처','기준'],['categories','계정과목','기준'],['tags','1차 태그','기준'],['tag-details','2차 태그','기준'],['ticket-tags','다중 태그','기준'],['people','구성원','기준'],['teams','팀','기준'],['profile','회사·사용자','설정'],['subscription','요금제','설정'],['history','작업 이력','설정'],['forecast','자금 예측','분석'],['audit','거래 검토','분석'],['budget','예산 시뮬레이션','분석'],['counterparties','거래처 분석','분석'],['commerce','이커머스 분석','분석'],['companies','법인·지점','분석']] as const;
export const columns:Record<string,[string,string][]>={
 analysis:[['name','분류·거래처'],['income','입금(원화)'],['expense','출금(원화)'],['net','순변동(원화)'],['count','거래 수']],
 audit:[['id','번호'],['transactAt','거래일시'],['content','내용'],['amount','금액'],['reviewReason','검토 사유']],
 companies:[['company','회사'],['currentBalance','현금 잔액(원화)'],['loanBalance','대출(원화)'],['netPosition','순잔액(원화)'],['effectiveEndDate','기준일'],['error','조회 오류']],
 tickets:[['id','번호'],['transactAt','거래일시'],['transactionType','입출금'],['content','내용'],['amount','금액(원화 기준)'],['expenseCategory.name','계정과목'],['contact.companyName','거래처'],['isIncluded','포함'],['isConnected','증빙 연결']],
 assets:[['id','번호'],['organizationName','기관'],['nickname','별칭'],['name','자산명'],['number','번호'],['isActive','활성'],['scrapHistory.lastCompletedAt','수집 성공']],
 organizations:[['organizationName','기관'],['organization','기관 구분'],['businessType','업무 구분'],['clientType','개인·기업'],['isConnected','연결']],
 references:[['ticketReferenceId','연결 번호'],['id','상대 티켓'],['referenceableType','종류'],['content','내용'],['amount','금액']],
 daily:[['organizationName','기관'],['assetName','계좌'],['currencyCode','통화'],['previousBalance','이전 잔액(원화)'],['inAmount','입금'],['outAmount','출금'],['currentBalance','잔액(원화)'],['isLoan','대출']],
 balances:[['account','계좌'],['baseDate','기준일'],['accountBalance','잔액(원화 환산)'],['originalBalance','원통화 잔액'],['currency','통화'],['loan','대출']],
 salary:[['id','번호'],['employeeName','직원'],['paymentDate','지급일'],['totalAmount','총 급여'],['netAmount','실지급액'],['salaryPaymentStatus','지급 상태']],
 workflows:[['id','번호'],['title','제목'],['user.name','기안자'],['status','상태'],['amount','금액'],['currency','통화'],['expectedPaymentDate','지급예정일']],
 attendance:[['timeCard.userId','구성원 번호'],['timeCard.baseDate','날짜'],['timeCard.startedAt','출근'],['timeCard.endedAt','퇴근'],['leaveRecord.status','휴가 상태']],
 leave:[['userId','구성원 번호'],['theoreticalDays','기준 연차'],['adjustmentDays','조정 연차'],['isUnlimited','무제한'],['employmentDate','입사일']],
 'leave-history':[['id','번호'],['userId','구성원 번호'],['occurredAt','일자'],['type','종류'],['days','일수'],['memo','메모']],
 inventory:[['id','번호'],['name','품목'],['quantity','재고'],['unitPrice','단가'],['currency','통화'],['modifiedAt','수정일']],
 contacts:[['id','번호'],['companyName','거래처'],['registrationNumber','사업자번호'],['ceoName','대표자'],['email','이메일'],['tel','전화']],
 categories:[['id','번호'],['name','계정과목'],['subInfo','상위 분류'],['costType','비용 유형'],['description','설명']],
 tags:[['id','번호'],['name','이름'],['description','설명']],
 people:[['id','번호'],['name','이름'],['email','이메일'],['isDeleted','삭제 여부']],
 history:[['created_at','요청 시각'],['operation','업무'],['state','처리 상태'],['result_id','결과 번호']]
};
export const labels:Record<string,string>={id:'번호',workspaceId:'회사 번호',companyName:'회사명',name:'이름',description:'설명',title:'제목',content:'내용',amount:'금액',currency:'통화',currencyCode:'통화',date:'날짜',baseDate:'기준일',status:'상태',createdAt:'생성일',modifiedAt:'수정일',email:'이메일',phone:'휴대전화',number:'번호',isActive:'활성',isHidden:'숨김',total:'합계',assets:'자산',currentBalance:'현재 잔액',previousBalance:'이전 잔액',inAmount:'입금',outAmount:'출금',loanBalance:'대출 잔액',netPosition:'순잔액',theoreticalDays:'기준 연차',adjustmentDays:'조정 연차',employee:'직원',netAmount:'실지급액',totalAmount:'총금액',supplyValue:'공급가액',taxAmount:'세액',vat:'부가세',tradeItems:'품목',supplier:'공급자',contractor:'공급받는 자',buyer:'구매자',issuer:'발행자',taxExemptions:'비과세 항목',allowances:'수당',deductions:'공제',incentives:'인센티브',pensionInsuranceAmount:'국민연금',healthInsuranceAmount:'건강보험',employInsuranceAmount:'고용보험',careInsuranceAmount:'장기요양보험',incomeTaxAmount:'소득세',localIncomeTaxAmount:'지방소득세',ticketTags:'태그',contact:'거래처',expenseCategory:'계정과목',balance:'잔액',bankAccount:'계좌',card:'카드',securitiesAccount:'증권 계좌',isIncluded:'포함 여부',isConnected:'연결 여부',enabled:'조회 가능',holidays:'공휴일',dates:'일자',plan:'요금제',subscription:'구독',users:'사용자',teams:'팀',rows:'조회 결과',message:'처리 안내',ticketReferences:'연결내역',messages:'댓글·변경 기록',attachments:'첨부파일',targetType:'연결 종류',targetId:'연결 대상',purpose:'연결 목적',uploadedUrl:'파일 주소',commentCount:'댓글 수',attachmentCount:'첨부 수'};
export function valueAt(row:unknown,path:string):unknown{return path.split('.').reduce<unknown>((v,k)=>v&&typeof v==='object'&&!Array.isArray(v)?(v as Record<string,unknown>)[k]:undefined,row);}
