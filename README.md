# kanghyeonjun-crm
강현준 CRM — 병원 정보, 제안서, 영업 진행과 연락 이력을 관리하는 CRM


## 현재 상태

새 CRM의 초기 화면과 빌드 기반입니다. 데이터베이스, 사용자 인증, 병원 관리 기능은 아직 연결되지 않았습니다. 실제 병원 데이터와 비밀키는 저장소에 포함하지 않습니다.

## 로컬 실행

Node.js 24에서 실행합니다.

```sh
npm ci
npm run dev
```

검증: `npm run build` 및 `npm run typecheck`. `/api/health`는 앱 실행 상태만 확인하며 DB 연결 검증은 아직 구현되지 않았습니다.

세부 구현 범위는 [초기 기반 문서](docs/foundation.md)를 참고하세요.
