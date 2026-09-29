# 강현준 CRM

병원 정보·제안서 링크·영업 진행을 관리하는 새 CRM입니다. Supabase Auth 로그인과 승인된 회원의 RLS 접근 제어, 등록·수정·검색, 상태 필터, 변경 이력, 동시 수정 충돌 방지를 구현했습니다.

## 실행

Node.js 24를 사용합니다. `.env.example`을 참고해 `.env.local`에 새 Supabase 프로젝트의 공개용 연결 값을 등록합니다. 서비스 역할 키는 사용하지 않습니다.

```sh
npm ci
npm run dev
```

초기 DB에는 `supabase/migrations/202609290001_crm.sql`을 적용합니다. [계정 등록 및 운영 문서](docs/crm-v1.md)를 따라 관리자 계정과 허용 이메일을 등록해야 로그인 후 업무 화면을 사용할 수 있습니다.

```sh
npm run build
npm run typecheck
npm test
```

`/api/health`는 실제 DB 상태 확인 함수를 호출합니다. 기존 병원 자료·연락처·내부 문서·비밀키는 저장소에 포함하지 않습니다. 기존 데이터 자동 이관, 고객 메시지 발송, 결제·주문·환자 정보 기능은 구현하지 않았습니다.
