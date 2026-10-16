import {z} from 'zod';
export const consentVersion='2026-10-02';
export const diagnosisSchema=z.object({
 requestId:z.uuid(),
 source:z.enum(['스레드','유튜브','소개','기타']),
 name:z.string().trim().min(1).max(80),
 email:z.email().max(254),
 phone:z.string().transform(v=>v.replace(/\D/g,'')).pipe(z.string().regex(/^01[016789]\d{7,8}$/)),
 reason:z.string().trim().min(5,'신청 이유를 5자 이상 작성해 주세요.').max(4000),
 gender:z.enum(['여자','남자']),
 age:z.enum(['20대','30대','40대','50대','60대 이상']),
 channelUrl:z.string().trim().max(1000).refine(v=>v==='없음'||/^https?:\/\//i.test(v)&&URL.canParse(v),'유튜브 주소 또는 없음으로 입력해 주세요.'),
 consent:z.literal(true),
 website:z.string().max(0).optional(),
});
export type DiagnosisInput=z.infer<typeof diagnosisSchema>;
export const receiptSubject='[몽PD] 무료진단 신청이 접수되었습니다';
export function receiptText(name:string){return `${name}님, 몽PD 무료진단 신청이 접수되었습니다.\n\n신청 내용을 검토한 뒤 선정 및 일정 안내를 위해 연락드리겠습니다. 접수만으로 진단 일정이 확정되는 것은 아닙니다.\n\n문의: ekrk5614@gmail.com\n몽PD · 비즈니스 아나토미`;}
