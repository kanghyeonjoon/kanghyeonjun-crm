# 몽PD 랜딩 / CRM 통합

목표 도메인: mongpd.com(랜딩), crm.mongpd.com(CRM).
현재 원본 랜딩: kanghyeonjoon/mongpd-web main. 기존 CRM 코드: codex/app-foundation 7cefdd4.

## 구현
- 동일 Next.js 앱 안에서 랜딩과 인증된 CRM을 라우트 그룹으로 분리.
- /diagnosis 자체 3단계 신청서: 기존 Tally의 9개 문항 반영.
- 접수와 알림 작업 3종을 DB 트랜잭션으로 저장. 요청 ID 기반 중복 방지, IP 해시 기준 시간당 5건 제한.
- CRM 회원만 /workspace/diagnoses에서 조회. 외부 익명 조회·수정 불가.
- 관리자 이메일: ekrk5614@gmail.com. 신청자 접수 확인 + 관리자 이메일.
- 알림톡은 승인된 몽PD 템플릿이 없어 기본 비활성. SMS 대체 발송 없음.
- 전송 결과 accepted는 업체 접수 의미이며 실제 수신 완료가 아님. uncertain은 수동 확인, 자동 재전송하지 않음.

## 운영 연결에 필요한 서버 전용 환경변수
SUPABASE_SECRET_KEY (또는 SUPABASE_SERVICE_ROLE_KEY)
RESEND_API_KEY
MAIL_FROM (인증된 몽PD 발신 주소)
DIAGNOSIS_ADMIN_EMAIL=ekrk5614@gmail.com
DIAGNOSIS_NOTIFICATIONS_ENABLED=true (발신자 설정·검증 후)
DIAGNOSIS_ALIMTALK_ENABLED=false

알림톡 승인 후 SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_PFID, SOLAPI_TEMPLATE_ID, SOLAPI_SENDER 설정. 템플릿 변수는 현재 #{이름}. 실제 승인된 템플릿 변수와 일치하도록 검증한 뒤 활성화.

## 알림톡 심사 문안 초안 (미제출)
#{이름}님, 몽PD 무료진단 신청이 접수되었습니다.
신청 내용을 검토한 뒤 선정 및 일정 안내를 위해 연락드리겠습니다.
접수만으로 진단 일정이 확정되는 것은 아닙니다.
문의: ekrk5614@gmail.com

## 검증 및 남은 작업
- 로컬 production build 성공, 기존 CRM DB 테스트와 신규 접수 RLS/중복/제한/동의 테스트 통과.
- Supabase migration 20261002074002 적용. 접수 테이블 0건 및 RLS 활성화 확인.
- 로컬 브라우저에서 3단계 입력 전환 확인. 실제 이메일/알림톡 발송 없음.
- 서버 secret key 저장은 사용자 확인 대기. Resend 발신 주소/도메인 설정 대기.
- 운영 폼 접수까지 검증한 후 Vercel 도메인 이동, Gabia crm DNS 추가 및 Supabase 인증 URL 설정 필요.
- 기존 시작 키트/결제/안내봇 API는 mongpd-web-three.vercel.app로 호환 연결. 관련 기존 프로젝트를 삭제하면 안 됨.
- 분석 스크립트 재연결과 동의/개인정보 고지 최종 점검 필요. 아직 운영 도메인 전환 안 함.
