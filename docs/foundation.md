# 애플리케이션 기반

Next.js App Router / React / TypeScript로 새 앱을 시작한다. 의존성은 package-lock.json에 고정했다.

## 로컬 실행

Node.js 24에서 npm ci → npm run build → npm run typecheck로 확인한다. 개발 화면은 npm run dev, 빌드 결과 실행은 npm start를 사용한다.

## 구현된 범위

- 한국어 시작 화면, 모바일 레이아웃, 검색엔진 제외 지시
- /api/health: 웹 앱 기동 확인. DB 상태는 not_connected로 명시
- CI 빌드·타입 검사

현재 인증, DB 연결, 업무 데이터 API, 고객 정보, 외부 발송은 구현하지 않았다. 대시보드 수량을 실제 데이터처럼 만들어 표시하지 않는다. 환경 변수가 없어도 이 초기 화면은 빌드된다.

다음 단계는 새 DB 프로젝트 생성 후 세션 인증·역할·RLS·마이그레이션을 함께 연결하는 것이다. 그 전에는 실제 데이터를 추가하지 않는다. /api/health의 database 값은 연결 구현 시 실제 검증으로 대체해야 한다.

참고: [Next.js 설치](https://nextjs.org/docs/app/getting-started/installation), [Supabase 서버 인증](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).
